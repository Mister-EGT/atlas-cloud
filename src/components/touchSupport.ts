export function supportsMarkerPreview(pointerType: string) {
  return pointerType !== "touch";
}

export function preventGlobePageGesture(event: Pick<Event, "preventDefault">) {
  event.preventDefault();
}

export interface PointerStart {
  id: number;
  x: number;
  y: number;
}

export interface MarkerHitTarget<T> {
  value: T;
  centerX: number;
  centerY: number;
}

export function getMarkerHitRadius(pointerType: string) {
  return pointerType === "touch" ? 44 : pointerType === "pen" ? 32 : 22;
}

export function findNearestMarkerTarget<T>(
  targets: MarkerHitTarget<T>[],
  clientX: number,
  clientY: number,
  pointerType: string,
) {
  const maxDistance = getMarkerHitRadius(pointerType);
  let nearest: { value: T; distance: number } | null = null;

  for (const target of targets) {
    const distance = Math.hypot(target.centerX - clientX, target.centerY - clientY);
    if (distance <= maxDistance && (!nearest || distance < nearest.distance)) {
      nearest = { value: target.value, distance };
    }
  }

  return nearest?.value ?? null;
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
