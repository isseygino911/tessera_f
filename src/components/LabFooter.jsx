import { Link } from 'react-router-dom';
import './styles/LabFooter.css';

// Dark rebuild of drinkstill.nz's footer (d-10.jpeg): a newsletter-style band
// becomes a CTA back to #order (we have no newsletter backend), then brand,
// Site and Ordering columns, then a bottom bar.
export default function LabFooter() {
  return (
    <footer className="lab-footer">
      <div className="lab-footer__cta lab-container">
        <p className="lab-eyebrow">Ordering</p>
        <h2 className="lab-footer__heading">
          Order requests only. We&apos;ll contact you ourselves to arrange payment and delivery.
        </h2>
        <a href="#order" className="lab-footer__cta-link">
          Shop the collection <span aria-hidden="true">→</span>
        </a>
      </div>

      <div className="lab-footer__cols lab-container">
        <div>
          <h3 className="lab-eyebrow">Our Studio</h3>
          <p>
            Crystal bead bracelets, faceted by hand one bead at a time. Three colours, each with a
            story of its own.
          </p>
        </div>
        <nav aria-label="Footer">
          <h3 className="lab-eyebrow">Shop</h3>
          <ul>
            <li>
              <a href="#stones">Stones</a>
            </li>
            <li>
              <a href="#craft">Craft</a>
            </li>
            <li>
              <a href="#story">Story</a>
            </li>
            <li>
              <a href="#order">Order</a>
            </li>
            <li>
              <Link to="/cart">Your Cart</Link>
            </li>
          </ul>
        </nav>
        <div>
          <h3 className="lab-eyebrow">Ordering</h3>
          <p>
            Order requests only. We&apos;ll contact you ourselves to arrange payment and delivery.
          </p>
        </div>
      </div>

      <div className="lab-footer__bar lab-container">
        <p>© {new Date().getFullYear()} Faceted &amp; Co. All rights reserved.</p>
      </div>
    </footer>
  );
}
