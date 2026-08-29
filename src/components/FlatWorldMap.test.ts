import { describe, expect, it } from "vitest";
import { getProviderDotLayout } from "./FlatWorldMap";

describe("2D provider-dot layout", () => {
  it("keeps the existing compact layouts for up to five providers", () => {
    expect(getProviderDotLayout(1).positions).toEqual([[0, 0]]);
    expect(getProviderDotLayout(5).positions).toHaveLength(5);
    expect(getProviderDotLayout(5).radius).toBe(3.25);
  });

  it("lays out the nine-provider Frankfurt cluster without missing coordinates", () => {
    const layout = getProviderDotLayout(9);

    expect(layout.positions).toHaveLength(9);
    expect(new Set(layout.positions.map(([x, y]) => `${x}:${y}`))).toHaveLength(9);
    expect(layout.positions.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y))).toBe(true);
    expect(layout.radius).toBeLessThan(3.25);
  });
});
