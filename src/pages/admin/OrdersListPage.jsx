import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import OrdersTable from './OrdersTable.jsx';

const STATUSES = ['new', 'contacted', 'paid', 'shipped', 'cancelled'];
const PAGE_SIZE = 20;

export default function OrdersListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || '';
  const q = searchParams.get('q') || '';
  const page = Number(searchParams.get('page')) || 1;

  const [searchInput, setSearchInput] = useState(q);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [prevKey, setPrevKey] = useState(`${status}|${q}|${page}`);

  const key = `${status}|${q}|${page}`;
  if (key !== prevKey) {
    setPrevKey(key);
    setResult(null);
    setSearchInput(q);
    setError(null);
  }

  useEffect(() => {
    api
      .adminGetOrders({ status: status || undefined, q: q || undefined, page })
      .then(setResult)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load orders.'));
  }, [status, q, page]);

  const updateParams = (next) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ q: searchInput, page: null });
  };

  const handleStatusChange = (e) => {
    updateParams({ status: e.target.value, page: null });
  };

  const orders = result?.orders ?? null;
  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="toolbar">
        <h1>Orders</h1>
        <form onSubmit={handleSearchSubmit} className="form-field" style={{ marginBottom: 0 }}>
          <label htmlFor="order-search">Search orders</label>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input
              id="order-search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary">
              Search
            </button>
          </div>
        </form>
        <div className="form-field" style={{ marginBottom: 0, minWidth: '10rem' }}>
          <label htmlFor="status-filter">Status</label>
          <select id="status-filter" value={status} onChange={handleStatusChange}>
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
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

      {orders && orders.length === 0 && (
        <p className="empty-state">{q || status ? 'No orders match.' : 'No orders yet.'}</p>
      )}

      {orders && orders.length > 0 && <OrdersTable orders={orders} />}

      {orders && orders.length > 0 && totalPages > 1 && (
        <div className="pager">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => updateParams({ page: String(page - 1) })}
            disabled={page <= 1}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => updateParams({ page: String(page + 1) })}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
