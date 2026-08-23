import { Component, lazy, Suspense, useEffect, useMemo, type ErrorInfo, type ReactNode } from "react";
import { PROVIDERS, type ProviderId } from "../data/regions";
import type { WebGLGlobeProps } from "./WebGLGlobe";

const WebGLGlobe = lazy(() => import("./WebGLGlobe").then((module) => ({ default: module.WebGLGlobe })));
const FlatWorldMap = lazy(() => import("./FlatWorldMap").then((module) => ({ default: module.FlatWorldMap })));

function supportsWebGL() {
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(window.location.search).get("render") === "2d") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext
      && (canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true })
        || canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true })),
    );
  } catch {
    return false;
  }
}

class WebGLErrorBoundary extends Component<{
  children: ReactNode;
  fallback: ReactNode;
  onFallback?: () => void;
}, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("3D globe unavailable, using the 2D compatibility view.", error.message, info.componentStack);
    this.props.onFallback?.();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function GlobeCanvas(props: WebGLGlobeProps & { onRenderModeChange?: (mode: "3d" | "2d") => void }) {
  const fallback = (
    <Suspense fallback={<div className="globe-loading" role="status">Kartenansicht wird geladen</div>}>
      <FlatWorldMap
        regions={props.regions}
        selectedRegions={props.selectedRegions}
        clusterMarkers={props.clusterMarkers}
        onSelect={props.onSelect}
      />
    </Suspense>
  );
  const webglAvailable = useMemo(supportsWebGL, []);

  useEffect(() => {
    props.onRenderModeChange?.(webglAvailable ? "3d" : "2d");
  }, [props.onRenderModeChange, webglAvailable]);

  return (
    <section className="globe-stage" aria-label="Interaktive Weltkarte der Cloud-Regionen">
      {webglAvailable ? (
        <WebGLErrorBoundary fallback={fallback} onFallback={() => props.onRenderModeChange?.("2d")}>
          <Suspense fallback={<div className="globe-loading" role="status">3D-Globus wird geladen</div>}>
            <WebGLGlobe {...props} />
          </Suspense>
        </WebGLErrorBoundary>
      ) : fallback}

      <div className="globe-legend" aria-label="Legende">
        {(Object.keys(PROVIDERS) as ProviderId[]).map((providerId) => (
          <span key={providerId}>
            <i style={{ background: PROVIDERS[providerId].color }} />
            {PROVIDERS[providerId].shortName}
          </span>
        ))}
        <span><i className="planned-dot" />Geplant</span>
      </div>

      {webglAvailable ? (
        <div className="globe-help" aria-hidden="true">
          <span>Ziehen zum Drehen</span>
          <span>Scrollen zum Zoomen</span>
          <span>Marker anklicken</span>
        </div>
      ) : null}
    </section>
  );
}
