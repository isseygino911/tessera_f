import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import { formatDate } from '@/lib/formatDate.js';
import { formatPrice } from '@/lib/formatPrice.js';
import { orderNumber } from '@/lib/orderNumber.js';

const STATUSES = ['new', 'contacted', 'paid', 'shipped', 'cancelled'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  const load = () => {
    api
      .adminGetOrder(id)
      .then((loaded) => {
        setOrder(loaded);
        setNote(loaded.adminNote ?? '');
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load order.'));
  };

  useEffect(load, [id]);

  const handleStatusChange = async (e) => {
    const status = e.target.value;
    setUpdating(true);
    setError(null);
    try {
      await api.adminUpdateOrder(id, { status });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    setSavingNote(true);
    setNoteSaved(false);
    setError(null);
    try {
      await api.adminUpdateOrder(id, { adminNote: note });
      setNoteSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save note.');
    } finally {
      setSavingNote(false);
    }
  };

  if (error && !order) {
    return (
      <p className="form-banner" role="alert">
        {error}
      </p>
    );
  }

  if (!order) {
    return <p>Loading…</p>;
  }

  const { customerName, email, phone, totalCents: total } = order;
  const items = order.items ?? [];

  return (
    <div>
      <p>
        <Link to="/admin/orders" className="admin-link">
          &larr; Back to orders
        </Link>
      </p>

      <div className="admin-head">
        <p className="eyebrow">Order</p>
        <h1>Order {orderNumber(order.id)}</h1>
        <div className="form-field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={order.status}
            onChange={handleStatusChange}
            disabled={updating}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="form-banner" role="alert">
          {error}
        </p>
      )}

      <p>Placed {formatDate(order.createdAt)}</p>

      <div className="admin-grid">
        <div>
          <h2>Customer</h2>
          <p>
            {customerName}
            <br />
            {email}
            {phone && (
              <>
                <br />
                {phone}
              </>
            )}
          </p>
        </div>

        <div>
          <h2>Shipping address</h2>
          <p>
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
          </p>
        </div>

        {order.note && (
          <div>
            <h2>Note</h2>
            <p>{order.note}</p>
          </div>
        )}

        <div>
          <h2>Internal note</h2>
          <form onSubmit={handleNoteSubmit} className="form-field">
            <label htmlFor="admin-note">Internal note</label>
            <textarea
              id="admin-note"
              rows={4}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setNoteSaved(false);
              }}
            />
            <button type="submit" className="btn-outline" disabled={savingNote}>
              {savingNote ? 'Saving…' : 'Save note'}
            </button>
            {noteSaved && (
              <p role="status" className="form-hint">
                Note saved.
              </p>
            )}
          </form>
        </div>
      </div>

      <h2>Items</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th className="num">Unit price</th>
            <th className="num">Qty</th>
            <th className="num">Line total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.productId}>
              <td>
                <span className="order-item">
                  {item.imageUrl && <img className="table-thumb" src={item.imageUrl} alt="" />}
                  {item.productName}
                </span>
              </td>
              <td className="num">{formatPrice(item.unitPriceCents)}</td>
              <td className="num">{item.quantity}</td>
              <td className="num">{formatPrice(item.unitPriceCents * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="shop-total">
        <span className="shop-total__label">Total</span>
        <span className="shop-total__value">{formatPrice(total)}</span>
      </div>
    </div>
  );
}
