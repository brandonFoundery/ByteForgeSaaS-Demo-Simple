import { describe, it, expect } from 'vitest';
import { increment, decrement, clampNonNegative } from './counter';

describe('counter', () => {
  it('increments', () => expect(increment(0)).toBe(1));
  it('decrements', () => expect(decrement(2)).toBe(1));
  it('clamps negatives to zero', () => expect(clampNonNegative(-5)).toBe(0));
  it('passes through non-negatives', () => expect(clampNonNegative(3)).toBe(3));
});
