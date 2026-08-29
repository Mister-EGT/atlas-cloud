export type GlobeRenderMode = "2d" | "3d";

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

export function getInitialGlobeMode({
  webglAvailable,
  query,
  viewportWidth,
  connection,
}: {
  webglAvailable: boolean;
  query: string;
  viewportWidth: number;
  connection?: NetworkInformationLike;
}): GlobeRenderMode {
  if (!webglAvailable) return "2d";

  const requestedMode = new URLSearchParams(query).get("render");
  if (requestedMode === "2d" || requestedMode === "3d") return requestedMode;

  const hasConstrainedConnection = connection?.saveData
    || connection?.effectiveType === "slow-2g"
    || connection?.effectiveType === "2g";

  return viewportWidth <= 760 || hasConstrainedConnection ? "2d" : "3d";
}
