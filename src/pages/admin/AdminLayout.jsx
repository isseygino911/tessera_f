import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';

import './styles/admin.css';

export default function AdminLayout() {
  const { status, user, logout } = useAuth();
  const navigate = useNavigate();

  if (status === 'loading') {
    return (
      <div className="container">
        <p>Loading…</p>
      </div>
    );
  }

  if (status === 'anon') {
    return <Navigate to="/login?returnTo=%2Fadmin" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="container">
        <p role="alert">You don&apos;t have access to the admin area.</p>
        <Link to="/">Back to the store</Link>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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
          onClick={handleLogout}
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
