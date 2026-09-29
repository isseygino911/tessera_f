import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import { useAuth } from '@/context/AuthContext.jsx';
import { formatDate } from '@/lib/formatDate.js';
import { formatPrice } from '@/lib/formatPrice.js';
import { orderNumber } from '@/lib/orderNumber.js';
import './styles/shop.css';
import './styles/account.css';

const STEPS = [
  { status: 'new', label: 'New' },
  { status: 'contacted', label: 'Contacted' },
  { status: 'paid', label: 'Paid' },
  { status: 'shipped', label: 'Shipped' },
];

export default function AccountOrderPage() {
  const { id } = useParams();
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <div className="shop">
        <p>Loading…</p>
      </div>
    );
  }

  if (status === 'anon') {
    return (
      <Navigate to={`/login?returnTo=${encodeURIComponent(`/account/orders/${id}`)}`} replace />
    );
  }

  if (user.role === 'admin') {
    return (
      <div className="shop">
        <p>
          Admin accounts view orders in the <Link to={`/admin/orders/${id}`}>admin area</Link>.
        </p>
      </div>
    );
  }

  return <OrderDetail id={id} />;
}

function OrderDetail({ id }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getMyOrder(id)
      .then((data) => !cancelled && setOrder(data))
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setError('Order not found.');
        else setError(err instanceof ApiError ? err.message : 'Could not load this order.');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const backLink = (
    <p>
      <Link to="/account" className="account__back">
        &larr; Your account
      </Link>
    </p>
  );

  if (error) {
    return (
      <div className="shop account">
        {backLink}
        <p className="form-banner" role="alert">
          {error}
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="shop account">
        {backLink}
        <p>Loading…</p>
      </div>
    );
  }

  const reached = STEPS.findIndex((step) => step.status === order.status);

  return (
    <div className="shop account">
      {backLink}

      <div className="shop-head">
        <p className="eyebrow">Order placed {formatDate(order.createdAt)}</p>
        <h1>{orderNumber(order.id)}</h1>
      </div>

      <section className="account__section" aria-labelledby="order-status">
        <h2 id="order-status" className="account__title">
          Status
        </h2>
        {order.status === 'cancelled' ? (
          <p className="account__cancelled">Cancelled</p>
        ) : (
          <ol className="account__steps">
            {STEPS.map((step, i) => (
              <li
                key={step.status}
                className={`account__step${i <= reached ? ' account__step--reached' : ''}`}
                aria-current={i === reached ? 'step' : undefined}
              >
                {step.label}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="account__section" aria-labelledby="order-items">
        <h2 id="order-items" className="account__title">
          Items
        </h2>
        <ul className="account__items">
          {order.items.map((item) => (
            <li key={item.productId} className="account__item">
              {item.imageUrl ? (
                <img className="account__item-photo blend" src={item.imageUrl} alt="" />
              ) : (
                <span className="account__item-photo" />
              )}
              <span className="account__item-name">{item.productName}</span>
              <span className="account__item-qty">
                {item.quantity} × {formatPrice(item.unitPriceCents)}
              </span>
              <span className="account__item-total">
                {formatPrice(item.unitPriceCents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="shop-total">
          <span className="shop-total__label">Total</span>
          <span className="shop-total__value">{formatPrice(order.totalCents)}</span>
        </div>
      </section>

      <div className="account__grid">
        <section className="account__section" aria-labelledby="order-address">
          <h2 id="order-address" className="account__title">
            Shipping address
          </h2>
          <p className="account__text">
            {order.customerName}
            <br />
            {order.addressLine1}
            {order.addressLine2 && (
              <>
                <br />
                {order.addressLine2}
              </>
            )}
            <br />
            {order.city}, {order.region} {order.postalCode}
            <br />
            {order.country}
            <br />
            {order.phone}
          </p>
        </section>

        {order.note && (
          <section className="account__section" aria-labelledby="order-note">
            <h2 id="order-note" className="account__title">
              Your note
            </h2>
            <p className="account__text">{order.note}</p>
          </section>
        )}
      </div>
    </div>
  );
}
