import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import { AuthProvider } from '@/context/AuthContext.jsx';
import { CartProvider } from '@/context/CartContext.jsx';
import { validateCheckout } from '@/lib/checkoutValidation.js';
import CheckoutPage from '@/pages/store/CheckoutPage.jsx';

// Keep the real ApiError class (its constructor sets `message`/`status`);
// only replace the `api` functions with mocks.
vi.mock('@/lib/api.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    api: Object.fromEntries(Object.keys(actual.api).map((key) => [key, vi.fn()])),
  };
});

const STORAGE_KEY = 'simple_ecom_cart';

const authedUser = {
  id: 1,
  email: 'ada@example.com',
  name: 'Ada Lovelace',
  avatarUrl: null,
  role: 'customer',
};

function renderCheckoutPage({ initialEntries = ['/checkout'] } = {}) {
  return render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<p>login page</p>} />
          </Routes>
        </MemoryRouter>
      </CartProvider>
    </AuthProvider>
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
  vi.mocked(api.authMe).mockReset();
});

describe('CheckoutPage', () => {
  it('redirects an anonymous visitor to /login?returnTo=%2Fcheckout', async () => {
    vi.mocked(api.authMe).mockRejectedValue(new ApiError('Not authenticated', 401));
    seedCart([cartItem()]);

    renderCheckoutPage();

    await waitFor(() => expect(screen.getByText('login page')).toBeInTheDocument());
  });

  it('shows "Loading…" while the auth status is being determined', () => {
    vi.mocked(api.authMe).mockReturnValue(new Promise(() => {})); // never resolves
    seedCart([cartItem()]);

    renderCheckoutPage();

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('pre-fills Full name and Email from the signed-in user', async () => {
    vi.mocked(api.authMe).mockResolvedValue({ user: authedUser });
    seedCart([cartItem()]);

    renderCheckoutPage();

    await waitFor(() => expect(screen.getByLabelText('Full name')).toHaveValue('Ada Lovelace'));
    expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com');
  });

  it('shows the empty state text and a link back to browse products when the cart is empty', async () => {
    vi.mocked(api.authMe).mockResolvedValue({ user: authedUser });

    renderCheckoutPage();

    await waitFor(() => expect(screen.getByText('Your cart is empty.')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'Browse products' })).toBeInTheDocument();
  });

  it('shows a validation error for every required field when the form is submitted empty', async () => {
    vi.mocked(api.authMe).mockResolvedValue({ user: authedUser });
    seedCart([cartItem()]);

    renderCheckoutPage();
    await waitFor(() => expect(screen.getByLabelText('Full name')).toHaveValue('Ada Lovelace'));

    // Full name and Email arrive pre-filled from the signed-in user; clear
    // them so every required field is empty, matching validateCheckout({}).
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit order request' }));

    const expectedErrors = validateCheckout({});
    Object.values(expectedErrors).forEach((message) => {
      expect(screen.getByText(message)).toBeInTheDocument();
    });
    expect(api.createOrder).not.toHaveBeenCalled();
  });

  it('does not show a validation error for the optional address line 2 or note fields', async () => {
    vi.mocked(api.authMe).mockResolvedValue({ user: authedUser });
    seedCart([cartItem()]);

    renderCheckoutPage();
    await waitFor(() => expect(screen.getByLabelText('Full name')).toHaveValue('Ada Lovelace'));

    fireEvent.click(screen.getByRole('button', { name: 'Submit order request' }));

    expect(screen.getByLabelText('Address line 2 (optional)')).not.toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByLabelText('Note (optional)')).not.toHaveAttribute('aria-invalid', 'true');
  });
});
