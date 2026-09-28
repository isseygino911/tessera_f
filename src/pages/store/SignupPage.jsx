import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ApiError } from '@/lib/api.js';
import { useAuth } from '@/context/AuthContext.jsx';
import GoogleSignInLink from '@/components/GoogleSignInLink.jsx';
import './styles/auth.css';

function safeReturnTo(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

function validateSignup(form) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = 'Name is required.';
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  }

  if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  return errors;
}

export default function SignupPage() {
  const { status, signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = safeReturnTo(searchParams.get('returnTo'));

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(
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

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const nextErrors = validateSignup(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await signup({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigate(returnTo, { replace: true });
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const loginHref = `/login${returnTo !== '/' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;

  return (
    <div className="auth">
      <div className="auth-head">
        <p className="eyebrow">Your account</p>
        <h1>Create an account</h1>
      </div>

      {submitError && (
        <p className="form-banner" role="alert">
          {submitError}
        </p>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            autoComplete="name"
            value={form.name}
            onChange={handleChange('name')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <span className="form-error" id="name-error">
              {errors.name}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <span className="form-error" id="email-error">
              {errors.email}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange('password')}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : 'password-hint'}
          />
          {errors.password ? (
            <span className="form-error" id="password-error">
              {errors.password}
            </span>
          ) : (
            <span className="auth-hint" id="password-hint">
              At least 8 characters
            </span>
          )}
        </div>

        <button type="submit" className="btn-gold auth-submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <div className="auth-divider">or</div>

      <GoogleSignInLink returnTo={returnTo} />

      <p className="auth-switch">
        Already have an account? <Link to={loginHref}>Sign in</Link>
      </p>
    </div>
  );
}
