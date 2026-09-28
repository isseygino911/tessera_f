import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';

import './styles/admin.css';

export default function AdminLayout() {
  const { status, user, logout } = useAuth();
  const navigate = useNavigate();

  if (status === 'loading') {
    return (
      <div className="shop">
        <p>Loading…</p>
      </div>
    );
  }

  if (status === 'anon') {
    return <Navigate to="/login?returnTo=%2Fadmin" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="shop">
        <p role="alert">You don&apos;t have access to the admin area.</p>
        <Link to="/" className="btn-outline">
          Back to the store
        </Link>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <p className="eyebrow">Studio admin</p>
        <Link to="/" className="site-header__wordmark" aria-label="Faceted & Co.">
          <span aria-hidden="true">FACETED.</span>
          <span className="site-header__dot" aria-hidden="true" />
        </Link>
        <nav className="admin-nav" aria-label="Admin">
          <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => (isActive ? 'active' : '')}>
            Products
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'active' : '')}>
            Orders
          </NavLink>
        </nav>
        <button type="button" className="admin-logout" onClick={handleLogout}>
          Log out
        </button>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
