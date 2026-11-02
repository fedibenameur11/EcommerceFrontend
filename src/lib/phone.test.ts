import { describe, it, expect } from 'vitest';
import { isValidPhoneNumber, sanitizePhone, toLocalPhone } from './phone';

describe('sanitizePhone', () => {
  it('removes letters, spaces and symbols', () => {
    expect(sanitizePhone('12 ab-34+56')).toBe('123456');
  });

  it('keeps at most 8 digits', () => {
    expect(sanitizePhone('1234567890')).toBe('12345678');
  });
});

describe('isValidPhoneNumber', () => {
  it('accepts exactly 8 digits only', () => {
    expect(isValidPhoneNumber('12345678')).toBe(true);
    expect(isValidPhoneNumber('1234567')).toBe(false);
    expect(isValidPhoneNumber('123456789')).toBe(false);
    expect(isValidPhoneNumber('1234567a')).toBe(false);
  });
});

describe('toLocalPhone', () => {
  it('converts the old +216 format', () => {
    expect(toLocalPhone('+216 12 345 678')).toBe('12345678');
  });

  it('returns an empty string for unusable values', () => {
    expect(toLocalPhone(undefined)).toBe('');
    expect(toLocalPhone('-')).toBe('');
    expect(toLocalPhone('555')).toBe('');
  });
});
