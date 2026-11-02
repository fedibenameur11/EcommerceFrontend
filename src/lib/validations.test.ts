import { describe, it, expect } from 'vitest';
import { checkoutSchema } from './validations';

const validData = {
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean@exemple.com',
  phone: '12345678',
  address: '12 rue de la République',
  city: 'Tunis',
  zipCode: '1000',
  country: 'TN',
};

describe('checkoutSchema', () => {
  it('accepts a fully valid payload', () => {
    const result = checkoutSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('does not ask for any payment card information', () => {
    const keys = Object.keys(checkoutSchema.shape);
    expect(keys.some((key) => key.toLowerCase().includes('card'))).toBe(false);
  });

  it('rejects an invalid email with a French message', () => {
    const result = checkoutSchema.safeParse({ ...validData, email: 'bad' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Veuillez saisir une adresse e-mail valide');
    }
  });

  it.each(['1234567', '123456789', '1234567a', '+21612345678', '12 345 678'])('rejects the phone %s', (phone) => {
    expect(checkoutSchema.safeParse({ ...validData, phone }).success).toBe(false);
  });

  it('rejects a missing country', () => {
    const result = checkoutSchema.safeParse({ ...validData, country: '' });
    expect(result.success).toBe(false);
  });
});
