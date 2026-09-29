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

// Signs out by default so tests that don't care about auth don't have to
// wait on a resolved user before the header settles.
async function signedOut() {
  vi.mocked(api.authMe).mockRejectedValue(new ApiError('Not authenticated', 401));
  renderHeader();
  await waitFor(() => expect(api.authMe).toHaveBeenCalled());
}

beforeEach(() => {
  window.localStorage.clear();
  vi.mocked(api.authMe).mockReset();
  vi.mocked(api.authLogout).mockReset();
});

afterEach(() => {
  window.localStorage.clear();
});

describe('Header', () => {
  it('links the wordmark to / with the accessible name "Tessera"', async () => {
    await signedOut();
    expect(screen.getByRole('link', { name: 'Tessera' })).toHaveAttribute('href', '/');
  });

  it('renders the Main nav with links to the stones, craft, story and order sections, plus Shop →, in both the bar and the panel', async () => {
    await signedOut();
    const nav = screen.getByRole('navigation', { name: 'Main' });

    expect(within(nav).getByRole('link', { name: 'Stones' })).toHaveAttribute('href', '/#stones');
    expect(within(nav).getByRole('link', { name: 'Craft' })).toHaveAttribute('href', '/#craft');
    expect(within(nav).getByRole('link', { name: 'Story' })).toHaveAttribute('href', '/#story');
    expect(within(nav).getByRole('link', { name: 'Order' })).toHaveAttribute('href', '/#order');

    const shopLinks = screen.getAllByRole('link', { name: /Shop/ });
    expect(shopLinks.length).toBeGreaterThan(0);
    for (const link of shopLinks) {
      expect(link).toHaveAttribute('href', '/#order');
    }
  });

  it('renders the bag as a button named "Cart, 0 items" when the cart is empty', async () => {
    await signedOut();
    expect(screen.getByRole('button', { name: 'Cart, 0 items' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Cart,/ })).not.toBeInTheDocument();
  });

  it('sums the quantities of items already in the cart for the bag accessible name', async () => {
    seedCart([cartItem({ productId: 1, qty: 2 }), cartItem({ productId: 2, qty: 3 })]);
    await signedOut();

    expect(screen.getByRole('button', { name: 'Cart, 5 items' })).toBeInTheDocument();
  });

  it("the hamburger toggles aria-expanded, its label, aria-controls and the Mobile nav's inert state", async () => {
    await signedOut();

    const menuButton = screen.getByRole('button', { name: 'Open menu' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton).toHaveAttribute('aria-controls', 'site-menu');
    // The panel is always mounted; closed means inert, not absent.
    expect(screen.getByRole('navigation', { name: 'Mobile' })).toHaveAttribute('inert');

    fireEvent.click(menuButton);

    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByRole('navigation', { name: 'Mobile' })).not.toHaveAttribute('inert');

    fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));

    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.getByRole('navigation', { name: 'Mobile' })).toHaveAttribute('inert');
  });

  it('closes the menu on Escape', async () => {
    await signedOut();

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.getByRole('navigation', { name: 'Mobile' })).toHaveAttribute('inert');
  });

  it('closes the menu when a panel link is clicked', async () => {
    await signedOut();

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    const mobileNav = screen.getByRole('navigation', { name: 'Mobile' });

    fireEvent.click(within(mobileNav).getByRole('link', { name: 'Stones' }));

    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.getByRole('navigation', { name: 'Mobile' })).toHaveAttribute('inert');
  });

  it('shows a "Sign in" link to /login when signed out, in both the bar and the panel', async () => {
    await signedOut();

    const signInLinks = screen.getAllByRole('link', { name: 'Sign in' });
    expect(signInLinks.length).toBeGreaterThan(0);
    for (const link of signInLinks) {
      expect(link).toHaveAttribute('href', '/login');
    }
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

    await waitFor(() => expect(screen.getAllByText('Ada').length).toBeGreaterThan(0));
    expect(screen.getAllByRole('button', { name: 'Sign out' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
  });

  it('shows an "Admin" link to /admin for admins, in both the bar and the panel', async () => {
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
      expect(screen.getAllByRole('link', { name: 'Admin' }).length).toBeGreaterThan(0)
    );
    for (const link of screen.getAllByRole('link', { name: 'Admin' })) {
      expect(link).toHaveAttribute('href', '/admin');
    }
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

    const [signOutButton] = await screen.findAllByRole('button', { name: 'Sign out' });
    fireEvent.click(signOutButton);

    await waitFor(() => expect(api.authLogout).toHaveBeenCalled());
  });
});
