import { describe, expect, it } from "vitest";
import { AWS_REGIONS, AZURE_REGIONS, CLOUDFLARE_REGIONS, CLOUD_REGIONS, DATA_METADATA, GCP_REGIONS, PRICE_WORKLOAD } from "./regions";

describe("cloud region dataset", () => {
  it("contains every researched public-cloud region and announcement", () => {
    expect(AZURE_REGIONS).toHaveLength(68);
    expect(AWS_REGIONS).toHaveLength(41);
    expect(GCP_REGIONS).toHaveLength(43);
    expect(CLOUDFLARE_REGIONS).toHaveLength(341);
    expect(CLOUD_REGIONS).toHaveLength(493);
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

  it("models Cloudflare locations as active edge data centers", () => {
    expect(CLOUDFLARE_REGIONS.every((region) => region.locationType === "edge-location")).toBe(true);
    expect(CLOUDFLARE_REGIONS.every((region) => region.status === "active")).toBe(true);
    expect(CLOUDFLARE_REGIONS.every((region) => region.code?.length === 3)).toBe(true);
    expect(CLOUDFLARE_REGIONS.every((region) => region.location.trim().length > 0)).toBe(true);
    expect(new Set(CLOUDFLARE_REGIONS.map((region) => region.code)).size).toBe(CLOUDFLARE_REGIONS.length);
  });

  it("keeps provenance and the reference workload explicit", () => {
    expect(Number.isNaN(Date.parse(DATA_METADATA.verifiedAt))).toBe(false);
    expect(CLOUD_REGIONS.every((region) => region.provenance.sourceUrl.startsWith("https://") && !Number.isNaN(Date.parse(region.provenance.verifiedAt)))).toBe(true);
    expect(PRICE_WORKLOAD.providerSkus).toEqual({ aws: "m7i.large", azure: "Standard_D2s_v5", gcp: "n2-standard-2" });
    expect(PRICE_WORKLOAD.exclusions).toEqual(["Rabatte", "Steuern", "Storage", "Egress"]);
  });
});
