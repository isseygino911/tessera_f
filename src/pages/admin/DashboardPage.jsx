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
      <div className="admin-head">
        <p className="eyebrow">Overview</p>
        <h1>Dashboard</h1>
      </div>

      <div className="stat-cards">
        <Link to="/admin/orders?status=new" className="stat-card stat-card--link">
          <span className="stat-card__label eyebrow">New orders</span>
          <span className="stat-card__value">{newOrders}</span>
        </Link>
        <div className="stat-card">
          <span className="stat-card__label eyebrow">Revenue this month</span>
          <span className="stat-card__value">{formatPrice(revenueThisMonthCents)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label eyebrow">Low stock</span>
          <span className="stat-card__value">{lowStock.length}</span>
        </div>
      </div>

      <h2>Low stock</h2>
      {lowStock.length === 0 ? (
        <p className="shop-empty">All products are well stocked</p>
      ) : (
        <ul className="admin-list">
          {lowStock.map((product) => (
            <li key={product.id}>
              <Link to={`/admin/products/${product.id}`}>{product.name}</Link>
              <span>{product.stock} left</span>
            </li>
          ))}
        </ul>
      )}

      <div className="admin-head">
        <h2>Recent orders</h2>
        <Link to="/admin/orders" className="admin-link">
          View all orders
        </Link>
      </div>

      {recentOrders.length === 0 ? (
        <p className="shop-empty">No orders yet.</p>
      ) : (
        <OrdersTable orders={recentOrders} />
      )}
    </div>
  );
}
