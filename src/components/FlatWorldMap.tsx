import { geoNaturalEarth1, geoPath } from "d3-geo";
import { LocateFixed, Minus, Plus } from "lucide-react";
import { useMemo, useRef, useState, type CSSProperties } from "react";
import { PROVIDERS, type CloudRegion } from "../data/regions";
import {
  getMarkerAriaLabel,
  getMarkerLocation,
  getMarkerProviderStates,
  groupRegions,
  type GlobeMarker,
} from "./globeMarkers";
import { countryFeatureCollection, countryFeatures } from "./worldMapData";

const MAP_WIDTH = 960;
const MAP_HEIGHT = 560;

const PROVIDER_DOT_POSITIONS = {
  1: [[0, 0]],
  2: [[-3.2, 0], [3.2, 0]],
  3: [[-3.7, 1.5], [0, -2.8], [3.7, 1.5]],
  4: [[-3, -3], [3, -3], [-3, 3], [3, 3]],
} as const;

export function FlatWorldMap({ regions, selectedRegions, clusterMarkers, onSelect }: {
  regions: CloudRegion[];
  selectedRegions: CloudRegion[];
  clusterMarkers: boolean;
  onSelect: (regions: CloudRegion[]) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [hovered, setHovered] = useState<{
    marker: GlobeMarker;
    left: number;
    top: number;
    placement: "above" | "below";
  } | null>(null);
  const markers = useMemo(() => groupRegions(regions, clusterMarkers), [regions, clusterMarkers]);
  const projection = useMemo(
    () => geoNaturalEarth1().fitExtent([[28, 32], [MAP_WIDTH - 28, MAP_HEIGHT - 32]], countryFeatureCollection as never),
    [],
  );
  const path = useMemo(() => geoPath(projection), [projection]);
  const countryPaths = useMemo(
    () => countryFeatures.map((country) => path(country as never) ?? undefined),
    [path],
  );
  const projectedMarkers = useMemo(() => markers.map((marker) => ({
    marker,
    point: projection([marker.lng, marker.lat]),
  })), [markers, projection]);

  const showTooltip = (marker: GlobeMarker, element: SVGGElement) => {
    const mapRect = mapRef.current?.getBoundingClientRect();
    if (!mapRect) return;
    const markerRect = element.getBoundingClientRect();
    const markerCenter = markerRect.left - mapRect.left + markerRect.width / 2;
    const markerTop = markerRect.top - mapRect.top;
    const tooltipWidth = Math.min(360, mapRect.width - 32);
    const tooltipHalfWidth = tooltipWidth / 2;
    setHovered({
      marker,
      left: Math.min(mapRect.width - tooltipHalfWidth - 8, Math.max(tooltipHalfWidth + 8, markerCenter)),
      top: markerTop,
      placement: markerTop < 210 ? "below" : "above",
    });
  };

  const adjustZoom = (direction: "in" | "out") => {
    setZoom((current) => Math.min(2.2, Math.max(1, current + (direction === "in" ? 0.25 : -0.25))));
  };

  return (
    <div className="flat-map" data-render-mode="2d" ref={mapRef}>
      <div className="flat-map__badge" role="status">2D-Kompatibilitätsansicht</div>
      <svg className="flat-map__svg" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label="Interaktive zweidimensionale Weltkarte der Cloud-Standorte">
        <defs>
          <radialGradient id="flat-ocean" cx="50%" cy="42%" r="68%">
            <stop offset="0" stopColor="#18324a" />
            <stop offset="1" stopColor="#081b2d" />
          </radialGradient>
          <filter id="flat-map-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0a1b2b" floodOpacity="0.22" />
          </filter>
        </defs>
        <rect x="18" y="20" width="924" height="520" rx="70" fill="url(#flat-ocean)" filter="url(#flat-map-shadow)" />
        <g className="flat-map__content" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
          {countryPaths.map((countryPath, index) => <path key={index} d={countryPath} />)}
          {projectedMarkers.map(({ marker, point }) => {
            if (!point) return null;
            const providerStates = getMarkerProviderStates(marker);
            const isSelected = selectedRegions.some((selected) => marker.regions.some((region) => region.id === selected.id));
            const dotPositions = PROVIDER_DOT_POSITIONS[providerStates.length as 1 | 2 | 3 | 4];
            const isCluster = marker.regions.length > 1;
            return (
              <g
                key={marker.regions.map((region) => region.id).join(":")}
                className={`flat-map__marker ${isSelected ? "is-selected" : ""}`}
                data-region-codes={marker.regions.map((region) => region.code ?? region.id).join(" ")}
                data-provider-count={marker.providers.length}
                data-marker-status={marker.status}
                role="button"
                tabIndex={0}
                aria-label={getMarkerAriaLabel(marker)}
                transform={`translate(${point[0]} ${point[1]})`}
                onMouseEnter={(event) => showTooltip(marker, event.currentTarget)}
                onMouseLeave={() => setHovered(null)}
                onFocus={(event) => showTooltip(marker, event.currentTarget)}
                onBlur={() => setHovered(null)}
                onClick={() => onSelect(marker.regions)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(marker.regions);
                  }
                }}
              >
                {isSelected ? <circle className="flat-map__selection" r={isCluster ? 12 : 10} /> : null}
                {isCluster ? <circle className="flat-map__cluster-shell" r="8.25" /> : null}
                {providerStates.map((providerState, index) => {
                  const [cx, cy] = dotPositions[index];
                  const color = PROVIDERS[providerState.provider].color;
                  return (
                    <circle
                      key={providerState.provider}
                      className={`flat-map__provider-dot is-${providerState.status}`}
                      cx={cx}
                      cy={cy}
                      r={isCluster ? 3.25 : 5.25}
                      fill={providerState.status === "planned" ? "#fff" : color}
                      stroke={providerState.status === "planned" ? color : "#fff"}
                    />
                  );
                })}
                {marker.regions.length > 3 ? <text className="flat-map__cluster-count" x="8" y="-7">{marker.regions.length}</text> : null}
              </g>
            );
          })}
        </g>
      </svg>
      {hovered ? (
        <div className={`flat-map__tooltip is-${hovered.placement}`} style={{ left: hovered.left, top: hovered.top }}>
          <div className="marker-tooltip__providers">
            {getMarkerProviderStates(hovered.marker).map((providerState) => (
              <small key={providerState.provider}>
                <i
                  className={providerState.status === "planned" ? "is-planned" : ""}
                  style={{ "--provider-color": PROVIDERS[providerState.provider].color } as CSSProperties}
                />
                {PROVIDERS[providerState.provider].shortName}
                {providerState.status === "planned" ? " · geplant" : providerState.status === "mixed" ? " · aktiv + geplant" : ""}
              </small>
            ))}
          </div>
          <strong>{hovered.marker.regions.length === 1 ? hovered.marker.regions[0].name : `${hovered.marker.regions.length} Standorte bei ${getMarkerLocation(hovered.marker)}`}</strong>
          <div className="marker-tooltip__regions">
            {hovered.marker.regions.map((region) => (
              <span key={region.id}>
                <code>{region.code ?? "Code folgt"}</code>
                <em>{region.name}</em>
              </span>
            ))}
          </div>
          <span>{hovered.marker.regions.length > 1 ? "Klicken, um alle Details zu öffnen" : hovered.marker.regions[0].country}</span>
        </div>
      ) : null}
      <div className="globe-controls" aria-label="Kartensteuerung">
        <button type="button" onClick={() => adjustZoom("in")} aria-label="Vergrößern"><Plus /></button>
        <button type="button" onClick={() => adjustZoom("out")} aria-label="Verkleinern"><Minus /></button>
        <button type="button" onClick={() => setZoom(1)} aria-label="Ansicht zurücksetzen"><LocateFixed /></button>
      </div>
    </div>
  );
}
