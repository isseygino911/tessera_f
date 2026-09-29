import { Link } from 'react-router-dom';
import './styles/SiteFooter.css';

// Newsletter-style band becomes a CTA back to #order (we have no newsletter
// backend), then brand, Site and Ordering columns, then a bottom bar.
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__cta site-container">
        <p className="eyebrow">Ordering</p>
        <h2 className="site-footer__heading">
          Hand-faceted crystal bracelets, shipped straight from our studio.
        </h2>
        <a href="/#order" className="site-footer__cta-link">
          Shop the collection <span aria-hidden="true">→</span>
        </a>
      </div>

      <div className="site-footer__cols site-container">
        <div>
          <h3 className="eyebrow">Our Studio</h3>
          <p>
            Crystal bead bracelets, faceted by hand one bead at a time. Every colour with a story of
            its own.
          </p>
        </div>
        <nav aria-label="Footer">
          <h3 className="eyebrow">Shop</h3>
          <ul>
            <li>
              <a href="/#stones">Stones</a>
            </li>
            <li>
              <a href="/#craft">Craft</a>
            </li>
            <li>
              <a href="/#story">Story</a>
            </li>
            <li>
              <a href="/#order">Order</a>
            </li>
            <li>
              <Link to="/cart">Your Cart</Link>
            </li>
          </ul>
        </nav>
        <div>
          <h3 className="eyebrow">Ordering</h3>
          <p>Order online and we&apos;ll pack and ship your bracelet from the studio.</p>
        </div>
      </div>

      <div className="site-footer__bar site-container">
        <p>© {new Date().getFullYear()} Tessera. All rights reserved.</p>
      </div>
    </footer>
  );
}
