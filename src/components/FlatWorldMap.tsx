import { geoNaturalEarth1, geoPath } from "d3-geo";
import { LocateFixed, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { PROVIDERS, type CloudRegion } from "../data/regions";
import { groupRegions, type GlobeMarker } from "./globeMarkers";
import { countryFeatureCollection, countryFeatures } from "./worldMapData";

const MAP_WIDTH = 960;
const MAP_HEIGHT = 560;

export function FlatWorldMap({ regions, selected, clusterMarkers, onSelect }: {
  regions: CloudRegion[];
  selected: CloudRegion | null;
  clusterMarkers: boolean;
  onSelect: (region: CloudRegion) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [hovered, setHovered] = useState<GlobeMarker | null>(null);
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
  const projectedHovered = hovered ? projection([hovered.lng, hovered.lat]) : null;

  const adjustZoom = (direction: "in" | "out") => {
    setZoom((current) => Math.min(2.2, Math.max(1, current + (direction === "in" ? 0.25 : -0.25))));
  };

  return (
    <div className="flat-map" data-render-mode="2d">
      <div className="flat-map__badge" role="status">2D-Kompatibilitätsansicht</div>
      <svg className="flat-map__svg" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label="Interaktive zweidimensionale Weltkarte der Cloud-Regionen">
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
            const first = marker.regions[0];
            const isSelected = selected && marker.regions.some((region) => region.id === selected.id);
            const color = marker.provider === "mixed"
              ? "#f5f7fa"
              : first.status === "planned"
                ? "#9aa4af"
                : PROVIDERS[marker.provider].color;
            return (
              <g
                key={marker.regions.map((region) => region.id).join(":")}
                className={`flat-map__marker ${isSelected ? "is-selected" : ""}`}
                data-region-codes={marker.regions.map((region) => region.code ?? region.id).join(" ")}
                role="button"
                tabIndex={0}
                aria-label={`${first.name}, ${first.location} auswählen`}
                transform={`translate(${point[0]} ${point[1]})`}
                onMouseEnter={() => setHovered(marker)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(marker)}
                onBlur={() => setHovered(null)}
                onClick={() => onSelect(first)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(first);
                  }
                }}
              >
                {isSelected ? <circle className="flat-map__selection" r="11" /> : null}
                <circle r="6" fill={color} />
              </g>
            );
          })}
        </g>
      </svg>
      {hovered && projectedHovered ? (
        <div className="flat-map__tooltip" style={{ left: `${(projectedHovered[0] / MAP_WIDTH) * 100}%`, top: `${(projectedHovered[1] / MAP_HEIGHT) * 100}%` }}>
          <small>{hovered.provider === "mixed" ? "Mehrere Anbieter" : PROVIDERS[hovered.provider].name}</small>
          <strong>{hovered.regions[0].name}</strong>
          <code>{hovered.regions[0].code ?? "Code folgt"}</code>
          <span>{hovered.regions.length > 1 ? `${hovered.regions.length} Regionen` : hovered.regions[0].country}</span>
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
