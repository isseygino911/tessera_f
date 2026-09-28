import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '@/context/CartContext.jsx';
import { formatPrice } from '@/lib/formatPrice.js';
import CartPage from '@/pages/store/CartPage.jsx';

const STORAGE_KEY = 'simple_ecom_cart';

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
});

describe('CartPage', () => {
  it('shows the empty state text and a link back to browse products', () => {
    renderCartPage();

    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse products' })).toBeInTheDocument();
  });

  it('shows the line name and line total for a seeded cart item, and the cart Total', () => {
    seedCart([cartItem({ priceCents: 4800, qty: 2 })]);

    renderCartPage();

    const line = screen.getByRole('listitem');
    expect(within(line).getByText('Sunlit Amber')).toBeInTheDocument();
    expect(within(line).getByText(formatPrice(4800 * 2))).toBeInTheDocument();

    const totalLabel = screen.getByText('Total');
    expect(within(totalLabel.parentElement).getByText(formatPrice(4800 * 2))).toBeInTheDocument();
  });

  it('sums multiple lines into the Total', () => {
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
});
