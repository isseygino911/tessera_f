import { Link, useParams } from 'react-router-dom';
import { orderNumber } from '@/lib/orderNumber.js';
import './styles/shop.css';

export default function ThanksPage() {
  const { id } = useParams();

  return (
    <div className="shop">
      <div className="shop-thanks">
        <p className="eyebrow">Order {orderNumber(id)}</p>
        <h1>Thank you</h1>
        <p>
          Your order <strong>{orderNumber(id)}</strong> has been received. We&apos;ll email you to
          confirm it and again when it ships.
        </p>
        <p>
          <Link to={`/account/orders/${id}`}>View your orders</Link>
        </p>
        <Link to="/" className="btn-outline">
          Continue browsing
        </Link>
      </div>
    </div>
  );
}
