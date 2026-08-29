import { describe, expect, it } from "vitest";
import {
  findNearestMarkerTarget,
  getMarkerHitRadius,
  isTapGesture,
  preventGlobePageGesture,
  supportsMarkerPreview,
} from "./touchSupport";

describe("marker previews", () => {
  it("does not leave hover previews open after a touch", () => {
    expect(supportsMarkerPreview("touch")).toBe(false);
  });

  it("keeps previews available for mouse and pen input", () => {
    expect(supportsMarkerPreview("mouse")).toBe(true);
    expect(supportsMarkerPreview("pen")).toBe(true);
  });

  it("distinguishes a touch tap from a swipe", () => {
    const start = { id: 7, x: 100, y: 100 };

    expect(isTapGesture(start, { id: 7, x: 108, y: 106 }, "touch")).toBe(true);
    expect(isTapGesture(start, { id: 7, x: 118, y: 112 }, "touch")).toBe(false);
  });

  it("rejects a gesture from another pointer", () => {
    expect(isTapGesture(
      { id: 7, x: 100, y: 100 },
      { id: 8, x: 100, y: 100 },
      "touch",
    )).toBe(false);
  });

  it("keeps touch gestures inside the globe instead of zooming the page", () => {
    let prevented = false;
    preventGlobePageGesture({ preventDefault: () => { prevented = true; } });

    expect(prevented).toBe(true);
  });

  it("finds a touched marker without making the marker intercept the gesture", () => {
    const markers = [
      { value: "frankfurt", centerX: 100, centerY: 100 },
      { value: "zurich", centerX: 180, centerY: 100 },
    ];

    expect(getMarkerHitRadius("touch")).toBe(44);
    expect(findNearestMarkerTarget(markers, 130, 105, "touch")).toBe("frankfurt");
    expect(findNearestMarkerTarget(markers, 140, 100, "mouse")).toBeNull();
  });

  it("selects the nearest marker when touch hit areas overlap", () => {
    const markers = [
      { value: "first", centerX: 100, centerY: 100 },
      { value: "nearest", centerX: 116, centerY: 100 },
    ];

    expect(findNearestMarkerTarget(markers, 113, 100, "touch")).toBe("nearest");
  });
});
