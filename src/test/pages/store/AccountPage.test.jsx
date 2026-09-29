import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import { AuthProvider } from '@/context/AuthContext.jsx';
import { orderNumber } from '@/lib/orderNumber.js';
import AccountPage from '@/pages/store/AccountPage.jsx';

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
  ...overrides,
});

const adminUser = {
  id: 2,
  email: 'admin@example.com',
  name: 'Admin Ada',
  avatarUrl: null,
  role: 'admin',
  hasPassword: true,
};

const savedAddress = (overrides = {}) => ({
  id: 1,
  label: 'Home',
  recipientName: 'Ada Lovelace',
  phone: '555-0100',
  addressLine1: '1 Analytical Engine Way',
  addressLine2: null,
  city: 'London',
  region: 'LDN',
  postalCode: 'W1A 1AA',
  country: 'UK',
  isDefault: false,
  ...overrides,
});

function renderAccountPage({ initialEntries = ['/account'] } = {}) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/orders/:id" element={<p>account order page</p>} />
          <Route path="/login" element={<p>login page</p>} />
          <Route path="/" element={<p>home page</p>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

beforeEach(() => {
  vi.mocked(api.authMe).mockReset();
  vi.mocked(api.getMyOrders).mockReset();
  vi.mocked(api.getAddresses).mockReset();
  vi.mocked(api.getAddresses).mockResolvedValue({ addresses: [] });
});

describe('AccountPage', () => {
  it('redirects an anonymous visitor to /login', async () => {
    vi.mocked(api.authMe).mockRejectedValue(new ApiError('Not authenticated', 401));

    renderAccountPage();

    await waitFor(() => expect(screen.getByText('login page')).toBeInTheDocument());
  });

  it('shows the eyebrow, the name heading, and the Orders/Profile/Addresses sections', async () => {
    vi.mocked(api.authMe).mockResolvedValue({ user: customerUser() });
    vi.mocked(api.getMyOrders).mockResolvedValue({ orders: [] });

    renderAccountPage();

    await waitFor(() => expect(screen.getByText('Your account')).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Orders' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Addresses' })).toBeInTheDocument();
  });

  it("renders each order's number and status as a link to its detail page", async () => {
    vi.mocked(api.authMe).mockResolvedValue({ user: customerUser() });
    vi.mocked(api.getMyOrders).mockResolvedValue({
      orders: [
        {
          id: ORDER_ID,
          status: 'shipped',
          totalCents: 9600,
          itemCount: 2,
          createdAt: '2026-01-01T00:00:00Z',
        },
      ],
    });

    renderAccountPage();

    const row = await screen.findByRole('link', { name: new RegExp(orderNumber(ORDER_ID)) });
    expect(row).toHaveAttribute('href', `/account/orders/${ORDER_ID}`);
    expect(row).toHaveTextContent('shipped');
  });

  it('shows "No orders yet" with a Browse products link when the order list is empty', async () => {
    vi.mocked(api.authMe).mockResolvedValue({ user: customerUser() });
    vi.mocked(api.getMyOrders).mockResolvedValue({ orders: [] });

    renderAccountPage();

    await waitFor(() => expect(screen.getByText('No orders yet')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'Browse products' })).toBeInTheDocument();
  });

  it('hides the password form when the user has no password (Google-only)', async () => {
    vi.mocked(api.authMe).mockResolvedValue({ user: customerUser({ hasPassword: false }) });
    vi.mocked(api.getMyOrders).mockResolvedValue({ orders: [] });

    renderAccountPage();

    await waitFor(() => expect(screen.getByText('No orders yet')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Change password' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Current password')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument();
  });

  it('shows the password form when the user has a password', async () => {
    vi.mocked(api.authMe).mockResolvedValue({ user: customerUser({ hasPassword: true }) });
    vi.mocked(api.getMyOrders).mockResolvedValue({ orders: [] });

    renderAccountPage();

    await waitFor(() => expect(screen.getByLabelText('Current password')).toBeInTheDocument());
    expect(screen.getByLabelText('New password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change password' })).toBeInTheDocument();
  });

  it('shows an admin an admin-area link instead of the dashboard', async () => {
    vi.mocked(api.authMe).mockResolvedValue({ user: adminUser });

    renderAccountPage();

    const link = await screen.findByRole('link', { name: /admin area/i });
    expect(link).toHaveAttribute('href', '/admin');
    expect(screen.queryByRole('heading', { name: 'Orders' })).not.toBeInTheDocument();
    expect(api.getMyOrders).not.toHaveBeenCalled();
  });

  describe('Addresses', () => {
    it('shows "No saved addresses yet." when there are none', async () => {
      vi.mocked(api.authMe).mockResolvedValue({ user: customerUser() });
      vi.mocked(api.getMyOrders).mockResolvedValue({ orders: [] });
      vi.mocked(api.getAddresses).mockResolvedValue({ addresses: [] });

      renderAccountPage();

      await waitFor(() => expect(screen.getByText('No saved addresses yet.')).toBeInTheDocument());
    });

    it('renders a card per address with its recipient and label', async () => {
      // A different user name than either address's recipientName, so the
      // page's own <h1> heading can't be mistaken for a card's content.
      vi.mocked(api.authMe).mockResolvedValue({ user: customerUser({ name: 'Ada Customer' }) });
      vi.mocked(api.getMyOrders).mockResolvedValue({ orders: [] });
      vi.mocked(api.getAddresses).mockResolvedValue({
        addresses: [
          savedAddress({ id: 1, label: 'Home', isDefault: true }),
          savedAddress({ id: 2, label: 'Work', recipientName: 'Grace Hopper', isDefault: false }),
        ],
      });

      renderAccountPage();

      await waitFor(() => expect(screen.getByText('Home')).toBeInTheDocument());
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
      expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    });

    it('shows a "Default" badge only on the default address', async () => {
      vi.mocked(api.authMe).mockResolvedValue({ user: customerUser() });
      vi.mocked(api.getMyOrders).mockResolvedValue({ orders: [] });
      vi.mocked(api.getAddresses).mockResolvedValue({
        addresses: [
          savedAddress({ id: 1, label: 'Home', isDefault: true }),
          savedAddress({ id: 2, label: 'Work', isDefault: false }),
        ],
      });

      renderAccountPage();

      await waitFor(() => expect(screen.getByText('Home')).toBeInTheDocument());
      expect(screen.getAllByText('Default')).toHaveLength(1);
    });
  });
});
