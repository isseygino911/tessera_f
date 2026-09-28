import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '@/context/CartContext.jsx';
import Header from '@/components/Header.jsx';

const STORAGE_KEY = 'simple_ecom_cart';

function renderHeader() {
  return render(
    <CartProvider>
      <MemoryRouter>
        <Header />
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

afterEach(() => {
  window.localStorage.clear();
});

describe('Header', () => {
  it('links the wordmark to / with the accessible name "Faceted & Co."', () => {
    renderHeader();

    expect(screen.getByRole('link', { name: 'Faceted & Co.' })).toHaveAttribute('href', '/');
  });

  it('renders the Main nav with links to the stones, craft, story and order sections, plus Shop →', () => {
    renderHeader();

    const nav = screen.getByRole('navigation', { name: 'Main' });

    expect(within(nav).getByRole('link', { name: 'Stones' })).toHaveAttribute('href', '/#stones');
    expect(within(nav).getByRole('link', { name: 'Craft' })).toHaveAttribute('href', '/#craft');
    expect(within(nav).getByRole('link', { name: 'Story' })).toHaveAttribute('href', '/#story');
    expect(within(nav).getByRole('link', { name: 'Order' })).toHaveAttribute('href', '/#order');

    expect(screen.getByRole('link', { name: /Shop/ })).toHaveAttribute('href', '/#order');
  });

  it('links the bag to /cart with accessible name "Cart, 0 items" when the cart is empty', () => {
    renderHeader();

    expect(screen.getByRole('link', { name: 'Cart, 0 items' })).toHaveAttribute('href', '/cart');
  });

  it('sums the quantities of items already in the cart for the bag accessible name', () => {
    seedCart([cartItem({ productId: 1, qty: 2 }), cartItem({ productId: 2, qty: 3 })]);

    renderHeader();

    expect(screen.getByRole('link', { name: 'Cart, 5 items' })).toBeInTheDocument();
  });

  it('toggles aria-expanded on the Menu button and shows the Mobile nav when open', () => {
    renderHeader();

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
});
