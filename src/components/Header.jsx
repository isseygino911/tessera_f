import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../cart/CartContext.jsx';

// On the landing page the header floats over the hero and turns solid once
// the visitor scrolls; everywhere else it stays solid.
function useScrolledPast(offset, enabled) {
  const [past, setPast] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;
    const update = () => setPast(window.scrollY > offset);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [offset, enabled]);

  return past;
}

export default function Header() {
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const isLanding = useLocation().pathname === '/';
  const scrolled = useScrolledPast(40, isLanding);

  const variant = isLanding ? `site-header--overlay${scrolled ? ' is-solid' : ''}` : '';

  return (
    <header className={`site-header ${variant}`}>
      <Link to="/" className="site-header__brand">
        Faceted &amp; Co.
      </Link>
      <nav className="site-header__nav" aria-label="Main">
        <a href="/#collection" className="site-header__link">
          Collection
        </a>
        <Link to="/cart" className="site-header__cart-link">
          Cart
          {count > 0 && <span className="cart-badge">{count}</span>}
        </Link>
      </nav>
    </header>
  );
}
