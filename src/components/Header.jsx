import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '@/context/CartContext.jsx';
import BrandMark from './BrandMark.jsx';

import './styles/Header.css';

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
  const { pathname } = useLocation();
  const isLanding = pathname === '/';
  const scrolled = useScrolledPast(40, isLanding);

  const variant = isLanding ? `site-header--overlay${scrolled ? ' is-solid' : ''}` : '';
  const linkClass = (active, wide) =>
    `site-header__link${active ? ' is-active' : ''}${wide ? ' site-header__link--wide' : ''}`;

  return (
    <header className={`site-header ${variant}`}>
      <nav className="site-header__nav" aria-label="Main">
        <Link to="/" className={linkClass(isLanding, true)}>
          Home
        </Link>
        <a href="/#collection" className={linkClass(false)}>
          Collection
        </a>
        <a href="/#stories" className={linkClass(false, true)}>
          Stories
        </a>
      </nav>
      <Link to="/" className="site-header__brand">
        <BrandMark />
        Faceted &amp; Co.
      </Link>
      <nav className="site-header__nav" aria-label="Utility">
        <Link
          to="/cart"
          className={`${linkClass(pathname === '/cart')}${count > 0 ? ' has-items' : ''}`}
          aria-label={count > 0 ? `Cart, ${count} items` : 'Cart'}
        >
          Cart
          {count > 0 && <span className="cart-badge">{count}</span>}
        </Link>
      </nav>
    </header>
  );
}
