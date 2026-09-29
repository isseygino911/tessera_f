import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '@/context/CartContext.jsx';
import CartLines from '@/components/CartLines.jsx';
import './styles/CartDrawer.css';

// Slide-out cart, opened by the header bag. Always mounted so it can animate
// out as well as in; while closed the panel is `inert` and the backdrop
// ignores pointer events. Header moves focus back to the bag when it closes.
export default function CartDrawer() {
  const { items, products, loadProducts, drawerOpen, closeDrawer } = useCart();
  const { pathname } = useLocation();
  const closeRef = useRef(null);
  const count = items.reduce((sum, item) => sum + item.qty, 0);

  // Browser back/forward changes the route without a click inside the drawer.
  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  useEffect(() => {
    if (!drawerOpen) return undefined;

    loadProducts();
    // preventScroll: the panel is still off-screen when this runs.
    closeRef.current.focus({ preventScroll: true });

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen, loadProducts, closeDrawer]);

  // Any link inside the drawer closes it, including ones that don't change
  // the route (View cart on /cart, Browse stones on /).
  const handlePanelClick = (e) => {
    if (e.target.closest('a')) closeDrawer();
  };

  return (
    <div className={`cart-drawer${drawerOpen ? ' cart-drawer--open' : ''}`}>
      <div className="cart-drawer__backdrop" onClick={closeDrawer} />
      <div
        className="cart-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        inert={!drawerOpen}
        onClick={handlePanelClick}
      >
        <div className="cart-drawer__head">
          <h2 id="cart-drawer-title" className="cart-drawer__title">
            Your cart
          </h2>
          <span className="cart-drawer__count">({count})</span>
          <button
            ref={closeRef}
            type="button"
            className="cart-drawer__close"
            aria-label="Close cart"
            onClick={closeDrawer}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <p>Your cart is empty.</p>
            <a href="/#stones" className="btn-outline">
              Browse stones
            </a>
          </div>
        ) : (
          <>
            <div className="cart-drawer__body">
              <CartLines products={products} />
            </div>
            <div className="cart-drawer__actions">
              <Link to="/checkout" className="btn-gold">
                Checkout
              </Link>
              <Link to="/cart" className="btn-outline">
                View cart
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
