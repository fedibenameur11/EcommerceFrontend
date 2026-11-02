import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  truncateText,
  calculateOrderSummary,
  isValidEmail,
  formatPhoneNumber,
  SHIPPING_FEE,
} from './utils';

// Intl utilise des espaces insécables en français : on les normalise pour comparer
const normalize = (value: string) => value.replace(/\s/g, ' ');

describe('formatPrice', () => {
  it('formats a number as TND (dinar tunisien) in French format', () => {
    expect(normalize(formatPrice(19.99))).toBe('19,990 TND');
  });

  it('respects a custom currency code', () => {
    expect(normalize(formatPrice(10, 'EUR'))).toBe('10,00 €');
  });
});

describe('truncateText', () => {
  it('returns the text unchanged when shorter than the limit', () => {
    expect(truncateText('hello', 10)).toBe('hello');
  });

  it('truncates and appends an ellipsis when longer than the limit', () => {
    expect(truncateText('hello world', 5)).toBe('hello...');
  });
});

describe('calculateOrderSummary', () => {
  it('adds the flat 10 TND delivery fee', () => {
    const { shipping, total } = calculateOrderSummary(50);
    expect(SHIPPING_FEE).toBe(10);
    expect(shipping).toBe(10);
    expect(total).toBe(60);
  });

  it('keeps the delivery fee on large orders (no free shipping, no tax)', () => {
    const { shipping, total } = calculateOrderSummary(150);
    expect(shipping).toBe(10);
    expect(total).toBe(160);
  });

  it('charges nothing for an empty cart', () => {
    expect(calculateOrderSummary(0)).toEqual({ subtotal: 0, discount: 0, shipping: 0, total: 0 });
  });

  it('subtracts the promo discount before adding delivery', () => {
    const { discount, total } = calculateOrderSummary(100, 15);
    expect(discount).toBe(15);
    expect(total).toBe(95); // 100 - 15 + 10 de livraison
  });

  it('never lets a discount push the items total below zero', () => {
    expect(calculateOrderSummary(20, 50).total).toBe(10); // seule la livraison reste
  });
});

describe('isValidEmail', () => {
  it('accepts a well-formed address', () => {
    expect(isValidEmail('john@example.com')).toBe(true);
  });

  it('rejects a malformed address', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
  });
});

describe('formatPhoneNumber', () => {
  it('formats a 10-digit number', () => {
    expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
  });

  it('returns the input unchanged when it cannot be parsed', () => {
    expect(formatPhoneNumber('123')).toBe('123');
  });
});
