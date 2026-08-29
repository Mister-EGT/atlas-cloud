import { describe, expect, it } from "vitest";
import { isTapGesture, supportsMarkerPreview } from "./touchSupport";

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
});
