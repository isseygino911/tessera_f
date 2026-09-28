import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { ApiError } from '@/lib/api.js';
import { useAuth } from '@/context/AuthContext.jsx';
import GoogleSignInLink from '@/components/GoogleSignInLink.jsx';
import './styles/auth.css';

function safeReturnTo(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

export default function LoginPage() {
  const { status, user, login } = useAuth();
  const [searchParams] = useSearchParams();
  // Admins land on the admin area unless they were sent here from somewhere.
  const returnTo = searchParams.get('returnTo')
    ? safeReturnTo(searchParams.get('returnTo'))
    : user?.role === 'admin'
      ? '/admin'
      : '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    searchParams.get('error') === 'google' ? "Google sign-in didn't work. Please try again." : null
  );
  const [submitting, setSubmitting] = useState(false);

  if (status === 'loading') {
    return (
      <div className="auth">
        <p>Loading…</p>
      </div>
    );
  }

  if (status === 'authed') {
    return <Navigate to={returnTo} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // Once logged in, the `authed` branch above redirects to returnTo.
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const signupHref = `/signup${returnTo !== '/' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;

  return (
    <div className="auth">
      <div className="auth-head">
        <p className="eyebrow">Your account</p>
        <h1>Sign in</h1>
      </div>

      {error && (
        <p className="form-banner" role="alert">
          {error}
        </p>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-gold auth-submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="auth-divider">or</div>

      <GoogleSignInLink returnTo={returnTo} />

      <p className="auth-switch">
        New here? <Link to={signupHref}>Create an account</Link>
      </p>
    </div>
  );
}
