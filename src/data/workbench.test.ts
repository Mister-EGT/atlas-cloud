import { describe, expect, it } from "vitest";
import { CLOUD_REGIONS } from "./regions";
import { DEFAULT_ASSISTANT_WEIGHTS, DEFAULT_WORKBENCH_STATE, distanceInKilometres, filterWorkbenchRegions, parseWorkbenchState, regionsToCsv, regionsToJson, scoreRegion, serializeWorkbenchState } from "./workbench";

const ids = new Set(CLOUD_REGIONS.map((region) => region.id));

describe("workbench URL state", () => {
  it("restores and canonically serializes supported state", () => {
    const first = CLOUD_REGIONS.find((region) => region.locationType === "cloud-region")!;
    const second = CLOUD_REGIONS.find((region) => region.id !== first.id && region.locationType === "cloud-region")!;
    const state = parseWorkbenchState(`?view=compare&layers=cloud-region,edge-location&providers=aws,gcp&status=active&continent=Europa&services=compute,postgresql&selected=${first.id}&compare=${first.id},${second.id}&origin=${second.id}&mode=2d&cluster=0&rotate=1&atmosphere=0`, ids);
    const restored = parseWorkbenchState(new URL(serializeWorkbenchState(state), "https://atlas.example").search, ids);
    expect(restored).toEqual(state);
  });

  it("ignores invalid and stale parameters", () => {
    const state = parseWorkbenchState("?view=obsolete&providers=nope&selected=removed&compare=removed&mode=vr", ids);
    expect(state).toEqual(DEFAULT_WORKBENCH_STATE);
  });
});

describe("decision functions", () => {
  it("keeps cloud and edge layers separate and applies service requirements", () => {
    const cloud = filterWorkbenchRegions(CLOUD_REGIONS, DEFAULT_WORKBENCH_STATE.filters);
    expect(cloud).toHaveLength(152);
    expect(cloud.every((region) => region.locationType === "cloud-region")).toBe(true);
    const edge = filterWorkbenchRegions(CLOUD_REGIONS, { ...DEFAULT_WORKBENCH_STATE.filters, layers: ["edge-location"], services: ["edge-network"] });
    expect(edge).toHaveLength(341);
  });

  it("calculates air-line distance without presenting it as latency", () => {
    const berlin = { lat: 52.52, lng: 13.405 };
    const frankfurt = { lat: 50.1109, lng: 8.6821 };
    expect(distanceInKilometres(berlin, frankfurt)).toBeGreaterThan(420);
    expect(distanceInKilometres(berlin, frankfurt)).toBeLessThan(440);
  });

  it("normalizes ranking by available evidence and exposes coverage", () => {
    const region = CLOUD_REGIONS.find((item) => item.locationType === "cloud-region" && item.lifecycleStatus === "active")!;
    const result = scoreRegion(region, ["compute"], null, DEFAULT_ASSISTANT_WEIGHTS);
    expect(result.score).toBeGreaterThan(0);
    expect(result.coverage).toBeCloseTo(55);
    expect(result.categories.find((category) => category.key === "proximity")?.value).toBeNull();
  });
});

describe("exports", () => {
  it("creates deterministic CSV and JSON exports", () => {
    const sample = CLOUD_REGIONS.slice(0, 2);
    expect(regionsToCsv(sample)).toContain("id,provider,kind");
    expect(regionsToCsv(sample)).toContain(sample[0].id);
    expect(JSON.parse(regionsToJson(sample))).toEqual(sample);
  });
});
