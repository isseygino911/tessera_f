import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import { formatPrice } from '@/lib/formatPrice.js';
import OrdersTable from './OrdersTable.jsx';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .adminGetSummary()
      .then(setSummary)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load summary.'));
  }, []);

  if (error) {
    return (
      <p className="form-banner" role="alert">
        {error}
      </p>
    );
  }

  if (!summary) {
    return <p>Loading…</p>;
  }

  const { newOrders, revenueThisMonthCents, lowStock, recentOrders } = summary;

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="stat-cards">
        <Link to="/admin/orders?status=new" className="stat-card">
          <span className="stat-card__label">New orders</span>
          <span className="stat-card__value">{newOrders}</span>
        </Link>
        <div className="stat-card">
          <span className="stat-card__label">Revenue this month</span>
          <span className="stat-card__value">{formatPrice(revenueThisMonthCents)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Low stock</span>
          <span className="stat-card__value">{lowStock.length}</span>
        </div>
      </div>

      <h2>Low stock</h2>
      {lowStock.length === 0 ? (
        <p className="empty-state">All products are well stocked</p>
      ) : (
        <ul>
          {lowStock.map((product) => (
            <li key={product.id}>
              <Link to={`/admin/products/${product.id}`}>{product.name}</Link> &mdash;{' '}
              {product.stock} left
            </li>
          ))}
        </ul>
      )}

      <div className="toolbar">
        <h2>Recent orders</h2>
        <Link to="/admin/orders" className="btn-link">
          View all orders
        </Link>
      </div>

      {recentOrders.length === 0 ? (
        <p className="empty-state">No orders yet.</p>
      ) : (
        <OrdersTable orders={recentOrders} />
      )}
    </div>
  );
}
