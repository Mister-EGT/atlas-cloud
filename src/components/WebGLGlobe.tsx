import { LocateFixed, Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { Color, MeshPhongMaterial, type PerspectiveCamera } from "three";
import { PROVIDERS, type CloudRegion } from "../data/regions";
import { groupRegions, type GlobeMarker } from "./globeMarkers";
import { countryFeatures } from "./worldMapData";

export interface WebGLGlobeProps {
  regions: CloudRegion[];
  selected: CloudRegion | null;
  clusterMarkers: boolean;
  autoRotate: boolean;
  atmosphere: boolean;
  onSelect: (region: CloudRegion) => void;
}

export function WebGLGlobe({ regions, selected, clusterMarkers, autoRotate, atmosphere, onSelect }: WebGLGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [size, setSize] = useState({ width: 700, height: 700 });
  const markers = useMemo(() => groupRegions(regions, clusterMarkers), [regions, clusterMarkers]);
  const globeMaterial = useMemo(() => new MeshPhongMaterial({
    color: new Color("#102438"),
    emissive: new Color("#071522"),
    emissiveIntensity: 0.55,
    shininess: 1.2,
  }), []);

  const createHtmlMarker = useCallback((item: object) => {
    const marker = item as GlobeMarker;
    const first = marker.regions[0];
    const provider = marker.provider === "mixed" ? "Mehrere Anbieter" : PROVIDERS[marker.provider].name;
    const markerColor = marker.provider === "mixed"
      ? "#f5f7fa"
      : first.status === "planned"
        ? "#9aa4af"
        : PROVIDERS[marker.provider].color;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "globe-html-marker";
    button.dataset.regionCodes = marker.regions.map((region) => region.code ?? region.id).join(" ");
    button.style.setProperty("--marker-color", markerColor);
    button.setAttribute("aria-label", `${first.name}, ${first.location} auswählen`);
    if (selected && marker.regions.some((region) => region.id === selected.id)) {
      button.classList.add("is-selected");
    }

    const tooltipElement = document.createElement("span");
    tooltipElement.className = "globe-html-marker__tooltip";
    const providerElement = document.createElement("small");
    providerElement.textContent = provider;
    const nameElement = document.createElement("strong");
    nameElement.textContent = first.name;
    const codeElement = document.createElement("code");
    codeElement.textContent = first.code ?? "Code folgt";
    const metaElement = document.createElement("span");
    metaElement.textContent = marker.regions.length > 1
      ? `${marker.regions.length} Regionen an diesem Standort`
      : first.zones
        ? `${first.zones} Zonen`
        : first.availabilityZones
          ? "Verfügbarkeitszonen unterstützt"
          : first.country;

    tooltipElement.append(providerElement, nameElement, codeElement, metaElement);
    button.append(tooltipElement);
    const showTooltip = () => {
      button.classList.add("is-hovered");
      tooltipElement.style.visibility = "visible";
      tooltipElement.style.opacity = "1";
      tooltipElement.style.transform = "translate(-50%, 0) scale(0.8)";
    };
    const hideTooltip = () => {
      button.classList.remove("is-hovered");
      tooltipElement.style.removeProperty("visibility");
      tooltipElement.style.removeProperty("opacity");
      tooltipElement.style.removeProperty("transform");
    };
    button.addEventListener("mouseenter", showTooltip);
    button.addEventListener("mouseleave", hideTooltip);
    button.addEventListener("focus", showTooltip);
    button.addEventListener("blur", hideTooltip);
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      onSelect(first);
    });
    return button;
  }, [onSelect, selected]);

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
    const globe = globeRef.current;
    if (!globe) return;
    const controls = globe.controls();
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.45;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 135;
    controls.maxDistance = 480;
  }, [autoRotate]);

  useEffect(() => {
    if (!selected || !globeRef.current) return;
    globeRef.current.pointOfView({ lat: selected.lat, lng: selected.lng, altitude: 1.85 }, 650);
  }, [selected?.id]);

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
      <div className="globe-stage__canvas" ref={containerRef} data-render-mode="3d">
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
          ringsData={selected ? [selected] : []}
          ringLat="lat"
          ringLng="lng"
          ringColor={() => (time: number) => `rgba(48, 93, 222, ${1 - time})`}
          ringMaxRadius={2.7}
          ringPropagationSpeed={2.4}
          ringRepeatPeriod={1150}
          enablePointerInteraction
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
