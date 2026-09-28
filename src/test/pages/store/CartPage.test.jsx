import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '@/context/CartContext.jsx';
import { api } from '@/lib/api.js';
import { formatPrice } from '@/lib/formatPrice.js';
import CartPage from '@/pages/store/CartPage.jsx';

vi.mock('@/lib/api.js');

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

function renderCartPage() {
  return render(
    <CartProvider>
      <MemoryRouter>
        <CartPage />
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
  qty: 2,
  stock: 20,
  slug: 'sunlit-amber',
  ...overrides,
});

beforeEach(() => {
  window.localStorage.clear();
  vi.mocked(api.getProducts).mockReset();
  // CartPage always calls getProducts() on mount for the line photos; tests
  // that care about a specific catalogue response override this.
  vi.mocked(api.getProducts).mockResolvedValue([]);
});

describe('CartPage', () => {
  it('shows the empty state text and a link back to browse products', () => {
    renderCartPage();

    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse products' })).toBeInTheDocument();
  });

  it('shows the line name and line total for a seeded cart item, and the cart Total', () => {
    api.getProducts.mockResolvedValue([amberProduct]);
    seedCart([cartItem({ priceCents: 4800, qty: 2 })]);

    renderCartPage();

    const line = screen.getByRole('listitem');
    expect(within(line).getByText('Sunlit Amber')).toBeInTheDocument();
    expect(within(line).getByText(formatPrice(4800 * 2))).toBeInTheDocument();

    const totalLabel = screen.getByText('Total');
    expect(within(totalLabel.parentElement).getByText(formatPrice(4800 * 2))).toBeInTheDocument();
  });

  it('sums multiple lines into the Total', () => {
    api.getProducts.mockResolvedValue([amberProduct, emeraldProduct]);
    seedCart([
      cartItem({ productId: 1, name: 'Sunlit Amber', priceCents: 4800, qty: 1 }),
      cartItem({ productId: 2, name: 'Forest Emerald', priceCents: 5200, qty: 1 }),
    ]);

    renderCartPage();

    const totalLabel = screen.getByText('Total');
    expect(
      within(totalLabel.parentElement).getByText(formatPrice(4800 + 5200))
    ).toBeInTheDocument();
  });

  it("shows each line's main image, matched by productId, once the catalogue loads", async () => {
    api.getProducts.mockResolvedValue([amberProduct, emeraldProduct]);
    seedCart([
      cartItem({ productId: 1, name: 'Sunlit Amber' }),
      cartItem({ productId: 2, name: 'Forest Emerald' }),
    ]);

    renderCartPage();

    const amberImg = await screen.findByRole('img', { name: 'Sunlit Amber' });
    expect(amberImg).toHaveAttribute('src', 'https://s3.test/products/sunlit-amber/main.jpg');

    const emeraldImg = screen.getByRole('img', { name: 'Forest Emerald' });
    expect(emeraldImg).toHaveAttribute('src', 'https://s3.test/products/forest-emerald/main.jpg');
  });

  it('shows a placeholder for a cart line whose product is not in the loaded catalogue', async () => {
    api.getProducts.mockResolvedValue([emeraldProduct]);
    seedCart([cartItem({ productId: 1, name: 'Sunlit Amber' })]);

    renderCartPage();

    await screen.findByText('Sunlit Amber');
    expect(screen.queryByRole('img', { name: 'Sunlit Amber' })).not.toBeInTheDocument();
  });

  it('shows a placeholder for every line when the catalogue fails to load', async () => {
    api.getProducts.mockRejectedValue(new Error('network down'));
    seedCart([cartItem({ productId: 1, name: 'Sunlit Amber' })]);

    renderCartPage();

    await screen.findByText('Sunlit Amber');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
