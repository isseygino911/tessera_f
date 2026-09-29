import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import { useAuth } from '@/context/AuthContext.jsx';
import AddressCard from '@/components/AddressCard.jsx';
import AddressForm from '@/components/AddressForm.jsx';
import { formatDate } from '@/lib/formatDate.js';
import { formatPrice } from '@/lib/formatPrice.js';
import { orderNumber } from '@/lib/orderNumber.js';
import './styles/shop.css';
import './styles/account.css';

const EMPTY_PASSWORDS = { currentPassword: '', newPassword: '' };
const MAX_ADDRESSES = 10;

export default function AccountPage() {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <div className="shop">
        <p>Loading…</p>
      </div>
    );
  }

  if (status === 'anon') {
    return <Navigate to="/login?returnTo=%2Faccount" replace />;
  }

  if (user.role === 'admin') {
    return (
      <div className="shop">
        <div className="shop-head">
          <p className="eyebrow">Your account</p>
          <h1>{user.name}</h1>
        </div>
        <p>
          Admin accounts don&apos;t place orders. Manage the shop in the{' '}
          <Link to="/admin">admin area</Link>.
        </p>
      </div>
    );
  }

  // Only mounts once `status === 'authed'`, so the forms' initializers
  // always see the real user.
  return <AccountDashboard user={user} />;
}

function AccountDashboard({ user }) {
  const { updateUser } = useAuth();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);
  const [name, setName] = useState(user.name);
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);

  useEffect(() => {
    let cancelled = false;
    api
      .getMyOrders()
      .then((data) => !cancelled && setOrders(data.orders))
      .catch(
        (err) =>
          !cancelled && setError(err instanceof ApiError ? err.message : 'Could not load orders.')
      );
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveProfile = async () => {
    const { user: saved } = await api.updateMe({ name: name.trim() });
    updateUser(saved);
  };

  const handleChangePassword = async () => {
    await api.changePassword(passwords);
    setPasswords(EMPTY_PASSWORDS);
  };

  return (
    <div className="shop account">
      <div className="shop-head">
        <p className="eyebrow">Your account</p>
        <h1>{user.name}</h1>
      </div>

      <section className="account__section" aria-labelledby="account-orders">
        <h2 id="account-orders" className="account__title">
          Orders
        </h2>
        {error ? (
          <p className="form-banner" role="alert">
            {error}
          </p>
        ) : !orders ? (
          <p>Loading…</p>
        ) : orders.length === 0 ? (
          <div className="shop-empty">
            <p>No orders yet</p>
            <Link to="/" className="btn-outline">
              Browse products
            </Link>
          </div>
        ) : (
          <ul className="account__orders">
            {orders.map((order) => (
              <li key={order.id}>
                <Link to={`/account/orders/${order.id}`} className="account__order">
                  <span className="account__order-id">{orderNumber(order.id)}</span>
                  <span className="account__order-date">{formatDate(order.createdAt)}</span>
                  <span>
                    {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                  </span>
                  <span className="account__order-total">{formatPrice(order.totalCents)}</span>
                  <span className={`status-pill status-pill--${order.status} account__status`}>
                    {order.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AddressesSection />

      <section className="account__section" aria-labelledby="account-profile">
        <h2 id="account-profile" className="account__title">
          Profile
        </h2>
        <div className="account__grid">
          <SaveForm label="Save profile" savedText="Profile saved." onSave={handleSaveProfile}>
            <Field id="name" label="Name" value={name} onChange={setName} />
            <Field id="email" label="Email" value={user.email} readOnly />
          </SaveForm>

          {user.hasPassword && (
            <SaveForm
              label="Change password"
              savedText="Password changed."
              onSave={handleChangePassword}
            >
              {[
                ['currentPassword', 'Current password', 'current-password'],
                ['newPassword', 'New password', 'new-password'],
              ].map(([key, label, autoComplete]) => (
                <Field
                  key={key}
                  id={key}
                  label={label}
                  type="password"
                  autoComplete={autoComplete}
                  value={passwords[key]}
                  onChange={(value) => setPasswords((prev) => ({ ...prev, [key]: value }))}
                />
              ))}
            </SaveForm>
          )}
        </div>
      </section>
    </div>
  );
}

// Saved addresses: cards with edit / make default / delete, and one inline
// form for adding or editing. `editing` is null, 'new' or an address id.
function AddressesSection() {
  const { addresses, setAddresses } = useAuth();
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const openForm = (target) => {
    setEditing(target);
    setFormError(null);
    setConfirmingId(null);
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    setFormError(null);
    try {
      const result =
        editing === 'new'
          ? await api.createAddress(values)
          : await api.updateAddress(editing, values);
      setAddresses(result.addresses);
      setEditing(null);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Runs one card action; `call` returns the updated address list.
  const runAction = async (id, call) => {
    setBusyId(id);
    setError(null);
    try {
      const result = await call();
      setAddresses(result.addresses);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusyId(null);
      setConfirmingId(null);
    }
  };

  // PUT replaces the whole address, so resend its fields with the new default.
  // Nulls become undefined (dropped), matching what the form sends.
  const handleMakeDefault = ({ id, label, addressLine2, ...fields }) =>
    runAction(id, () =>
      api.updateAddress(id, {
        ...fields,
        label: label ?? undefined,
        addressLine2: addressLine2 ?? undefined,
        isDefault: true,
      })
    );

  const handleDelete = (id) => {
    if (confirmingId !== id) {
      setConfirmingId(id);
      return;
    }
    runAction(id, () => api.deleteAddress(id));
  };

  const form = (address) => (
    <AddressForm
      key={address?.id ?? 'new'}
      address={address}
      saving={saving}
      error={formError}
      onSubmit={handleSubmit}
      onCancel={() => setEditing(null)}
    />
  );

  return (
    <section className="account__section" aria-labelledby="account-addresses">
      <h2 id="account-addresses" className="account__title">
        Addresses
      </h2>
      {error && (
        <p className="form-banner" role="alert">
          {error}
        </p>
      )}
      {addresses.length === 0 ? (
        editing !== 'new' && <p className="account__text">No saved addresses yet.</p>
      ) : (
        <ul className="account__addresses">
          {addresses.map((address) => (
            <li key={address.id}>
              {editing === address.id ? (
                form(address)
              ) : (
                <AddressCard address={address}>
                  <button
                    type="button"
                    className="btn-outline btn-outline--sm"
                    onClick={() => openForm(address.id)}
                  >
                    Edit
                  </button>
                  {!address.isDefault && (
                    <button
                      type="button"
                      className="btn-outline btn-outline--sm"
                      disabled={busyId === address.id}
                      onClick={() => handleMakeDefault(address)}
                    >
                      Make default
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-outline btn-outline--sm account__delete"
                    disabled={busyId === address.id}
                    onClick={() => handleDelete(address.id)}
                  >
                    {confirmingId === address.id ? 'Confirm delete' : 'Delete'}
                  </button>
                </AddressCard>
              )}
            </li>
          ))}
        </ul>
      )}
      {editing === 'new'
        ? form(null)
        : addresses.length < MAX_ADDRESSES && (
            <button type="button" className="btn-outline" onClick={() => openForm('new')}>
              Add address
            </button>
          )}
    </section>
  );
}

function Field({ id, label, full = false, onChange, ...input }) {
  return (
    <div className={`form-field${full ? ' form-field--full' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type="text"
        onChange={onChange && ((e) => onChange(e.target.value))}
        {...input}
      />
    </div>
  );
}

// One form with its own saving / saved / error state; `onSave` does the work
// and throws on failure.
function SaveForm({ label, savedText, onSave, children }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await onSave();
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="account__form" onSubmit={handleSubmit} onChange={() => setSaved(false)}>
      {error && (
        <p className="form-banner" role="alert">
          {error}
        </p>
      )}
      {children}
      <div className="account__form-foot">
        <button type="submit" className="btn-gold btn-gold--sm" disabled={saving}>
          {saving ? 'Saving…' : label}
        </button>
        {saved && (
          <p role="status" className="account__saved">
            {savedText}
          </p>
        )}
      </div>
    </form>
  );
}
