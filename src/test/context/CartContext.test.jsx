import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from '@/context/CartContext.jsx';

const STORAGE_KEY = 'simple_ecom_cart';

const amber = { id: 1, slug: 'sunlit-amber', name: 'Sunlit Amber', priceCents: 4800, stock: 20 };
const emerald = {
  id: 2,
  slug: 'forest-emerald',
  name: 'Forest Emerald',
  priceCents: 4800,
  stock: 3,
};
const soldOut = { id: 3, slug: 'ocean-topaz', name: 'Ocean Topaz', priceCents: 4800, stock: 0 };

function TestHarness() {
  const cart = useCart();
  return (
    <div>
      <div data-testid="total">{cart.totalCents}</div>
      <ul>
        {cart.items.map((item) => (
          <li key={item.productId} data-testid={`item-${item.productId}`}>
            {item.name} x{item.qty} (stock {item.stock})
          </li>
        ))}
      </ul>
      <button onClick={() => cart.add(amber, 1)}>add-amber</button>
      <button onClick={() => cart.add(emerald, 2)}>add-emerald</button>
      <button onClick={() => cart.add(soldOut, 1)}>add-sold-out</button>
      <button onClick={() => cart.setQty(1, 5)}>set-amber-5</button>
      <button onClick={() => cart.setQty(2, 999)}>set-emerald-over-stock</button>
      <button onClick={() => cart.remove(1)}>remove-amber</button>
      <button onClick={() => cart.clear()}>clear</button>
    </div>
  );
}

function renderCart() {
  return render(
    <CartProvider>
      <TestHarness />
    </CartProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('CartContext', () => {
  it('starts empty', () => {
    renderCart();

    expect(screen.queryByTestId('item-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('total')).toHaveTextContent('0');
  });

  it('adds a product to the cart', () => {
    renderCart();

    fireEvent.click(screen.getByText('add-amber'));

    expect(screen.getByTestId('item-1')).toHaveTextContent('Sunlit Amber x1 (stock 20)');
    expect(screen.getByTestId('total')).toHaveTextContent('4800');
  });

  it('merges adding the same product again into one line', () => {
    renderCart();

    fireEvent.click(screen.getByText('add-amber'));
    fireEvent.click(screen.getByText('add-amber'));

    expect(screen.getByTestId('item-1')).toHaveTextContent('Sunlit Amber x2');
    expect(screen.getByTestId('total')).toHaveTextContent(String(4800 * 2));
  });

  it('clamps added qty to available stock', () => {
    renderCart();

    // emerald has stock 3; add(emerald, 2) then add(emerald, 2) again -> would be 4, clamp to 3
    fireEvent.click(screen.getByText('add-emerald'));
    fireEvent.click(screen.getByText('add-emerald'));

    expect(screen.getByTestId('item-2')).toHaveTextContent('Forest Emerald x3');
  });

  it('ignores adding a sold-out product', () => {
    renderCart();

    fireEvent.click(screen.getByText('add-sold-out'));

    expect(screen.queryByTestId('item-3')).not.toBeInTheDocument();
    expect(screen.getByTestId('total')).toHaveTextContent('0');
  });

  it('setQty updates the quantity of an existing line', () => {
    renderCart();

    fireEvent.click(screen.getByText('add-amber'));
    fireEvent.click(screen.getByText('set-amber-5'));

    expect(screen.getByTestId('item-1')).toHaveTextContent('Sunlit Amber x5');
    expect(screen.getByTestId('total')).toHaveTextContent(String(4800 * 5));
  });

  it('setQty clamps to stock', () => {
    renderCart();

    fireEvent.click(screen.getByText('add-emerald'));
    fireEvent.click(screen.getByText('set-emerald-over-stock'));

    expect(screen.getByTestId('item-2')).toHaveTextContent('Forest Emerald x3');
  });

  it('remove deletes a line from the cart', () => {
    renderCart();

    fireEvent.click(screen.getByText('add-amber'));
    fireEvent.click(screen.getByText('add-emerald'));
    fireEvent.click(screen.getByText('remove-amber'));

    expect(screen.queryByTestId('item-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
  });

  it('clear empties the cart', () => {
    renderCart();

    fireEvent.click(screen.getByText('add-amber'));
    fireEvent.click(screen.getByText('add-emerald'));
    fireEvent.click(screen.getByText('clear'));

    expect(screen.queryByTestId('item-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('item-2')).not.toBeInTheDocument();
    expect(screen.getByTestId('total')).toHaveTextContent('0');
  });

  it('totalCents sums priceCents * qty across lines', () => {
    renderCart();

    fireEvent.click(screen.getByText('add-amber')); // 4800 x1
    fireEvent.click(screen.getByText('add-emerald')); // 4800 x2

    expect(screen.getByTestId('total')).toHaveTextContent(String(4800 * 1 + 4800 * 2));
  });

  it('persists cart contents to localStorage under simple_ecom_cart', () => {
    renderCart();

    fireEvent.click(screen.getByText('add-amber'));

    const stored = window.localStorage.getItem(STORAGE_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored);
    expect(parsed).toEqual(
      expect.arrayContaining([expect.objectContaining({ productId: 1, qty: 1, priceCents: 4800 })])
    );
  });

  it('restores cart contents from localStorage on mount', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ productId: 1, name: 'Sunlit Amber', priceCents: 4800, qty: 2, stock: 20 }])
    );

    renderCart();

    expect(screen.getByTestId('item-1')).toHaveTextContent('Sunlit Amber x2');
    expect(screen.getByTestId('total')).toHaveTextContent(String(4800 * 2));
  });

  it('drops a stored line with no numeric productId instead of crashing (old colorId cart)', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ colorId: 1, name: 'Sunlit Amber', priceCents: 4800, qty: 1, stock: 5 }])
    );

    expect(() => renderCart()).not.toThrow();

    expect(screen.queryByTestId('item-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('total')).toHaveTextContent('0');
  });

  it('does not crash when localStorage.getItem throws on mount', () => {
    const spy = vi.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });

    expect(() => renderCart()).not.toThrow();
    expect(screen.getByTestId('total')).toHaveTextContent('0');

    spy.mockRestore();
  });

  it('does not crash when localStorage.setItem throws on write', () => {
    const spy = vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    renderCart();
    expect(() => fireEvent.click(screen.getByText('add-amber'))).not.toThrow();
    expect(screen.getByTestId('item-1')).toHaveTextContent('Sunlit Amber x1');

    spy.mockRestore();
  });
});
