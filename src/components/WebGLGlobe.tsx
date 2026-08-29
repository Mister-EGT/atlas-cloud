import { LocateFixed, Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { Color, MeshPhongMaterial, TOUCH, type PerspectiveCamera } from "three";
import { PROVIDERS, type CloudRegion } from "../data/regions";
import {
  getMarkerAriaLabel,
  getMarkerLocation,
  getMarkerProviderStates,
  groupRegions,
  type GlobeMarker,
} from "./globeMarkers";
import { getSelectionPointOfView } from "./globeView";
import { getGlobeMarkerZoomState } from "./globeMarkerZoom";
import {
  findNearestMarkerTarget,
  isTapGesture,
  preventGlobePageGesture,
  supportsMarkerPreview,
  type PointerStart,
} from "./touchSupport";
import { countryFeatures } from "./worldMapData";

interface MarkerInteraction {
  marker: GlobeMarker;
  showTooltip: (persistent?: boolean) => void;
  hideTooltip: (clearPersistent?: boolean) => void;
}

export interface WebGLGlobeProps {
  regions: CloudRegion[];
  selectedRegions: CloudRegion[];
  clusterMarkers: boolean;
  autoRotate: boolean;
  atmosphere: boolean;
  onSelect: (regions: CloudRegion[]) => void;
}

export function WebGLGlobe({ regions, selectedRegions, clusterMarkers, autoRotate, atmosphere, onSelect }: WebGLGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const hasAppliedInitialViewRef = useRef(false);
  const markerInteractionsRef = useRef(new WeakMap<HTMLElement, MarkerInteraction>());
  const activeMarkerInteractionRef = useRef<MarkerInteraction | null>(null);
  const pointerStartsRef = useRef(new Map<number, PointerStart>());
  const hadMultipleTouchesRef = useRef(false);
  const touchPreviewRegionIdRef = useRef<string | null>(null);
  const markerSelectionEnabledRef = useRef(false);
  const [size, setSize] = useState({ width: 700, height: 700 });
  const primarySelected = selectedRegions[0];
  const markers = useMemo(() => groupRegions(regions, clusterMarkers), [regions, clusterMarkers]);
  const globeMaterial = useMemo(() => new MeshPhongMaterial({
    color: new Color("#102438"),
    emissive: new Color("#071522"),
    emissiveIntensity: 0.55,
    shininess: 1.2,
  }), []);

  const createHtmlMarker = useCallback((item: object) => {
    const marker = item as GlobeMarker;
    const providerStates = getMarkerProviderStates(marker);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "globe-html-marker";
    button.dataset.regionCodes = marker.regions.map((region) => region.code ?? region.id).join(" ");
    button.dataset.providerCount = String(marker.providers.length);
    button.setAttribute("aria-label", getMarkerAriaLabel(marker));
    button.setAttribute("aria-disabled", markerSelectionEnabledRef.current ? "false" : "true");
    if (selectedRegions.some((selected) => marker.regions.some((region) => region.id === selected.id))) {
      button.classList.add("is-selected");
    }

    providerStates.forEach((providerState) => {
      const dot = document.createElement("span");
      dot.className = `globe-html-marker__dot is-${providerState.status}`;
      dot.style.setProperty("--marker-color", PROVIDERS[providerState.provider].color);
      dot.setAttribute("aria-hidden", "true");
      button.append(dot);
    });

    const tooltipElement = document.createElement("span");
    tooltipElement.className = "globe-html-marker__tooltip";
    const providerElement = document.createElement("span");
    providerElement.className = "globe-html-marker__providers";
    providerStates.forEach((providerState) => {
      const providerBadge = document.createElement("small");
      providerBadge.className = `is-${providerState.status}`;
      providerBadge.style.setProperty("--provider-color", PROVIDERS[providerState.provider].color);
      providerBadge.textContent = `${PROVIDERS[providerState.provider].shortName}${providerState.status === "planned" ? " · geplant" : providerState.status === "mixed" ? " · aktiv + geplant" : ""}`;
      providerElement.append(providerBadge);
    });
    const nameElement = document.createElement("strong");
    nameElement.textContent = marker.regions.length === 1
      ? marker.regions[0].name
      : `${marker.regions.length} Standorte bei ${getMarkerLocation(marker)}`;
    const regionList = document.createElement("span");
    regionList.className = "globe-html-marker__regions";
    marker.regions.forEach((region) => {
      const regionLine = document.createElement("span");
      const codeElement = document.createElement("code");
      codeElement.textContent = region.code ?? "Code folgt";
      const regionName = document.createElement("span");
      regionName.textContent = region.name;
      regionLine.append(codeElement, regionName);
      regionList.append(regionLine);
    });
    const metaElement = document.createElement("span");
    metaElement.className = "globe-html-marker__interaction-hint";
    const first = marker.regions[0];
    const enabledHint = marker.regions.length > 1
      ? "Klicken, um alle Details zu öffnen"
      : first.zones
        ? `${first.zones} Zonen`
        : first.availabilityZones
          ? "Verfügbarkeitszonen unterstützt"
          : first.country;
    metaElement.dataset.enabledText = enabledHint;
    metaElement.textContent = markerSelectionEnabledRef.current ? enabledHint : "Zum Auswählen näher heranzoomen";

    tooltipElement.append(providerElement, nameElement, regionList, metaElement);
    button.append(tooltipElement);
    const showTooltip = (persistent = false) => {
      if (persistent) touchPreviewRegionIdRef.current = marker.regions[0].id;
      button.classList.add("is-hovered");
      const controls = globeRef.current?.controls();
      if (controls) controls.autoRotate = false;
      tooltipElement.style.visibility = "visible";
      tooltipElement.style.opacity = "1";
      tooltipElement.style.transform = "translate(-50%, 0) scale(1)";
    };
    const hideTooltip = (clearPersistent = true) => {
      if (clearPersistent && marker.regions.some((region) => region.id === touchPreviewRegionIdRef.current)) {
        touchPreviewRegionIdRef.current = null;
      }
      button.classList.remove("is-hovered");
      const controls = globeRef.current?.controls();
      if (controls) controls.autoRotate = autoRotate && selectedRegions.length === 0;
      tooltipElement.style.removeProperty("visibility");
      tooltipElement.style.removeProperty("opacity");
      tooltipElement.style.removeProperty("transform");
    };
    button.addEventListener("focus", () => {
      showTooltip();
    });
    button.addEventListener("blur", () => {
      hideTooltip();
    });
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!markerSelectionEnabledRef.current) return;
      showTooltip();
      onSelect(marker.regions);
    });
    const interaction = { marker, showTooltip, hideTooltip };
    markerInteractionsRef.current.set(button, interaction);
    if (marker.regions.some((region) => region.id === touchPreviewRegionIdRef.current)) {
      showTooltip(true);
      activeMarkerInteractionRef.current = interaction;
    }
    return button;
  }, [autoRotate, onSelect, selectedRegions]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.max(320, Math.floor(entry.contentRect.width));
      const height = Math.max(390, Math.floor(entry.contentRect.height));
      setSize({ width, height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const getNearestInteraction = (clientX: number, clientY: number, pointerType: string, requireSelectable = false) => {
      if (requireSelectable && !markerSelectionEnabledRef.current) return null;
      const targets = [...container.querySelectorAll<HTMLElement>(".globe-html-marker")]
        .map((element) => {
          const interaction = markerInteractionsRef.current.get(element);
          const rect = element.getBoundingClientRect();
          if (!interaction || rect.width === 0 || rect.height === 0 || getComputedStyle(element).visibility === "hidden") {
            return null;
          }
          return {
            value: interaction,
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2,
          };
        })
        .filter((target): target is NonNullable<typeof target> => target !== null);
      return findNearestMarkerTarget(targets, clientX, clientY, pointerType);
    };
    const hideActiveTooltip = () => {
      activeMarkerInteractionRef.current?.hideTooltip();
      activeMarkerInteractionRef.current = null;
    };
    const handlePointerDown = (event: PointerEvent) => {
      pointerStartsRef.current.set(event.pointerId, { id: event.pointerId, x: event.clientX, y: event.clientY });
      if (event.pointerType === "touch" && [...pointerStartsRef.current.keys()].length > 1) {
        hadMultipleTouchesRef.current = true;
        hideActiveTooltip();
      }
    };
    const handlePointerMove = (event: PointerEvent) => {
      const start = pointerStartsRef.current.get(event.pointerId) ?? null;
      if (event.pointerType === "touch") {
        if (!isTapGesture(start, { id: event.pointerId, x: event.clientX, y: event.clientY }, event.pointerType)) {
          hideActiveTooltip();
        }
        return;
      }
      if (!supportsMarkerPreview(event.pointerType)) return;
      const nearest = getNearestInteraction(event.clientX, event.clientY, event.pointerType);
      if (nearest === activeMarkerInteractionRef.current) return;
      activeMarkerInteractionRef.current?.hideTooltip();
      activeMarkerInteractionRef.current = nearest;
      nearest?.showTooltip();
    };
    const handlePointerUp = (event: PointerEvent) => {
      const start = pointerStartsRef.current.get(event.pointerId) ?? null;
      const wasMultiTouch = event.pointerType === "touch" && hadMultipleTouchesRef.current;
      pointerStartsRef.current.delete(event.pointerId);
      if (pointerStartsRef.current.size === 0) hadMultipleTouchesRef.current = false;
      if (wasMultiTouch || !isTapGesture(start, { id: event.pointerId, x: event.clientX, y: event.clientY }, event.pointerType)) {
        return;
      }
      const nearest = getNearestInteraction(event.clientX, event.clientY, event.pointerType, true);
      hideActiveTooltip();
      if (!nearest) return;
      activeMarkerInteractionRef.current = nearest;
      nearest.showTooltip(event.pointerType === "touch");
      onSelect(nearest.marker.regions);
    };
    const handlePointerCancel = (event: PointerEvent) => {
      pointerStartsRef.current.delete(event.pointerId);
      if (pointerStartsRef.current.size === 0) hadMultipleTouchesRef.current = false;
    };
    const handlePointerLeave = (event: PointerEvent) => {
      if (supportsMarkerPreview(event.pointerType) && touchPreviewRegionIdRef.current === null) hideActiveTooltip();
    };
    const blockPageGesture = (event: Event) => preventGlobePageGesture(event);
    const listenerOptions: AddEventListenerOptions = { passive: false };
    container.addEventListener("pointerdown", handlePointerDown, true);
    container.addEventListener("pointermove", handlePointerMove, true);
    container.addEventListener("pointerup", handlePointerUp, true);
    container.addEventListener("pointercancel", handlePointerCancel, true);
    container.addEventListener("pointerleave", handlePointerLeave, true);
    container.addEventListener("touchmove", blockPageGesture, listenerOptions);
    container.addEventListener("gesturestart", blockPageGesture, listenerOptions);
    container.addEventListener("gesturechange", blockPageGesture, listenerOptions);
    return () => {
      container.removeEventListener("pointerdown", handlePointerDown, true);
      container.removeEventListener("pointermove", handlePointerMove, true);
      container.removeEventListener("pointerup", handlePointerUp, true);
      container.removeEventListener("pointercancel", handlePointerCancel, true);
      container.removeEventListener("pointerleave", handlePointerLeave, true);
      container.removeEventListener("touchmove", blockPageGesture, listenerOptions);
      container.removeEventListener("gesturestart", blockPageGesture, listenerOptions);
      container.removeEventListener("gesturechange", blockPageGesture, listenerOptions);
    };
  }, [onSelect]);

  const updateMarkerZoom = useCallback(({ altitude }: { altitude: number }) => {
    const container = containerRef.current;
    if (!container) return;
    const state = getGlobeMarkerZoomState(altitude);
    const selectionChanged = markerSelectionEnabledRef.current !== state.selectable;
    markerSelectionEnabledRef.current = state.selectable;
    container.style.setProperty("--globe-marker-scale", state.scale.toFixed(3));
    container.dataset.markerScale = state.scale.toFixed(3);
    container.dataset.markerSelection = state.selectable ? "enabled" : "locked";
    if (!selectionChanged) return;
    container.querySelectorAll<HTMLElement>(".globe-html-marker").forEach((element) => {
      element.setAttribute("aria-disabled", state.selectable ? "false" : "true");
    });
    container.querySelectorAll<HTMLElement>(".globe-html-marker__interaction-hint").forEach((element) => {
      element.textContent = state.selectable
        ? element.dataset.enabledText ?? "Details öffnen"
        : "Zum Auswählen näher heranzoomen";
    });
  }, []);

  useEffect(() => {
    if (!selectedRegions.some((region) => region.id === touchPreviewRegionIdRef.current)) {
      touchPreviewRegionIdRef.current = null;
    }
  }, [selectedRegions]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    const controls = globe.controls();
    controls.autoRotate = autoRotate && selectedRegions.length === 0;
    controls.autoRotateSpeed = 0.45;
    controls.enableDamping = true;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.dampingFactor = 0.08;
    controls.touches.ONE = TOUCH.ROTATE;
    controls.touches.TWO = TOUCH.DOLLY_ROTATE;
    controls.minDistance = 135;
    controls.maxDistance = 480;
  }, [autoRotate, selectedRegions.length]);

  useEffect(() => {
    if (!primarySelected || !globeRef.current) return;
    const preserveZoom = hasAppliedInitialViewRef.current;
    hasAppliedInitialViewRef.current = true;
    globeRef.current.pointOfView(getSelectionPointOfView(primarySelected, preserveZoom), 650);
  }, [primarySelected?.id]);

  const adjustZoom = (direction: "in" | "out") => {
    const globe = globeRef.current;
    if (!globe) return;
    const camera = globe.camera() as PerspectiveCamera;
    const nextLength = Math.min(480, Math.max(135, camera.position.length() * (direction === "in" ? 0.82 : 1.22)));
    camera.position.setLength(nextLength);
    camera.updateProjectionMatrix();
    globe.controls().update();
  };

  const reset = () => globeRef.current?.pointOfView({ lat: 28, lng: 10, altitude: 1.92 }, 700);

  return (
    <>
      <div className="globe-stage__canvas" ref={containerRef} data-render-mode="3d" data-marker-selection="locked">
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl={null as unknown as string}
          bumpImageUrl={null as unknown as string}
          globeMaterial={globeMaterial}
          showAtmosphere={atmosphere}
          atmosphereColor="#8fc8ff"
          atmosphereAltitude={0.13}
          polygonsData={countryFeatures}
          polygonCapColor={() => "rgba(42, 55, 68, 0.96)"}
          polygonSideColor={() => "rgba(8, 20, 31, 0.7)"}
          polygonStrokeColor={() => "rgba(255, 255, 255, 0.14)"}
          polygonAltitude={0.004}
          polygonsTransitionDuration={0}
          htmlElementsData={markers}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude={0.014}
          htmlElement={createHtmlMarker}
          htmlTransitionDuration={180}
          ringsData={primarySelected ? [primarySelected] : []}
          ringLat="lat"
          ringLng="lng"
          ringColor={() => (time: number) => `rgba(48, 93, 222, ${1 - time})`}
          ringMaxRadius={2.7}
          ringPropagationSpeed={2.4}
          ringRepeatPeriod={1150}
          enablePointerInteraction
          onZoom={updateMarkerZoom}
          onGlobeReady={() => updateMarkerZoom(globeRef.current?.pointOfView() ?? { altitude: 1.92 })}
        />
      </div>
      <div className="globe-controls" aria-label="Kartensteuerung">
        <button type="button" onClick={() => adjustZoom("in")} aria-label="Vergrößern"><Plus /></button>
        <button type="button" onClick={() => adjustZoom("out")} aria-label="Verkleinern"><Minus /></button>
        <button type="button" onClick={reset} aria-label="Ansicht zurücksetzen"><LocateFixed /></button>
      </div>
    </>
  );
}
