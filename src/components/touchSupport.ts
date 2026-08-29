export function supportsMarkerPreview(pointerType: string) {
  return pointerType !== "touch";
}

export interface PointerStart {
  id: number;
  x: number;
  y: number;
}

export function isTapGesture(
  start: PointerStart | null,
  current: PointerStart,
  pointerType: string,
) {
  if (!start || start.id !== current.id) return false;
  const tolerance = pointerType === "touch" ? 12 : 7;
  return Math.hypot(current.x - start.x, current.y - start.y) <= tolerance;
}
