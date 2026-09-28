import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { useCart } from '@/context/CartContext.jsx';
import './styles/Header.css';

const NAV_LINKS = [
  { label: 'Stones', href: '/#stones' },
  { label: 'Craft', href: '/#craft' },
  { label: 'Story', href: '/#story' },
  { label: 'Order', href: '/#order' },
];

// Fixed top bar, shared by every page via StoreLayout. Starts visible;
// useLandingHeroMotion toggles `site-header--hidden` on the element carrying
// `data-site-header` while the homepage hero is pinned, and always removes it
// again on unmount so navigating away never leaves the header hidden.
export default function Header() {
  const { items } = useCart();
  const { status, user, logout } = useAuth();
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const [menuOpen, setMenuOpen] = useState(false);

  const authLinks = (onNavigate) => {
    if (status === 'loading') return null;
    if (status === 'authed') {
      return (
        <>
          <span className="site-header__user">{user.name.split(' ')[0]}</span>
          {user.role === 'admin' && (
            <Link to="/admin" className="site-header__admin" onClick={onNavigate}>
              Admin
            </Link>
          )}
          <button
            type="button"
            className="site-header__signout"
            onClick={() => {
              onNavigate?.();
              logout();
            }}
          >
            Sign out
          </button>
        </>
      );
    }
    return (
      <Link to="/login" className="site-header__link" onClick={onNavigate}>
        Sign in
      </Link>
    );
  };

  return (
    <header className="site-header" data-site-header>
      <div className="site-header__bar">
        <Link to="/" className="site-header__wordmark" aria-label="Faceted & Co.">
          <span aria-hidden="true">FACETED.</span>
          <span className="site-header__dot" aria-hidden="true" />
        </Link>

        <nav className="site-header__nav" aria-label="Main">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href} className="site-header__link">
              {label}
            </a>
          ))}
        </nav>

        <div className="site-header__actions">
          <a href="/#order" className="site-header__shop">
            Shop <span aria-hidden="true">→</span>
          </a>
          {authLinks()}
          <Link to="/cart" className="site-header__bag" aria-label={`Cart, ${count} items`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 8h12l-1 12H7L6 8Z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            {count > 0 && <span className="site-header__badge">{count}</span>}
          </Link>
          <button
            type="button"
            className="site-header__burger"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="site-header__panel">
          <nav className="site-header__panel-nav" aria-label="Mobile">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="site-header__link"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <a href="/#order" className="site-header__link" onClick={() => setMenuOpen(false)}>
              Shop →
            </a>
            {authLinks(() => setMenuOpen(false))}
          </nav>
        </div>
      )}
    </header>
  );
}
