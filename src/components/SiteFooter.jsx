import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <span className="site-footer__brand">Faceted &amp; Co.</span>
      <nav aria-label="Footer">
        <a href="/#collection">Collection</a>
        <Link to="/cart">Cart</Link>
      </nav>
      <p>Order requests only — we&apos;ll contact you to arrange payment.</p>
    </footer>
  );
}
