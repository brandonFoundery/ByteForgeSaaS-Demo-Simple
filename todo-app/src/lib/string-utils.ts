export function capitalize(s: string): string {
  if (s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function truncate(s: string, n: number): string {
  if (n < 0) throw new RangeError("n must be non-negative");
  if (s.length <= n) return s;
  if (n <= 3) return s.slice(0, n);
  return s.slice(0, n - 3) + "...";
}
