import { describe, it, expect } from 'vitest';
import { orderNumber } from '@/lib/orderNumber.js';

describe('orderNumber', () => {
  it('returns the first 8 characters of the UUID, upper-cased, with a leading #', () => {
    expect(orderNumber('3f2a9c1b-7d4e-4a1a-9c3e-1234567890ab')).toBe('#3F2A9C1B');
  });
});
