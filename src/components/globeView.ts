import type { CloudRegion } from "../data/regions";

const INITIAL_GLOBE_ALTITUDE = 1.85;

export function getSelectionPointOfView(
  region: Pick<CloudRegion, "lat" | "lng">,
  preserveZoom: boolean,
) {
  const coordinates = { lat: region.lat, lng: region.lng };
  return preserveZoom ? coordinates : { ...coordinates, altitude: INITIAL_GLOBE_ALTITUDE };
}
