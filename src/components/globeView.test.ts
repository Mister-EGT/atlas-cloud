import { describe, expect, it } from "vitest";
import { getSelectionPointOfView } from "./globeView";

describe("globe selection view", () => {
  const region = { lat: 50.1109, lng: 8.6821 };

  it("preserves the current zoom for the first selection", () => {
    expect(getSelectionPointOfView(region)).toEqual(region);
    expect(getSelectionPointOfView(region)).not.toHaveProperty("altitude");
  });

  it("preserves the current zoom for every later selection", () => {
    const laterRegion = { lat: -33.4489, lng: -70.6693 };

    expect(getSelectionPointOfView(laterRegion)).toEqual(laterRegion);
    expect(getSelectionPointOfView(laterRegion)).not.toHaveProperty("altitude");
  });
});
