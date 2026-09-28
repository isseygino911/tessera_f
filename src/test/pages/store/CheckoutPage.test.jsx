import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { api } from '@/lib/api.js';
import { CartProvider } from '@/context/CartContext.jsx';
import { validateCheckout } from '@/lib/checkoutValidation.js';
import CheckoutPage from '@/pages/store/CheckoutPage.jsx';

vi.mock('@/lib/api.js');

const STORAGE_KEY = 'simple_ecom_cart';

function renderCheckoutPage() {
  return render(
    <CartProvider>
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    </CartProvider>
  );
}

function seedCart(items) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const cartItem = (overrides = {}) => ({
  productId: 1,
  name: 'Sunlit Amber',
  priceCents: 4800,
  qty: 1,
  stock: 20,
  slug: 'sunlit-amber',
  ...overrides,
});

beforeEach(() => {
  window.localStorage.clear();
  vi.mocked(api.createOrder).mockReset();
});

describe('CheckoutPage', () => {
  it('shows the empty state text and a link back to browse products when the cart is empty', () => {
    renderCheckoutPage();

    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse products' })).toBeInTheDocument();
  });

  it('shows a validation error for every required field when the form is submitted empty', () => {
    seedCart([cartItem()]);

    renderCheckoutPage();

    fireEvent.click(screen.getByRole('button', { name: 'Submit order request' }));

    const expectedErrors = validateCheckout({});
    Object.values(expectedErrors).forEach((message) => {
      expect(screen.getByText(message)).toBeInTheDocument();
    });
    expect(api.createOrder).not.toHaveBeenCalled();
  });

  it('does not show a validation error for the optional address line 2 or note fields', () => {
    seedCart([cartItem()]);

    renderCheckoutPage();

    fireEvent.click(screen.getByRole('button', { name: 'Submit order request' }));

    expect(screen.getByLabelText('Address line 2 (optional)')).not.toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByLabelText('Note (optional)')).not.toHaveAttribute('aria-invalid', 'true');
  });
});
