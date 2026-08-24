import { describe, expect, it } from "vitest";
import { CLOUD_REGIONS } from "../data/regions";
import { getMarkerAriaLabel, getMarkerProviderStates, groupRegions } from "./globeMarkers";

describe("globe marker groups", () => {
  it("keeps all providers and statuses in a shared location marker", () => {
    const marker = groupRegions(CLOUD_REGIONS, true).find((candidate) =>
      candidate.regions.some((region) => region.status === "planned" && region.country === "Chile"),
    );

    expect(marker).toBeDefined();
    expect(marker?.providers).toContain("aws");
    expect(marker?.providers).toContain("azure");
    expect(marker?.status).toBe("mixed");
    expect(getMarkerProviderStates(marker!).find((state) => state.provider === "aws")?.status).toBe("planned");
    expect(getMarkerProviderStates(marker!).find((state) => state.provider === "azure")?.status).toBe("active");
    expect(getMarkerAriaLabel(marker!)).toContain("AWS");
    expect(getMarkerAriaLabel(marker!)).toContain("Azure");
  });

  it("keeps regions separate when grouping is disabled", () => {
    const santiagoRegions = CLOUD_REGIONS.filter((region) =>
      Math.abs(region.lat + 33.4489) < 0.01 && Math.abs(region.lng + 70.6693) < 0.01,
    );
    const markers = groupRegions(santiagoRegions, false);

    expect(markers).toHaveLength(santiagoRegions.length);
    expect(markers.every((marker) => marker.regions.length === 1)).toBe(true);
  });
});
