import { Link } from 'react-router-dom';
import BrandMark from './BrandMark.jsx';

import './styles/SiteFooter.css';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__cols">
        <div>
          <h2 className="mono-label">Our Studio</h2>
          <p>
            Crystal bead bracelets, faceted by hand one bead at a time. Three colours, each with a
            story of its own.
          </p>
        </div>
        <nav aria-label="Footer">
          <h2 className="mono-label">Shop</h2>
          <ul>
            <li>
              <a href="/#collection">Collection</a>
            </li>
            <li>
              <a href="/#stories">Stories</a>
            </li>
            <li>
              <Link to="/cart">Your Cart</Link>
            </li>
          </ul>
        </nav>
        <div>
          <h2 className="mono-label">Ordering</h2>
          <p>
            Order requests only. We&apos;ll contact you ourselves to arrange payment and delivery.
          </p>
        </div>
      </div>
      <div className="site-footer__bar">
        <span className="site-footer__brand">
          <BrandMark />
          Faceted &amp; Co.
        </span>
        <p>© {new Date().getFullYear()} Faceted &amp; Co. All rights reserved.</p>
      </div>
    </footer>
  );
}
