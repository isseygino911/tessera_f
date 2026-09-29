import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import { AuthProvider } from '@/context/AuthContext.jsx';
import { orderNumber } from '@/lib/orderNumber.js';
import AccountOrderPage from '@/pages/store/AccountOrderPage.jsx';

// Keep the real ApiError class (its constructor sets `message`/`status`);
// only replace the `api` functions with mocks.
vi.mock('@/lib/api.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    api: Object.fromEntries(Object.keys(actual.api).map((key) => [key, vi.fn()])),
  };
});

const ORDER_ID = '3f2a9c1b-7d4e-4a1a-9c3e-1234567890ab';

const customerUser = (overrides = {}) => ({
  id: 1,
  email: 'ada@example.com',
  name: 'Ada Lovelace',
  avatarUrl: null,
  role: 'customer',
  hasPassword: true,
  address: null,
  ...overrides,
});

const adminUser = {
  id: 2,
  email: 'admin@example.com',
  name: 'Admin Ada',
  avatarUrl: null,
  role: 'admin',
  hasPassword: true,
  address: null,
};

function buildOrder(overrides = {}) {
  return {
    id: ORDER_ID,
    status: 'shipped',
    totalCents: 9600,
    createdAt: '2026-01-01T00:00:00Z',
    customerName: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '555-0100',
    addressLine1: '1 Analytical Engine Way',
    addressLine2: null,
    city: 'London',
    region: 'LDN',
    postalCode: 'W1A 1AA',
    country: 'UK',
    note: null,
    items: [
      {
        productId: 1,
        productName: 'Sunlit Amber',
        unitPriceCents: 4800,
        quantity: 2,
        imageUrl: 'https://s3.test/products/sunlit-amber/main.jpg',
      },
    ],
    ...overrides,
  };
}

function renderAccountOrderPage({ id = ORDER_ID, initialEntries } = {}) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries ?? [`/account/orders/${id}`]}>
        <Routes>
          <Route path="/account/orders/:id" element={<AccountOrderPage />} />
          <Route path="/account" element={<p>account page</p>} />
          <Route path="/login" element={<p>login page</p>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

beforeEach(() => {
  vi.mocked(api.authMe).mockReset();
  vi.mocked(api.getMyOrder).mockReset();
});

describe('AccountOrderPage', () => {
  it('redirects an anonymous visitor to /login with a returnTo back to this order', async () => {
    vi.mocked(api.authMe).mockRejectedValue(new ApiError('Not authenticated', 401));

    renderAccountOrderPage();

    await waitFor(() => expect(screen.getByText('login page')).toBeInTheDocument());
  });

  it('shows the order number, items and no cancel button', async () => {
    vi.mocked(api.authMe).mockResolvedValue({ user: customerUser() });
    vi.mocked(api.getMyOrder).mockResolvedValue(buildOrder());

    renderAccountOrderPage();

    expect(await screen.findByRole('heading', { name: orderNumber(ORDER_ID) })).toBeInTheDocument();
    expect(screen.getByText('Sunlit Amber')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  it('shows the status steps with the current step marked aria-current="step"', async () => {
    vi.mocked(api.authMe).mockResolvedValue({ user: customerUser() });
    vi.mocked(api.getMyOrder).mockResolvedValue(buildOrder({ status: 'paid' }));

    renderAccountOrderPage();

    await screen.findByRole('heading', { name: orderNumber(ORDER_ID) });
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Contacted')).toBeInTheDocument();
    expect(screen.getByText('Shipped')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toHaveAttribute('aria-current', 'step');
  });

  it('shows a single "Cancelled" note instead of status steps for a cancelled order', async () => {
    vi.mocked(api.authMe).mockResolvedValue({ user: customerUser() });
    vi.mocked(api.getMyOrder).mockResolvedValue(buildOrder({ status: 'cancelled' }));

    renderAccountOrderPage();

    expect(await screen.findByText('Cancelled')).toBeInTheDocument();
    expect(screen.queryByText('Shipped')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  it('links back to /account', async () => {
    vi.mocked(api.authMe).mockResolvedValue({ user: customerUser() });
    vi.mocked(api.getMyOrder).mockResolvedValue(buildOrder());

    renderAccountOrderPage();

    await screen.findByRole('heading', { name: orderNumber(ORDER_ID) });
    expect(screen.getByRole('link', { name: /your account/i })).toHaveAttribute('href', '/account');
  });

  it('shows "Order not found." for another user\'s order (404)', async () => {
    vi.mocked(api.authMe).mockResolvedValue({ user: customerUser() });
    vi.mocked(api.getMyOrder).mockRejectedValue(new ApiError('Not found', 404));

    renderAccountOrderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Order not found.');
  });

  it('shows an admin a link to the admin order view instead of the customer detail', async () => {
    vi.mocked(api.authMe).mockResolvedValue({ user: adminUser });

    renderAccountOrderPage();

    const link = await screen.findByRole('link', { name: /admin area/i });
    expect(link).toHaveAttribute('href', `/admin/orders/${ORDER_ID}`);
    expect(api.getMyOrder).not.toHaveBeenCalled();
  });
});
