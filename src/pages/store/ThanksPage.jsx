import { Link, useParams } from 'react-router-dom';
import './styles/shop.css';

export default function ThanksPage() {
  const { id } = useParams();

  return (
    <div className="shop">
      <div className="shop-thanks">
        <p className="eyebrow">Order request #{id}</p>
        <h1>Thank you</h1>
        <p>
          Your order request <strong>#{id}</strong> has been received. We&apos;ll contact you
          shortly to arrange payment.
        </p>
        <Link to="/" className="btn-outline">
          Continue browsing
        </Link>
      </div>
    </div>
  );
}
