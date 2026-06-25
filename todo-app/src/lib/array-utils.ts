export function unique<T>(xs: T[]): T[] {
  return Array.from(new Set(xs));
}

export function chunk<T>(xs: T[], size: number): T[][] {
  if (!Number.isInteger(size) || size <= 0) {
    throw new Error("size must be a positive integer");
  }
  const out: T[][] = [];
  for (let i = 0; i < xs.length; i += size) {
    out.push(xs.slice(i, i + size));
  }
  return out;
}
