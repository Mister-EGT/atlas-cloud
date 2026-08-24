import { PROVIDERS, type CloudRegion, type ProviderId } from "../data/regions";

const PROVIDER_ORDER: ProviderId[] = ["azure", "aws", "gcp"];

export interface MarkerProviderState {
  provider: ProviderId;
  activeCount: number;
  plannedCount: number;
  status: "active" | "planned" | "mixed";
}

export interface GlobeMarker {
  lat: number;
  lng: number;
  regions: CloudRegion[];
  providers: ProviderId[];
  status: "active" | "planned" | "mixed";
}

function sortRegions(regions: CloudRegion[]) {
  return [...regions].sort((left, right) => {
    const providerDifference = PROVIDER_ORDER.indexOf(left.provider) - PROVIDER_ORDER.indexOf(right.provider);
    if (providerDifference !== 0) return providerDifference;
    if (left.status !== right.status) return left.status === "active" ? -1 : 1;
    return left.name.localeCompare(right.name, "de");
  });
}

function getMarkerStatus(regions: CloudRegion[]): GlobeMarker["status"] {
  const statuses = new Set(regions.map((region) => region.status));
  return statuses.size === 1 ? regions[0].status : "mixed";
}

export function getMarkerProviderStates(marker: GlobeMarker): MarkerProviderState[] {
  return marker.providers.map((provider) => {
    const providerRegions = marker.regions.filter((region) => region.provider === provider);
    const activeCount = providerRegions.filter((region) => region.status === "active").length;
    const plannedCount = providerRegions.length - activeCount;
    return {
      provider,
      activeCount,
      plannedCount,
      status: activeCount > 0 && plannedCount > 0 ? "mixed" : plannedCount > 0 ? "planned" : "active",
    };
  });
}

export function getMarkerLocation(marker: GlobeMarker) {
  const locations = [...new Set(marker.regions.map((region) => region.location))];
  if (locations.length === 1) return locations[0];
  const countries = [...new Set(marker.regions.map((region) => region.country))];
  return countries.length === 1 ? countries[0] : marker.regions[0].location;
}

export function getMarkerAriaLabel(marker: GlobeMarker) {
  if (marker.regions.length === 1) {
    const [region] = marker.regions;
    return `${region.name}, ${region.location} auswählen`;
  }
  const providerNames = marker.providers.map((provider) => PROVIDERS[provider].shortName).join(", ");
  return `${marker.regions.length} Regionen bei ${getMarkerLocation(marker)} von ${providerNames} auswählen`;
}

export function groupRegions(regions: CloudRegion[], shouldGroup: boolean): GlobeMarker[] {
  const groups = new Map<string, CloudRegion[]>();
  regions.forEach((region) => {
    const key = shouldGroup
      ? `${Math.round(region.lat * 2) / 2}:${Math.round(region.lng * 2) / 2}`
      : region.id;
    groups.set(key, [...(groups.get(key) ?? []), region]);
  });

  return [...groups.values()].map((unsortedGroup) => {
    const group = sortRegions(unsortedGroup);
    return {
      lat: group.reduce((sum, region) => sum + region.lat, 0) / group.length,
      lng: group.reduce((sum, region) => sum + region.lng, 0) / group.length,
      regions: group,
      providers: PROVIDER_ORDER.filter((provider) => group.some((region) => region.provider === provider)),
      status: getMarkerStatus(group),
    };
  });
}
