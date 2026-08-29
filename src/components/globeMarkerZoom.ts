export const MARKER_SELECTION_MAX_ALTITUDE = 1.35;

const MIN_SCALE = 0.58;
const MAX_SCALE = 1.18;
const FAR_ALTITUDE = 3;
const NEAR_ALTITUDE = 0.35;

export function getGlobeMarkerZoomState(altitude: number) {
  const normalizedAltitude = Number.isFinite(altitude) ? altitude : FAR_ALTITUDE;
  const zoomProgress = Math.min(1, Math.max(0, (FAR_ALTITUDE - normalizedAltitude) / (FAR_ALTITUDE - NEAR_ALTITUDE)));

  return {
    scale: MIN_SCALE + (MAX_SCALE - MIN_SCALE) * zoomProgress,
    selectable: normalizedAltitude <= MARKER_SELECTION_MAX_ALTITUDE,
  };
}
