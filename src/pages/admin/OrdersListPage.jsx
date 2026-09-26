import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../../api.js';
import { formatPrice } from '../../formatPrice.js';

const STATUSES = ['new', 'contacted', 'paid', 'shipped', 'cancelled'];

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString();
}

export default function OrdersListPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setOrders(null);
    api
      .adminGetOrders(statusFilter || undefined)
      .then(setOrders)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load orders.'));
  }, [statusFilter]);

  return (
    <div>
      <div className="toolbar">
        <h1>Orders</h1>
        <div className="form-field" style={{ marginBottom: 0, minWidth: '10rem' }}>
          <label htmlFor="status-filter">Status</label>
          <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
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

      {!orders && !error && <p>Loading…</p>}

      {orders && orders.length === 0 && <p className="empty-state">No orders yet.</p>}

      {orders && orders.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Placed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.customerName}</td>
                <td>{formatPrice(order.totalCents)}</td>
                <td>
                  <span className={`status-pill status-pill--${order.status}`}>{order.status}</span>
                </td>
                <td>{formatDate(order.createdAt)}</td>
                <td>
                  <Link to={`/admin/orders/${order.id}`} className="btn-link">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
