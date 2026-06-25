export function clamp(n: number, lo: number, hi: number): number {
  if (lo > hi) throw new Error("clamp: lo must be <= hi");
  if (n < lo) return lo;
  if (n > hi) return hi;
  return n;
}

export function sum(xs: number[]): number {
  let total = 0;
  for (const x of xs) total += x;
  return total;
}
