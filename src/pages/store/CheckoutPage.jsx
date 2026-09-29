import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import { useAuth } from '@/context/AuthContext.jsx';
import { useCart } from '@/context/CartContext.jsx';
import AddressCard from '@/components/AddressCard.jsx';
import { ADDRESS_FIELDS } from '@/data/addressFields.js';
import { validateCheckout } from '@/lib/checkoutValidation.js';
import { formatPrice } from '@/lib/formatPrice.js';
import './styles/shop.css';

const NEW_ADDRESS = 'new';

// The "New address" inputs; a chosen saved address overrides them on submit.
function emptyForm(user) {
  return {
    name: user.name,
    email: user.email,
    ...Object.fromEntries(ADDRESS_FIELDS.map(({ name }) => [name, ''])),
    note: '',
  };
}

function addressValues(address) {
  return {
    name: address.recipientName,
    ...Object.fromEntries(ADDRESS_FIELDS.map(({ name }) => [name, address[name] ?? ''])),
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
  const { addresses, reloadAddresses } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(() => emptyForm(user));
  const [shipTo, setShipTo] = useState(() =>
    String((addresses.find((a) => a.isDefault) ?? addresses[0])?.id ?? NEW_ADDRESS)
  );
  const [saveAddress, setSaveAddress] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Radio values are strings, whatever type the ids are.
  const selected = addresses.find((a) => String(a.id) === shipTo);
  const values = selected ? { ...form, ...addressValues(selected) } : form;
  const saveNew = !selected && saveAddress;

  const handleShipToChange = (e) => {
    setShipTo(e.target.value);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const nextErrors = validateCheckout(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const order = await api.createOrder({
        customer: {
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          addressLine1: values.addressLine1.trim(),
          addressLine2: values.addressLine2.trim() || undefined,
          city: values.city.trim(),
          region: values.region.trim(),
          postalCode: values.postalCode.trim(),
          country: values.country.trim(),
          note: values.note.trim() || undefined,
        },
        items: items.map((item) => ({ productId: item.productId, qty: item.qty })),
        saveAddress: saveNew,
      });

      clear();
      // The server added the new address to the customer's list.
      if (saveNew) reloadAddresses();
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
    <div key={name} className={`form-field${full ? ' form-field--full' : ''}`}>
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
        {addresses.length > 0 && (
          <div className="shop-shipto">
            <p id="ship-to-label" className="eyebrow">
              Ship to
            </p>
            <div role="radiogroup" aria-labelledby="ship-to-label" className="shop-shipto__options">
              {addresses.map((address) => (
                <label key={address.id} className="shop-shipto__option">
                  <input
                    type="radio"
                    name="shipTo"
                    value={address.id}
                    checked={selected === address}
                    onChange={handleShipToChange}
                  />
                  {[address.label, address.recipientName, address.addressLine1, address.city]
                    .filter(Boolean)
                    .join(' · ')}
                </label>
              ))}
              <label className="shop-shipto__option">
                <input
                  type="radio"
                  name="shipTo"
                  value={NEW_ADDRESS}
                  checked={!selected}
                  onChange={handleShipToChange}
                />
                New address
              </label>
            </div>
            {selected && <AddressCard address={selected} />}
          </div>
        )}

        <div className="form-grid">
          {!selected && field('name', 'Full name')}
          {field('email', 'Email', { type: 'email' })}
          {!selected &&
            ADDRESS_FIELDS.map(({ name, label, ...options }) => field(name, label, options))}
          {!selected && (
            <label className="form-field--full form-check">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
              />
              Save to my addresses
            </label>
          )}
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
