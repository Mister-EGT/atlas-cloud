import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { Color, MeshPhongMaterial, type PerspectiveCamera } from "three";
import type { CloudRegion } from "../data/regions";
import {
  createMarkerElement,
  groupRegions,
  filterMarkersForView,
  type GlobeMarker,
} from "./globeMarkers";
import { getSelectionPointOfView } from "./globeView";
import { countryFeatures } from "./worldMapData";

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
  const [size, setSize] = useState({ width: 700, height: 700 });
  const [viewpoint, setViewpoint] = useState({ lat: 28, lng: 10, altitude: 1.92 });
  const primarySelected = selectedRegions[0];
  const markers = useMemo(() => groupRegions(regions, clusterMarkers), [regions, clusterMarkers]);
  const visibleMarkers = useMemo(() => filterMarkersForView(markers, viewpoint, primarySelected?.id), [markers, primarySelected?.id, viewpoint]);
  const globeMaterial = useMemo(() => new MeshPhongMaterial({
    color: new Color("#102438"),
    emissive: new Color("#071522"),
    emissiveIntensity: 0.55,
    shininess: 1.2,
  }), []);

  const createHtmlMarker = useCallback((item: object) => {
    const marker = item as GlobeMarker;
    const selected = selectedRegions.some((region) => marker.regions.some((candidate) => candidate.id === region.id));
    const { button, tooltip: tooltipElement } = createMarkerElement(marker, selected);
    const showTooltip = () => {
      button.classList.add("is-hovered");
      const controls = globeRef.current?.controls();
      if (controls) controls.autoRotate = false;
      tooltipElement.style.visibility = "visible";
      tooltipElement.style.opacity = "1";
      tooltipElement.style.transform = "translate(-50%, 0) scale(1)";
    };
    const hideTooltip = () => {
      button.classList.remove("is-hovered");
      const controls = globeRef.current?.controls();
      if (controls) controls.autoRotate = autoRotate;
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
      onSelect(marker.regions);
    });
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
          htmlElementsData={visibleMarkers}
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
          onZoom={(next) => setViewpoint({ lat: next.lat, lng: next.lng, altitude: next.altitude })}
        />
      </div>
      <div className="globe-controls" aria-label="Kartensteuerung">
        <button type="button" onClick={() => adjustZoom("in")} aria-label="Vergrößern"><span aria-hidden="true">+</span></button>
        <button type="button" onClick={() => adjustZoom("out")} aria-label="Verkleinern"><span aria-hidden="true">−</span></button>
        <button type="button" onClick={reset} aria-label="Ansicht zurücksetzen"><span aria-hidden="true">◎</span></button>
      </div>
    </>
  );
}
