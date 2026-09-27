import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext.jsx';

import './admin.css';

export default function AdminLayout() {
  const { status, logout } = useAdminAuth();

  if (status === 'loading') {
    return (
      <div className="container">
        <p>Loading…</p>
      </div>
    );
  }

  if (status === 'anon') {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-shell">
      <nav className="admin-nav" aria-label="Admin">
        <NavLink to="/admin/products" className={({ isActive }) => (isActive ? 'active' : '')}>
          Products
        </NavLink>
        <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'active' : '')}>
          Orders
        </NavLink>
        <button
          type="button"
          className="btn-link"
          style={{ marginTop: 'var(--space-5)' }}
          onClick={logout}
        >
          Log out
        </button>
      </nav>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
