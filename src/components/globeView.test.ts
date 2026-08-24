import { describe, expect, it } from "vitest";
import { getSelectionPointOfView } from "./globeView";

describe("globe selection view", () => {
  const region = { lat: 50.1109, lng: 8.6821 };

  it("sets the intended altitude for the initial view", () => {
    expect(getSelectionPointOfView(region, false)).toEqual({ ...region, altitude: 1.85 });
  });

  it("does not change the current zoom after selecting another location", () => {
    expect(getSelectionPointOfView(region, true)).toEqual(region);
    expect(getSelectionPointOfView(region, true)).not.toHaveProperty("altitude");
  });
});
