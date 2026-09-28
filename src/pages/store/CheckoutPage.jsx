import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import { useAuth } from '@/context/AuthContext.jsx';
import { useCart } from '@/context/CartContext.jsx';
import { validateCheckout } from '@/lib/checkoutValidation.js';
import { formatPrice } from '@/lib/formatPrice.js';
import './styles/shop.css';

function emptyForm(user) {
  return {
    name: user.name,
    email: user.email,
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    note: '',
  };
}

export default function CheckoutPage() {
  const { items } = useCart();
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <div className="shop">
        <p>Loading…</p>
      </div>
    );
  }

  if (status === 'anon') {
    return <Navigate to="/login?returnTo=%2Fcheckout" replace />;
  }

  if (user.role === 'admin') {
    return (
      <div className="shop">
        <div className="shop-head">
          <p className="eyebrow">Your order</p>
          <h1>Checkout</h1>
        </div>
        <p>Admin accounts can&apos;t place orders.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="shop">
        <div className="shop-head">
          <p className="eyebrow">Your order</p>
          <h1>Checkout</h1>
        </div>
        <div className="shop-empty">
          <p>Your cart is empty.</p>
          <Link to="/" className="btn-outline">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  // Only mounts once `status === 'authed'`, so its form state's initializer
  // always sees the real user — no effect needed to copy name/email in later.
  return <CheckoutForm user={user} />;
}

function CheckoutForm({ user }) {
  const { items, totalCents, clear } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState(() => emptyForm(user));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const nextErrors = validateCheckout(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const order = await api.createOrder({
        customer: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim() || undefined,
          city: form.city.trim(),
          region: form.region.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country.trim(),
          note: form.note.trim() || undefined,
        },
        items: items.map((item) => ({ productId: item.productId, qty: item.qty })),
      });

      clear();
      navigate(`/thanks/${order.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setSubmitError('Your session has expired. Please sign in again.');
      } else {
        // 409 (product oversold) and other API errors already carry a useful
        // message (e.g. naming the product); anything else gets a generic one.
        setSubmitError(
          err instanceof ApiError
            ? err.message
            : 'Something went wrong submitting your order. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, label, { type = 'text', full = false, required = true } = {}) => (
    <div className={`form-field${full ? ' form-field--full' : ''}`}>
      <label htmlFor={name}>
        {label}
        {!required && ' (optional)'}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={form[name]}
        onChange={handleChange(name)}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
      />
      {errors[name] && (
        <span className="form-error" id={`${name}-error`}>
          {errors[name]}
        </span>
      )}
    </div>
  );

  return (
    <div className="shop">
      <div className="shop-head">
        <p className="eyebrow">Your order</p>
        <h1>Checkout</h1>
        <p>We&apos;ll email you to confirm your order and when it ships.</p>
      </div>

      {submitError && (
        <p className="form-banner" role="alert">
          {submitError}
        </p>
      )}

      <form className="shop-checkout" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          {field('name', 'Full name')}
          {field('email', 'Email', { type: 'email' })}
          {field('phone', 'Phone')}
          {field('addressLine1', 'Address line 1', { full: true })}
          {field('addressLine2', 'Address line 2', { full: true, required: false })}
          {field('city', 'City')}
          {field('region', 'State / region')}
          {field('postalCode', 'Postal code')}
          {field('country', 'Country')}
          <div className="form-field form-field--full">
            <label htmlFor="note">Note (optional)</label>
            <textarea
              id="note"
              name="note"
              rows={3}
              value={form.note}
              onChange={handleChange('note')}
            />
          </div>
        </div>

        <div className="shop-total">
          <span className="shop-total__label">Total</span>
          <span className="shop-total__value">{formatPrice(totalCents)}</span>
        </div>

        <div className="shop-actions">
          <Link to="/cart" className="btn-outline">
            Back to cart
          </Link>
          <button type="submit" className="btn-gold" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Place order'}
          </button>
        </div>
      </form>
    </div>
  );
}
