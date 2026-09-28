import { Link, useParams } from 'react-router-dom';
import './styles/shop.css';

export default function ThanksPage() {
  const { id } = useParams();

  return (
    <div className="shop">
      <div className="shop-thanks">
        <p className="eyebrow">Order #{id}</p>
        <h1>Thank you</h1>
        <p>
          Your order <strong>#{id}</strong> has been received. We&apos;ll email you to confirm it
          and again when it ships.
        </p>
        <Link to="/" className="btn-outline">
          Continue browsing
        </Link>
      </div>
    </div>
  );
}
