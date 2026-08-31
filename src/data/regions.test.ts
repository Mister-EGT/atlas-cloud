import { describe, expect, it } from "vitest";
import {
  AKAMAI_REGIONS,
  AWS_REGIONS,
  AZURE_REGIONS,
  CLOUDFLARE_REGIONS,
  CLOUD_REGIONS,
  DIGITALOCEAN_REGIONS,
  GCP_REGIONS,
  HETZNER_REGIONS,
  IBM_REGIONS,
  ORACLE_REGIONS,
  OVHCLOUD_REGIONS,
  PROTON_REGIONS,
} from "./regions";

describe("cloud region dataset", () => {
  it("contains every researched public-cloud region and announcement", () => {
    expect(AZURE_REGIONS).toHaveLength(68);
    expect(AWS_REGIONS).toHaveLength(41);
    expect(GCP_REGIONS).toHaveLength(43);
    expect(CLOUDFLARE_REGIONS).toHaveLength(341);
    expect(PROTON_REGIONS).toHaveLength(3);
    expect(HETZNER_REGIONS).toHaveLength(6);
    expect(OVHCLOUD_REGIONS).toHaveLength(33);
    expect(ORACLE_REGIONS).toHaveLength(45);
    expect(IBM_REGIONS).toHaveLength(13);
    expect(DIGITALOCEAN_REGIONS).toHaveLength(16);
    expect(AKAMAI_REGIONS).toHaveLength(31);
    expect(CLOUD_REGIONS).toHaveLength(640);
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

  it("keeps Proton infrastructure separate from VPN exit-server locations", () => {
    expect(PROTON_REGIONS.every((region) => region.locationType === "private-data-center")).toBe(true);
    expect(PROTON_REGIONS.map((region) => region.country).sort()).toEqual(["Deutschland", "Norwegen", "Schweiz"]);
    expect(PROTON_REGIONS.find((region) => region.country === "Norwegen")?.coordinateAccuracy).toContain("genauer Ort nicht veröffentlicht");
    expect(PROTON_REGIONS.every((region) => region.infrastructureModel?.includes("eigene") || region.infrastructureModel?.includes("Eigene"))).toBe(true);
  });

  it("describes every new provider location with an official source and operating details", () => {
    const addedRegions = [
      ...HETZNER_REGIONS,
      ...OVHCLOUD_REGIONS,
      ...ORACLE_REGIONS,
      ...IBM_REGIONS,
      ...DIGITALOCEAN_REGIONS,
      ...AKAMAI_REGIONS,
    ];

    expect(addedRegions).toHaveLength(144);
    addedRegions.forEach((region) => {
      expect(region.sourceLabel).toBeTruthy();
      expect(region.infrastructureModel).toBeTruthy();
      expect(region.serviceCoverage).toBeTruthy();
      expect(region.coordinateAccuracy).toContain("keine Gebäudeadresse");
    });
    expect(OVHCLOUD_REGIONS.filter((region) => region.locationType === "local-zone")).toHaveLength(18);
    expect(IBM_REGIONS.every((region) => region.zones === 3)).toBe(true);
  });
});
