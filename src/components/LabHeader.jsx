import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext.jsx';
import './styles/LabHeader.css';

const NAV_LINKS = [
  { label: 'Stones', href: '#stones' },
  { label: 'Craft', href: '#craft' },
  { label: 'Story', href: '#story' },
  { label: 'Order', href: '#order' },
];

// Fixed top bar for /lab. Starts visible; useLabHeroMotion (owned by
// lab-motion) toggles `lab-header--hidden` on the element carrying
// `data-lab-header` once the hero pin ends.
export default function LabHeader() {
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="lab-header" data-lab-header>
      <div className="lab-header__bar">
        <Link to="/lab" className="lab-header__wordmark" aria-label="Faceted & Co.">
          <span aria-hidden="true">FACETED.</span>
          <span className="lab-header__dot" aria-hidden="true" />
        </Link>

        <nav className="lab-header__nav" aria-label="Lab">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href} className="lab-header__link">
              {label}
            </a>
          ))}
        </nav>

        <div className="lab-header__actions">
          <a href="#order" className="lab-header__shop">
            Shop <span aria-hidden="true">→</span>
          </a>
          <Link to="/cart" className="lab-header__bag" aria-label={`Cart, ${count} items`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 8h12l-1 12H7L6 8Z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            {count > 0 && <span className="lab-header__badge">{count}</span>}
          </Link>
          <button
            type="button"
            className="lab-header__burger"
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
        <div className="lab-header__panel">
          <nav className="lab-header__panel-nav" aria-label="Lab">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="lab-header__link"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <a href="#order" className="lab-header__link" onClick={() => setMenuOpen(false)}>
              Shop →
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
