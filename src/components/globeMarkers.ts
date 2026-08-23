import type { CloudRegion, ProviderId } from "../data/regions";

export interface GlobeMarker {
  lat: number;
  lng: number;
  regions: CloudRegion[];
  provider: ProviderId | "mixed";
}

export function groupRegions(regions: CloudRegion[], shouldGroup: boolean): GlobeMarker[] {
  if (!shouldGroup) {
    return regions.map((region) => ({
      lat: region.lat,
      lng: region.lng,
      regions: [region],
      provider: region.provider,
    }));
  }

  const groups = new Map<string, CloudRegion[]>();
  regions.forEach((region) => {
    const key = `${Math.round(region.lat * 2) / 2}:${Math.round(region.lng * 2) / 2}`;
    groups.set(key, [...(groups.get(key) ?? []), region]);
  });

  return [...groups.values()].map((group) => {
    const providerSet = new Set(group.map((region) => region.provider));
    return {
      lat: group.reduce((sum, region) => sum + region.lat, 0) / group.length,
      lng: group.reduce((sum, region) => sum + region.lng, 0) / group.length,
      regions: group,
      provider: providerSet.size === 1 ? group[0].provider : "mixed",
    };
  });
}
