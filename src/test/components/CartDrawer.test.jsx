import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import { AuthProvider } from '@/context/AuthContext.jsx';
import { CartProvider } from '@/context/CartContext.jsx';
import { formatPrice } from '@/lib/formatPrice.js';
import Header from '@/components/Header.jsx';
import CartDrawer from '@/components/CartDrawer.jsx';

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

const amberProduct = {
  id: 1,
  slug: 'sunlit-amber',
  name: 'Sunlit Amber',
  priceCents: 4800,
  stock: 20,
  images: [
    {
      id: 1,
      name: 'main',
      url: 'https://s3.test/products/sunlit-amber/main.jpg',
      alt: '',
      role: 'main',
    },
  ],
};

const emeraldProduct = {
  id: 2,
  slug: 'forest-emerald',
  name: 'Forest Emerald',
  priceCents: 5200,
  stock: 20,
  images: [
    {
      id: 2,
      name: 'main',
      url: 'https://s3.test/products/forest-emerald/main.jpg',
      alt: '',
      role: 'main',
    },
  ],
};

function renderApp() {
  return render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter>
          <Header />
          <CartDrawer />
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

// The drawer is always mounted (inert when closed), so `getByRole('dialog', …)`
// finds it either way; this asserts the open state specifically.
function expectDrawerOpen() {
  expect(screen.getByRole('dialog', { name: 'Your cart' })).not.toHaveAttribute('inert');
}

function expectDrawerClosed() {
  expect(screen.getByRole('dialog', { name: 'Your cart' })).toHaveAttribute('inert');
}

// Renders signed-out (auth isn't under test here) and opens the drawer from
// the bag button, which every test but the "opens" one itself needs first.
async function renderAndOpenDrawer() {
  vi.mocked(api.authMe).mockRejectedValue(new ApiError('Not authenticated', 401));
  renderApp();
  await waitFor(() => expect(api.authMe).toHaveBeenCalled());

  const bagButton = screen.getByRole('button', { name: /Cart, \d+ items?/ });
  fireEvent.click(bagButton);

  await waitFor(() => expectDrawerOpen());
  const dialog = screen.getByRole('dialog', { name: 'Your cart' });
  return { dialog, bagButton };
}

beforeEach(() => {
  window.localStorage.clear();
  vi.mocked(api.authMe).mockReset();
  vi.mocked(api.getProducts).mockReset();
  vi.mocked(api.getProducts).mockResolvedValue([]);
});

afterEach(() => {
  window.localStorage.clear();
});

describe('CartDrawer', () => {
  it('is closed (inert) until the bag button is clicked, then opens as a dialog named "Your cart"', async () => {
    vi.mocked(api.authMe).mockRejectedValue(new ApiError('Not authenticated', 401));
    renderApp();
    await waitFor(() => expect(api.authMe).toHaveBeenCalled());

    expectDrawerClosed();

    fireEvent.click(screen.getByRole('button', { name: /Cart, \d+ items?/ }));

    await waitFor(() => expectDrawerOpen());
  });

  it('calls api.getProducts when it opens', async () => {
    seedCart([cartItem()]);
    await renderAndOpenDrawer();

    await waitFor(() => expect(api.getProducts).toHaveBeenCalled());
  });

  it('shows the line name, price and the cart Total for a seeded item', async () => {
    api.getProducts.mockResolvedValue([amberProduct]);
    seedCart([cartItem({ priceCents: 4800, qty: 2 })]);

    const { dialog } = await renderAndOpenDrawer();

    const line = within(dialog).getByRole('listitem');
    expect(within(line).getByText('Sunlit Amber')).toBeInTheDocument();
    expect(within(line).getByText(formatPrice(4800 * 2))).toBeInTheDocument();

    const totalLabel = within(dialog).getByText('Total');
    expect(within(totalLabel.parentElement).getByText(formatPrice(4800 * 2))).toBeInTheDocument();
  });

  it('sums multiple lines into the Total', async () => {
    api.getProducts.mockResolvedValue([amberProduct, emeraldProduct]);
    seedCart([
      cartItem({ productId: 1, name: 'Sunlit Amber', priceCents: 4800, qty: 1 }),
      cartItem({ productId: 2, name: 'Forest Emerald', priceCents: 5200, qty: 1 }),
    ]);

    const { dialog } = await renderAndOpenDrawer();

    const totalLabel = within(dialog).getByText('Total');
    expect(
      within(totalLabel.parentElement).getByText(formatPrice(4800 + 5200))
    ).toBeInTheDocument();
  });

  it('updates the total when a line quantity is increased', async () => {
    api.getProducts.mockResolvedValue([amberProduct]);
    seedCart([cartItem({ priceCents: 4800, qty: 1 })]);

    const { dialog } = await renderAndOpenDrawer();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Increase quantity' }));

    const totalLabel = within(dialog).getByText('Total');
    await waitFor(() =>
      expect(within(totalLabel.parentElement).getByText(formatPrice(4800 * 2))).toBeInTheDocument()
    );
  });

  it('removes a line and updates the total when Remove is clicked', async () => {
    api.getProducts.mockResolvedValue([amberProduct, emeraldProduct]);
    seedCart([
      cartItem({ productId: 1, name: 'Sunlit Amber', priceCents: 4800, qty: 1 }),
      cartItem({ productId: 2, name: 'Forest Emerald', priceCents: 5200, qty: 1 }),
    ]);

    const { dialog } = await renderAndOpenDrawer();

    const emeraldLine = within(dialog).getByText('Forest Emerald').closest('li');
    fireEvent.click(within(emeraldLine).getByRole('button', { name: 'Remove' }));

    await waitFor(() =>
      expect(within(dialog).queryByText('Forest Emerald')).not.toBeInTheDocument()
    );
    const totalLabel = within(dialog).getByText('Total');
    expect(within(totalLabel.parentElement).getByText(formatPrice(4800))).toBeInTheDocument();
  });

  it('shows the empty state with a "Browse stones" link to /#stones when the cart is empty', async () => {
    const { dialog } = await renderAndOpenDrawer();

    expect(within(dialog).getByText('Your cart is empty.')).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: 'Browse stones' })).toHaveAttribute(
      'href',
      '/#stones'
    );
  });

  it('has Checkout and View cart links to /checkout and /cart', async () => {
    api.getProducts.mockResolvedValue([amberProduct]);
    seedCart([cartItem()]);

    const { dialog } = await renderAndOpenDrawer();

    expect(within(dialog).getByRole('link', { name: 'Checkout' })).toHaveAttribute(
      'href',
      '/checkout'
    );
    expect(within(dialog).getByRole('link', { name: 'View cart' })).toHaveAttribute(
      'href',
      '/cart'
    );
  });

  it('closes on Escape and returns focus to the bag button', async () => {
    const { bagButton } = await renderAndOpenDrawer();

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expectDrawerClosed());
    expect(bagButton).toHaveFocus();
  });

  it('closes when the "Close cart" button is clicked and returns focus to the bag button', async () => {
    const { dialog, bagButton } = await renderAndOpenDrawer();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close cart' }));

    await waitFor(() => expectDrawerClosed());
    expect(bagButton).toHaveFocus();
  });

  it('closes when the backdrop is clicked and returns focus to the bag button', async () => {
    // Assumes the backdrop element carries the class `cart-drawer__backdrop`,
    // per the plan's "dimmed backdrop" layout description.
    const { bagButton } = await renderAndOpenDrawer();

    const backdrop = document.querySelector('.cart-drawer__backdrop');
    expect(backdrop).toBeTruthy();
    fireEvent.click(backdrop);

    await waitFor(() => expectDrawerClosed());
    expect(bagButton).toHaveFocus();
  });
});
