import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api.js';
import { useCart } from '@/context/CartContext.jsx';
import ProductPhoto from '@/components/ProductPhoto.jsx';
import QtyStepper from '@/components/QtyStepper.jsx';
import { formatPrice } from '@/lib/formatPrice.js';
import './styles/shop.css';

export default function CartPage() {
  const { items, setQty, remove, sync, totalCents } = useCart();
  const [products, setProducts] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getProducts()
      .then((list) => {
        if (cancelled) return;
        setProducts(list);
        sync(list);
      })
      .catch(() => !cancelled && setProducts([]));
    return () => {
      cancelled = true;
    };
  }, [sync]);

  return (
    <div className="shop">
      <div className="shop-head">
        <p className="eyebrow">Your selection</p>
        <h1>Your cart</h1>
      </div>

      {items.length === 0 ? (
        <div className="shop-empty">
          <p>Your cart is empty.</p>
          <Link to="/" className="btn-outline">
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <ul className="shop-lines">
            {items.map((item) => (
              <li className="shop-line" key={item.productId}>
                <ProductPhoto
                  product={products?.find((product) => product.id === item.productId)}
                  name={item.name}
                  className="blend shop-line__thumb"
                />
                <div className="shop-line__info">
                  <span className="shop-line__name">{item.name}</span>
                  <span className="shop-line__price">{formatPrice(item.priceCents)}</span>
                </div>
                <QtyStepper
                  value={item.qty}
                  max={item.stock}
                  onChange={(qty) => setQty(item.productId, qty)}
                />
                <span className="shop-line__total">{formatPrice(item.priceCents * item.qty)}</span>
                <button
                  type="button"
                  className="shop-line__remove"
                  onClick={() => remove(item.productId)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="shop-total">
            <span className="shop-total__label">Total</span>
            <span className="shop-total__value">{formatPrice(totalCents)}</span>
          </div>

          <div className="shop-actions">
            <Link to="/" className="btn-outline">
              Keep browsing
            </Link>
            <Link to="/checkout" className="btn-gold">
              Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
