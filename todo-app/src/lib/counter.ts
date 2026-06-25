export function increment(n: number): number { return n + 1; }
export function decrement(n: number): number { return n - 1; }
export function clampNonNegative(n: number): number { return n < 0 ? 0 : n; }
export function multiply(a: number, b: number): number { return a * b; }
export function isEven(n: number): boolean { return n % 2 === 0; }
