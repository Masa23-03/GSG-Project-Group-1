export function extractId(q?: string): number | null {
  if (!q) return null;
  const m = q.match(/(\d+)/g);
  if (!m) return null;
  const n = Number(m[m.length - 1]);
  return Number.isFinite(n) ? n : null;
}
