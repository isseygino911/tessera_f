import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
// On mobile the bar keeps only the wordmark, bag and hamburger; the rest lives
// in the menu panel, whose nav stays mounted (and `inert` while closed) so it can
// animate out as well as in.
export default function Header() {
  const { items, drawerOpen, openDrawer } = useCart();
  const { status, user, logout } = useAuth();
  const { pathname } = useLocation();
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const bagRef = useRef(null);
  const drawerWasOpen = useRef(false);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  // Return focus to the bag when the cart drawer closes.
  useEffect(() => {
    if (drawerWasOpen.current && !drawerOpen) bagRef.current.focus();
    drawerWasOpen.current = drawerOpen;
  }, [drawerOpen]);

  const handleBagClick = () => {
    setMenuOpen(false);
    openDrawer();
  };

  const handleMenuClose = () => setMenuOpen(false);

  const authLinks = (onNavigate) => {
    if (status === 'loading') return null;
    if (status === 'authed') {
      const firstName = user.name.split(' ')[0];
      return (
        <>
          {user.role === 'admin' ? (
            <>
              <span className="site-header__user">{firstName}</span>
              <Link to="/admin" className="site-header__admin" onClick={onNavigate}>
                Admin
              </Link>
            </>
          ) : (
            <Link to="/account" className="site-header__user" onClick={onNavigate}>
              {firstName}
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
        <Link to="/" className="site-header__wordmark" aria-label="Tessera">
          <span aria-hidden="true">TESSERA.</span>
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
          <div className="site-header__account">{authLinks()}</div>
          <button
            ref={bagRef}
            type="button"
            className="site-header__bag"
            aria-label={`Cart, ${count} items`}
            onClick={handleBagClick}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 8h12l-1 12H7L6 8Z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            {count > 0 && <span className="site-header__badge">{count}</span>}
          </button>
          <button
            type="button"
            className="site-header__burger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div
        id="site-menu"
        className={`site-header__panel${menuOpen ? ' site-header__panel--open' : ''}`}
      >
        <div className="site-header__panel-inner">
          <nav className="site-header__panel-nav" aria-label="Mobile" inert={!menuOpen}>
            {NAV_LINKS.map(({ label, href }) => (
              <a key={href} href={href} className="site-header__link" onClick={handleMenuClose}>
                {label}
              </a>
            ))}
            <a href="/#order" className="site-header__link" onClick={handleMenuClose}>
              Shop →
            </a>
            {authLinks(handleMenuClose)}
          </nav>
        </div>
      </div>
    </header>
  );
}
