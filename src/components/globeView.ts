import type { CloudRegion } from "../data/regions";

export function getSelectionPointOfView(
  region: Pick<CloudRegion, "lat" | "lng">,
) {
  return { lat: region.lat, lng: region.lng };
}
