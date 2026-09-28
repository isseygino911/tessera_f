import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import { AuthProvider } from '@/context/AuthContext.jsx';
import { CartProvider } from '@/context/CartContext.jsx';
import { validateCheckout } from '@/lib/checkoutValidation.js';
import CheckoutPage from '@/pages/store/CheckoutPage.jsx';
import ThanksPage from '@/pages/store/ThanksPage.jsx';

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
const ORDER_ID = '3f2a9c1b-7d4e-4a1a-9c3e-1234567890ab';

const authedUser = {
  id: 1,
  email: 'ada@example.com',
  name: 'Ada Lovelace',
  avatarUrl: null,
  role: 'customer',
};

const adminUser = {
  id: 2,
  email: 'admin@example.com',
  name: 'Admin Ada',
  avatarUrl: null,
  role: 'admin',
};

function renderCheckoutPage({ initialEntries = ['/checkout'] } = {}) {
  return render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<p>login page</p>} />
            <Route path="/thanks/:id" element={<ThanksPage />} />
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

const validForm = {
  phone: '555-0100',
  addressLine1: '1 Analytical Engine Way',
  city: 'London',
  region: 'LDN',
  postalCode: 'W1A 1AA',
  country: 'UK',
};

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText('Phone'), { target: { value: validForm.phone } });
  fireEvent.change(screen.getByLabelText('Address line 1'), {
    target: { value: validForm.addressLine1 },
  });
  fireEvent.change(screen.getByLabelText('City'), { target: { value: validForm.city } });
  fireEvent.change(screen.getByLabelText('State / region'), {
    target: { value: validForm.region },
  });
  fireEvent.change(screen.getByLabelText('Postal code'), {
    target: { value: validForm.postalCode },
  });
  fireEvent.change(screen.getByLabelText('Country'), { target: { value: validForm.country } });
}

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
    fireEvent.click(screen.getByRole('button', { name: 'Place order' }));

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

    fireEvent.click(screen.getByRole('button', { name: 'Place order' }));

    expect(screen.getByLabelText('Address line 2 (optional)')).not.toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByLabelText('Note (optional)')).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('shows "Admin accounts can\'t place orders." and no form for a signed-in admin', async () => {
    vi.mocked(api.authMe).mockResolvedValue({ user: adminUser });
    seedCart([cartItem()]);

    renderCheckoutPage();

    await waitFor(() =>
      expect(screen.getByText("Admin accounts can't place orders.")).toBeInTheDocument()
    );
    expect(screen.queryByLabelText('Full name')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Place order' })).not.toBeInTheDocument();
  });

  it('navigates to /thanks/<uuid> using the id returned by createOrder', async () => {
    vi.mocked(api.authMe).mockResolvedValue({ user: authedUser });
    vi.mocked(api.createOrder).mockResolvedValue({ id: ORDER_ID });
    seedCart([cartItem()]);

    renderCheckoutPage();
    await waitFor(() => expect(screen.getByLabelText('Full name')).toHaveValue('Ada Lovelace'));
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Place order' }));

    await waitFor(() => expect(screen.getAllByText('#3F2A9C1B').length).toBeGreaterThan(0));
  });
});
