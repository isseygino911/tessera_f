import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext.jsx';
import CartLines from '@/components/CartLines.jsx';
import './styles/shop.css';

export default function CartPage() {
  const { items, products, loadProducts } = useCart();

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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
          <CartLines products={products} />

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
