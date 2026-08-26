import { Component, lazy, Suspense, useEffect, useMemo, useState, type ErrorInfo, type ReactNode } from "react";
import { PROVIDERS, type ProviderId } from "../data/regions";
import type { WebGLGlobeProps } from "./WebGLGlobe";
import { getInitialGlobeMode, type GlobeRenderMode } from "./globeMode";

const WebGLGlobe = lazy(() => import("./WebGLGlobe").then((module) => ({ default: module.WebGLGlobe })));
const FlatWorldMap = lazy(() => import("./FlatWorldMap").then((module) => ({ default: module.FlatWorldMap })));

function supportsWebGL() {
  if (typeof window === "undefined") return false;
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
  const webglAvailable = useMemo(supportsWebGL, []);
  const [requestedMode, setRequestedMode] = useState<GlobeRenderMode>(() => {
    if (typeof window === "undefined") return "2d";
    const navigatorWithConnection = navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    };
    return getInitialGlobeMode({
      webglAvailable,
      query: window.location.search,
      viewportWidth: window.innerWidth,
      connection: navigatorWithConnection.connection,
    });
  });
  const renderMode: GlobeRenderMode = requestedMode === "3d" && webglAvailable ? "3d" : "2d";
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

  useEffect(() => {
    props.onRenderModeChange?.(renderMode);
  }, [props.onRenderModeChange, renderMode]);

  return (
    <section className="globe-stage" aria-label="Interaktive Weltkarte der Cloud-Regionen">
      {renderMode === "3d" ? (
        <WebGLErrorBoundary
          fallback={fallback}
          onFallback={() => {
            setRequestedMode("2d");
            props.onRenderModeChange?.("2d");
          }}
        >
          <Suspense fallback={<div className="globe-loading" role="status">3D-Globus wird geladen</div>}>
            <WebGLGlobe {...props} />
          </Suspense>
        </WebGLErrorBoundary>
      ) : fallback}

      <div className="globe-mode-switch" role="group" aria-label="Kartendarstellung">
        <button
          type="button"
          className={renderMode === "2d" ? "is-active" : ""}
          aria-pressed={renderMode === "2d"}
          onClick={() => setRequestedMode("2d")}
        >
          2D sparsam
        </button>
        <button
          type="button"
          className={renderMode === "3d" ? "is-active" : ""}
          aria-pressed={renderMode === "3d"}
          disabled={!webglAvailable}
          title={webglAvailable ? "3D-Globus laden" : "WebGL ist in diesem Browser nicht verfügbar"}
          onClick={() => setRequestedMode("3d")}
        >
          3D
        </button>
      </div>

      <div className="globe-legend" aria-label="Legende">
        {(Object.keys(PROVIDERS) as ProviderId[]).map((providerId) => (
          <span key={providerId}>
            <i style={{ background: PROVIDERS[providerId].color }} />
            {PROVIDERS[providerId].shortName}
          </span>
        ))}
        <span><i className="planned-dot" />Geplant</span>
      </div>

      {renderMode === "3d" ? (
        <div className="globe-help" aria-hidden="true">
          <span>Ziehen zum Drehen</span>
          <span>Scrollen zum Zoomen</span>
          <span>Marker anklicken</span>
        </div>
      ) : null}
    </section>
  );
}
