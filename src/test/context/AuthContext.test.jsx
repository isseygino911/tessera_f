import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { api, ApiError } from '@/lib/api.js';
import { AuthProvider, useAuth } from '@/context/AuthContext.jsx';

// Keep the real ApiError class (its constructor sets `message`/`status`);
// only replace the `api` functions with mocks.
vi.mock('@/lib/api.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    api: Object.fromEntries(Object.keys(actual.api).map((key) => [key, vi.fn()])),
  };
});

const user = {
  id: 1,
  email: 'ada@example.com',
  name: 'Ada Lovelace',
  avatarUrl: null,
  role: 'customer',
};

// Mirrors how a real caller (LoginPage) uses login/signup: awaits the call
// inside a handler and catches a rejection instead of leaving it unhandled.
function TestHarness() {
  const auth = useAuth();
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    try {
      await auth.login('ada@example.com', 'password1');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'unknown error');
    }
  };

  return (
    <div>
      <div data-testid="status">{auth.status}</div>
      <div data-testid="user">{auth.user ? auth.user.email : ''}</div>
      <div data-testid="error">{error ?? ''}</div>
      <button onClick={handleLogin}>login</button>
      <button
        onClick={() =>
          auth.signup({ name: 'Ada', email: 'ada@example.com', password: 'password1' })
        }
      >
        signup
      </button>
      <button onClick={() => auth.logout()}>logout</button>
    </div>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <TestHarness />
    </AuthProvider>
  );
}

beforeEach(() => {
  vi.mocked(api.authMe).mockReset();
  vi.mocked(api.authLogin).mockReset();
  vi.mocked(api.authSignup).mockReset();
  vi.mocked(api.authLogout).mockReset();
});

describe('AuthProvider / useAuth', () => {
  it('starts loading, then becomes anon when authMe rejects', async () => {
    vi.mocked(api.authMe).mockRejectedValue(new ApiError('Not authenticated', 401));

    renderAuth();

    expect(screen.getByTestId('status')).toHaveTextContent('loading');
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anon'));
    expect(screen.getByTestId('user')).toHaveTextContent('');
  });

  it('becomes authed with the user when authMe resolves', async () => {
    vi.mocked(api.authMe).mockResolvedValue({ user });

    renderAuth();

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authed'));
    expect(screen.getByTestId('user')).toHaveTextContent('ada@example.com');
  });

  it('login() sets status to authed and stores the returned user', async () => {
    vi.mocked(api.authMe).mockRejectedValue(new ApiError('Not authenticated', 401));
    vi.mocked(api.authLogin).mockResolvedValue({ user });

    renderAuth();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anon'));

    fireEvent.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authed'));
    expect(api.authLogin).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'password1' });
    expect(screen.getByTestId('user')).toHaveTextContent('ada@example.com');
  });

  it('signup() sets status to authed and stores the returned user', async () => {
    vi.mocked(api.authMe).mockRejectedValue(new ApiError('Not authenticated', 401));
    vi.mocked(api.authSignup).mockResolvedValue({ user });

    renderAuth();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anon'));

    fireEvent.click(screen.getByText('signup'));

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authed'));
    expect(api.authSignup).toHaveBeenCalledWith({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'password1',
    });
  });

  it('logout() sets status to anon and clears the user', async () => {
    vi.mocked(api.authMe).mockResolvedValue({ user });
    vi.mocked(api.authLogout).mockResolvedValue({ ok: true });

    renderAuth();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authed'));

    fireEvent.click(screen.getByText('logout'));

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anon'));
    expect(screen.getByTestId('user')).toHaveTextContent('');
  });

  it('a failed login() rejects (caught by the caller) and leaves status anon', async () => {
    vi.mocked(api.authMe).mockRejectedValue(new ApiError('Not authenticated', 401));
    vi.mocked(api.authLogin).mockRejectedValue(new ApiError('Email or password is incorrect', 401));

    renderAuth();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anon'));

    fireEvent.click(screen.getByText('login'));

    await waitFor(() =>
      expect(screen.getByTestId('error')).toHaveTextContent('Email or password is incorrect')
    );
    expect(screen.getByTestId('status')).toHaveTextContent('anon');
  });
});
