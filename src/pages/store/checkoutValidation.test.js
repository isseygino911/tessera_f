import { describe, it, expect } from 'vitest';
import { validateCheckout } from './checkoutValidation';

function buildForm(overrides = {}) {
  return {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '555-0100',
    addressLine1: '1 Analytical Engine Way',
    city: 'London',
    region: 'LDN',
    postalCode: 'W1A 1AA',
    country: 'UK',
    note: '',
    ...overrides,
  };
}

describe('validateCheckout', () => {
  it('returns an empty object for a fully valid form', () => {
    expect(validateCheckout(buildForm())).toEqual({});
  });

  it('is valid without the optional note', () => {
    const form = buildForm({ note: '' });

    expect(validateCheckout(form)).toEqual({});
  });

  const requiredFields = ['name', 'email', 'phone', 'addressLine1', 'city', 'region', 'postalCode', 'country'];

  it.each(requiredFields)('flags a missing %s', (field) => {
    const form = buildForm({ [field]: '' });

    const errors = validateCheckout(form);

    expect(errors).toHaveProperty(field);
    expect(typeof errors[field]).toBe('string');
    expect(errors[field].length).toBeGreaterThan(0);
  });

  it.each(requiredFields)('flags a whitespace-only %s', (field) => {
    const form = buildForm({ [field]: '   ' });

    const errors = validateCheckout(form);

    expect(errors).toHaveProperty(field);
  });

  it.each(['not-an-email', 'missing-at-sign.com', 'no-domain@', '@no-local.com', 'spaces in@email.com'])(
    'flags an invalid email format: %s',
    (email) => {
      const errors = validateCheckout(buildForm({ email }));

      expect(errors).toHaveProperty('email');
    }
  );

  it.each(['a@b.co', 'ada.lovelace+orders@example.co.uk'])('accepts a valid email format: %s', (email) => {
    const errors = validateCheckout(buildForm({ email }));

    expect(errors).not.toHaveProperty('email');
  });

  it('reports one message per invalid field, not just the first', () => {
    const errors = validateCheckout(buildForm({ name: '', email: 'bad', city: '' }));

    expect(Object.keys(errors).sort()).toEqual(['city', 'email', 'name']);
  });

  it('does not flag note as required when blank', () => {
    const errors = validateCheckout(buildForm({ note: '' }));

    expect(errors).toEqual({});
  });

  it('accepts a filled-in note without affecting validity', () => {
    const errors = validateCheckout(buildForm({ note: 'Leave at the front desk.' }));

    expect(errors).toEqual({});
  });
});
