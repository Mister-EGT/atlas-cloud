import { describe, expect, it } from "vitest";
import { AWS_REGIONS, AZURE_REGIONS, CLOUD_REGIONS, GCP_REGIONS } from "./regions";

describe("cloud region dataset", () => {
  it("contains every researched public-cloud region and announcement", () => {
    expect(AZURE_REGIONS).toHaveLength(68);
    expect(AWS_REGIONS).toHaveLength(41);
    expect(GCP_REGIONS).toHaveLength(43);
    expect(CLOUD_REGIONS).toHaveLength(152);
  });

  it("uses unique ids and valid coordinates", () => {
    expect(new Set(CLOUD_REGIONS.map((region) => region.id)).size).toBe(CLOUD_REGIONS.length);
    CLOUD_REGIONS.forEach((region) => {
      expect(region.lat).toBeGreaterThanOrEqual(-90);
      expect(region.lat).toBeLessThanOrEqual(90);
      expect(region.lng).toBeGreaterThanOrEqual(-180);
      expect(region.lng).toBeLessThanOrEqual(180);
      expect(region.source.startsWith("https://")).toBe(true);
    });
  });

  it("marks only the two announced AWS regions as planned", () => {
    const planned = CLOUD_REGIONS.filter((region) => region.status === "planned");
    expect(planned.map((region) => region.name).sort()).toEqual(["Chile", "Kingdom of Saudi Arabia"]);
  });

  it("keeps separate cloud partitions visible", () => {
    expect(CLOUD_REGIONS.filter((region) => region.scope === "sovereign")).toHaveLength(16);
    expect(AWS_REGIONS.filter((region) => region.status === "active")).toHaveLength(39);
    expect(AWS_REGIONS.filter((region) => region.status === "active").reduce((sum, region) => sum + (region.zones ?? 0), 0)).toBe(123);
  });
});
