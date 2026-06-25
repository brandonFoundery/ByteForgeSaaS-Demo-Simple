import { describe, it, expect } from 'vitest';
import { capitalize, truncate } from './string-utils';

describe('capitalize', () => {
  it('returns empty string unchanged', () => {
    expect(capitalize('')).toBe('');
  });

  it('capitalizes first character of a lowercase word', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('leaves already-capitalized strings unchanged', () => {
    expect(capitalize('World')).toBe('World');
  });

  it('handles single character', () => {
    expect(capitalize('a')).toBe('A');
  });

  it('does not affect the rest of the string', () => {
    expect(capitalize('hELLO')).toBe('HELLO');
  });
});

describe('truncate', () => {
  it('returns the string unchanged when shorter than n', () => {
    expect(truncate('hi', 10)).toBe('hi');
  });

  it('returns the string unchanged when length equals n', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('truncates and appends ellipsis when longer than n', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });

  it('returns only dots when n <= 3 and string is longer', () => {
    expect(truncate('hello', 3)).toBe('...');
    expect(truncate('hello', 2)).toBe('..');
    expect(truncate('hello', 1)).toBe('.');
    expect(truncate('hello', 0)).toBe('');
  });

  it('throws on negative n', () => {
    expect(() => truncate('hello', -1)).toThrow(RangeError);
  });
});
