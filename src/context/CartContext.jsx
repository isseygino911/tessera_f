import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api.js';

const STORAGE_KEY = 'simple_ecom_cart';

const CartContext = createContext(null);

function loadInitialItems() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // slug is optional so carts saved before it existed still restore fine;
    // ProductPhoto falls back to its placeholder when it's missing.
    return parsed.filter(
      (item) =>
        item &&
        typeof item.productId === 'number' &&
        typeof item.name === 'string' &&
        typeof item.priceCents === 'number' &&
        typeof item.qty === 'number' &&
        typeof item.stock === 'number'
    );
  } catch {
    return [];
  }
}

function clamp(qty, stock) {
  return Math.max(0, Math.min(qty, stock));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadInitialItems);
  const [products, setProducts] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore write failures (e.g. storage disabled/full)
    }
  }, [items]);

  const add = useCallback((product, qty) => {
    if (!product || product.stock <= 0 || qty <= 0) return;

    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);

      if (existing) {
        const nextQty = clamp(existing.qty + qty, product.stock);
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, qty: nextQty, stock: product.stock, slug: product.slug }
            : item
        );
      }

      const nextQty = clamp(qty, product.stock);
      if (nextQty <= 0) return prev;

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          priceCents: product.priceCents,
          qty: nextQty,
          stock: product.stock,
          slug: product.slug,
        },
      ];
    });
  }, []);

  const setQty = useCallback((productId, qty) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, qty: clamp(qty, item.stock) } : item
      )
    );
  }, []);

  const remove = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  // Refreshes the saved lines from the live catalogue: drops products that are
  // no longer on sale and picks up the current name, price and stock.
  const sync = useCallback((products) => {
    setItems((prev) =>
      prev.flatMap((item) => {
        const product = products.find((p) => p.id === item.productId);
        const qty = product ? clamp(item.qty, product.stock) : 0;
        if (qty <= 0) return [];
        const { name, priceCents, stock, slug } = product;
        return [{ ...item, name, priceCents, stock, slug, qty }];
      })
    );
  }, []);

  // One fetch-and-sync path for the cart page and the drawer: the live
  // catalogue gives the line photos and refreshes the saved lines. On failure
  // the lines still render, with placeholder photos.
  const loadProducts = useCallback(
    () =>
      api
        .getProducts()
        .then((list) => {
          setProducts(list);
          sync(list);
        })
        .catch(() => setProducts([])),
    [sync]
  );

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const totalCents = useMemo(
    () => items.reduce((sum, item) => sum + item.priceCents * item.qty, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      add,
      setQty,
      remove,
      sync,
      clear,
      totalCents,
      products,
      loadProducts,
      drawerOpen,
      openDrawer,
      closeDrawer,
    }),
    [
      items,
      add,
      setQty,
      remove,
      sync,
      clear,
      totalCents,
      products,
      loadProducts,
      drawerOpen,
      openDrawer,
      closeDrawer,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
