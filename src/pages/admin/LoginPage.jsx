import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ApiError } from '@/lib/api.js';
import { useAdminAuth } from '@/context/AdminAuthContext.jsx';

import './styles/admin.css';

export default function LoginPage() {
  const { status, login } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authed') {
    return <Navigate to="/admin/products" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      <h1>Admin login</h1>
      {error && (
        <p className="form-banner" role="alert">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
          style={{ width: '100%' }}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
