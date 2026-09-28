import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import { AuthProvider } from '@/context/AuthContext.jsx';
import { CartProvider } from '@/context/CartContext.jsx';
import Header from '@/components/Header.jsx';

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

function renderHeader() {
  return render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter>
          <Header />
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
  qty: 2,
  stock: 20,
  slug: 'sunlit-amber',
  ...overrides,
});

beforeEach(() => {
  window.localStorage.clear();
  vi.mocked(api.authMe).mockReset();
  vi.mocked(api.authLogout).mockReset();
});

afterEach(() => {
  window.localStorage.clear();
});

describe('Header', () => {
  it('links the wordmark to / with the accessible name "Faceted & Co."', async () => {
    vi.mocked(api.authMe).mockRejectedValue(new ApiError('Not authenticated', 401));
    renderHeader();

    await waitFor(() => expect(api.authMe).toHaveBeenCalled());
    expect(screen.getByRole('link', { name: 'Faceted & Co.' })).toHaveAttribute('href', '/');
  });

  it('renders the Main nav with links to the stones, craft, story and order sections, plus Shop →', async () => {
    vi.mocked(api.authMe).mockRejectedValue(new ApiError('Not authenticated', 401));
    renderHeader();

    await waitFor(() => expect(api.authMe).toHaveBeenCalled());
    const nav = screen.getByRole('navigation', { name: 'Main' });

    expect(within(nav).getByRole('link', { name: 'Stones' })).toHaveAttribute('href', '/#stones');
    expect(within(nav).getByRole('link', { name: 'Craft' })).toHaveAttribute('href', '/#craft');
    expect(within(nav).getByRole('link', { name: 'Story' })).toHaveAttribute('href', '/#story');
    expect(within(nav).getByRole('link', { name: 'Order' })).toHaveAttribute('href', '/#order');

    expect(screen.getByRole('link', { name: /Shop/ })).toHaveAttribute('href', '/#order');
  });

  it('links the bag to /cart with accessible name "Cart, 0 items" when the cart is empty', async () => {
    vi.mocked(api.authMe).mockRejectedValue(new ApiError('Not authenticated', 401));
    renderHeader();

    await waitFor(() => expect(api.authMe).toHaveBeenCalled());
    expect(screen.getByRole('link', { name: 'Cart, 0 items' })).toHaveAttribute('href', '/cart');
  });

  it('sums the quantities of items already in the cart for the bag accessible name', async () => {
    vi.mocked(api.authMe).mockRejectedValue(new ApiError('Not authenticated', 401));
    seedCart([cartItem({ productId: 1, qty: 2 }), cartItem({ productId: 2, qty: 3 })]);

    renderHeader();

    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Cart, 5 items' })).toBeInTheDocument()
    );
  });

  it('toggles aria-expanded on the Menu button and shows the Mobile nav when open', async () => {
    vi.mocked(api.authMe).mockRejectedValue(new ApiError('Not authenticated', 401));
    renderHeader();
    await waitFor(() => expect(api.authMe).toHaveBeenCalled());

    const menuButton = screen.getByRole('button', { name: 'Menu' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('navigation', { name: 'Mobile' })).not.toBeInTheDocument();

    fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('navigation', { name: 'Mobile' })).toBeInTheDocument();

    fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('navigation', { name: 'Mobile' })).not.toBeInTheDocument();
  });

  it('shows a "Sign in" link to /login when signed out', async () => {
    vi.mocked(api.authMe).mockRejectedValue(new ApiError('Not authenticated', 401));
    renderHeader();

    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login')
    );
    expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument();
  });

  it('shows the user\'s first name and a "Sign out" button when signed in', async () => {
    vi.mocked(api.authMe).mockResolvedValue({
      user: {
        id: 1,
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        avatarUrl: null,
        role: 'customer',
      },
    });
    renderHeader();

    await waitFor(() => expect(screen.getByText('Ada')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
  });

  it('shows an "Admin" link to /admin for admins', async () => {
    vi.mocked(api.authMe).mockResolvedValue({
      user: {
        id: 2,
        email: 'boss@example.com',
        name: 'Grace Hopper',
        avatarUrl: null,
        role: 'admin',
      },
    });
    renderHeader();

    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin')
    );
  });

  it('"Sign out" calls logout', async () => {
    vi.mocked(api.authMe).mockResolvedValue({
      user: {
        id: 1,
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        avatarUrl: null,
        role: 'customer',
      },
    });
    vi.mocked(api.authLogout).mockResolvedValue({ ok: true });
    renderHeader();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(api.authLogout).toHaveBeenCalled());
  });
});
