import { describe, expect, it } from "vitest";
import { getGlobeMarkerZoomState, MARKER_SELECTION_MAX_ALTITUDE } from "./globeMarkerZoom";

describe("3D globe marker zoom behavior", () => {
  it("keeps distant markers small and prevents accidental selection", () => {
    const state = getGlobeMarkerZoomState(1.92);

    expect(state.scale).toBeLessThan(0.9);
    expect(state.selectable).toBe(false);
  });

  it("enlarges and enables markers after zooming in far enough", () => {
    const locked = getGlobeMarkerZoomState(MARKER_SELECTION_MAX_ALTITUDE + 0.01);
    const selectable = getGlobeMarkerZoomState(MARKER_SELECTION_MAX_ALTITUDE);
    const close = getGlobeMarkerZoomState(0.45);

    expect(locked.selectable).toBe(false);
    expect(selectable.selectable).toBe(true);
    expect(close.scale).toBeGreaterThan(selectable.scale);
    expect(close.scale).toBeGreaterThan(1.1);
  });

  it("clamps marker size for extreme or invalid camera values", () => {
    expect(getGlobeMarkerZoomState(10).scale).toBe(0.58);
    expect(getGlobeMarkerZoomState(-10).scale).toBe(1.18);
    expect(getGlobeMarkerZoomState(Number.NaN).scale).toBe(0.58);
  });
});
