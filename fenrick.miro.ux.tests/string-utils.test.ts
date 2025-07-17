import { toSafeString } from '../fenrick.miro.ux/src/core/utils/string-utils';

describe('toSafeString', () => {
  test('returns empty string for null or undefined', () => {
    expect(toSafeString(null)).toBe('');
    expect(toSafeString(undefined)).toBe('');
  });

  test('stringifies primitive values', () => {
    expect(toSafeString('test')).toBe('test');
    expect(toSafeString(5)).toBe('5');
    expect(toSafeString(true)).toBe('true');
    expect(toSafeString(BigInt(10))).toBe('10');
  });

  test('stringifies objects using JSON', () => {
    expect(toSafeString({ a: 1 })).toBe('{"a":1}');
  });

  test('falls back when JSON.stringify throws', () => {
    const a: { self?: unknown } = {};
    a.self = a; // circular
    expect(toSafeString(a)).toBe('[object Object]');
  });
});
