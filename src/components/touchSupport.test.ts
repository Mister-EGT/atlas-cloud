import { describe, expect, it } from "vitest";
import { supportsMarkerPreview } from "./touchSupport";

describe("marker previews", () => {
  it("does not leave hover previews open after a touch", () => {
    expect(supportsMarkerPreview("touch")).toBe(false);
  });

  it("keeps previews available for mouse and pen input", () => {
    expect(supportsMarkerPreview("mouse")).toBe(true);
    expect(supportsMarkerPreview("pen")).toBe(true);
  });
});
