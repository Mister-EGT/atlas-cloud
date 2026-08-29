import { describe, expect, it } from "vitest";
import { getInitialGlobeMode } from "./globeMode";

describe("initial globe mode", () => {
  it("uses 3D on a capable desktop connection", () => {
    expect(getInitialGlobeMode({ webglAvailable: true, query: "", viewportWidth: 1280 })).toBe("3d");
  });

  it("avoids loading the 3D chunk on mobile", () => {
    expect(getInitialGlobeMode({ webglAvailable: true, query: "", viewportWidth: 390 })).toBe("2d");
  });

  it("respects the browser data-saver preference", () => {
    expect(getInitialGlobeMode({
      webglAvailable: true,
      query: "",
      viewportWidth: 1280,
      connection: { saveData: true },
    })).toBe("2d");
  });

  it("uses the lightweight view on a 2G connection", () => {
    expect(getInitialGlobeMode({
      webglAvailable: true,
      query: "",
      viewportWidth: 1280,
      connection: { effectiveType: "2g" },
    })).toBe("2d");
  });

  it("allows an explicit 3D request when WebGL is available", () => {
    expect(getInitialGlobeMode({ webglAvailable: true, query: "?render=3d", viewportWidth: 390 })).toBe("3d");
  });

  it("never requests 3D without WebGL", () => {
    expect(getInitialGlobeMode({ webglAvailable: false, query: "?render=3d", viewportWidth: 1280 })).toBe("2d");
  });
});
