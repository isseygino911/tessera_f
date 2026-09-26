import { Link } from 'react-router-dom';
import { useCart } from '../../cart/CartContext.jsx';
import QtyStepper from '../../components/QtyStepper.jsx';
import { formatPrice } from '../../formatPrice.js';

export default function CartPage() {
  const { items, setQty, remove, totalCents } = useCart();

  if (items.length === 0) {
    return (
      <div className="container">
        <h1>Your cart</h1>
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link to="/" className="btn btn-secondary">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Your cart</h1>

      <ul className="cart-lines">
        {items.map((item) => (
          <li className="cart-line" key={item.productId}>
            <span className="cart-line__name">{item.name}</span>
            <span className="cart-line__price">{formatPrice(item.priceCents)}</span>
            <QtyStepper value={item.qty} max={item.stock} onChange={(qty) => setQty(item.productId, qty)} />
            <button type="button" className="btn-link" onClick={() => remove(item.productId)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="cart-summary">
        <span>Total</span>
        <span>{formatPrice(totalCents)}</span>
      </div>

      <div className="product__actions" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
        <Link to="/" className="btn btn-secondary">
          Keep browsing
        </Link>
        <Link to="/checkout" className="btn btn-primary">
          Checkout
        </Link>
      </div>
    </div>
  );
}
