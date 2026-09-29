import { useCart } from '@/context/CartContext.jsx';
import ProductPhoto from '@/components/ProductPhoto.jsx';
import QtyStepper from '@/components/QtyStepper.jsx';
import { formatPrice } from '@/lib/formatPrice.js';
import './styles/CartLines.css';

// The cart's lines and total, shared by CartPage and CartDrawer. `products` is
// the live catalogue (or null while it loads) and only supplies the photos.
export default function CartLines({ products }) {
  const { items, setQty, remove, totalCents } = useCart();

  return (
    <div className="cart-lines">
      <ul className="cart-lines__list">
        {items.map((item) => (
          <li className="cart-lines__line" key={item.productId}>
            <ProductPhoto
              product={products?.find((product) => product.id === item.productId)}
              name={item.name}
              className="blend cart-lines__thumb"
            />
            <div className="cart-lines__info">
              <span className="cart-lines__name">{item.name}</span>
              <span className="cart-lines__price">{formatPrice(item.priceCents)}</span>
            </div>
            <QtyStepper
              value={item.qty}
              max={item.stock}
              onChange={(qty) => setQty(item.productId, qty)}
            />
            <span className="cart-lines__total">{formatPrice(item.priceCents * item.qty)}</span>
            <button
              type="button"
              className="cart-lines__remove"
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
    </div>
  );
}
