// The front-facing hotspot is at +Z before rotation. Angles remain continuous
// to avoid a full revolution when selecting a point across the 0/360 seam.
export const TAU = Math.PI * 2;
export function pointAngle(index: number, count: number) { return index * TAU / count; }
export function nearestPoint(rotation: number, count: number) {
  const step = TAU / count;
  return ((Math.round(-rotation / step) % count) + count) % count;
}
export function snapAngle(index: number, count: number, current: number) {
  const angle = -pointAngle(index, count);
  return angle + Math.round((current - angle) / TAU) * TAU;
}
