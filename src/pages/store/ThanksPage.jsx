import { Link, useParams } from 'react-router-dom';

export default function ThanksPage() {
  const { id } = useParams();

  return (
    <div className="container">
      <div className="hero">
        <h1>Thank you</h1>
        <p>
          Your order request <strong>#{id}</strong> has been received. We&apos;ll contact you shortly to arrange
          payment.
        </p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--space-5)' }}>
          Continue browsing
        </Link>
      </div>
    </div>
  );
}
