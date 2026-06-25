import { describe, it, expect } from 'vitest';
import { increment, decrement, clampNonNegative, multiply } from './counter';

describe('counter', () => {
  it('increments', () => expect(increment(0)).toBe(1));
  it('decrements', () => expect(decrement(2)).toBe(1));
  it('clamps negatives to zero', () => expect(clampNonNegative(-5)).toBe(0));
  it('passes through non-negatives', () => expect(clampNonNegative(3)).toBe(3));
});

describe('multiply', () => {
  it('multiplies two positives', () => expect(multiply(3, 4)).toBe(12));
  it('returns 0 when one operand is 0', () => expect(multiply(0, 7)).toBe(0));
  it('handles negative operands', () => expect(multiply(-3, 4)).toBe(-12));
  it('handles two negatives', () => expect(multiply(-2, -5)).toBe(10));
});
