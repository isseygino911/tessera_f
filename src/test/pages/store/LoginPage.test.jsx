import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import { AuthProvider } from '@/context/AuthContext.jsx';
import LoginPage from '@/pages/store/LoginPage.jsx';

// Keep the real ApiError class (its constructor sets `message`/`status`);
// only replace the `api` functions with mocks.
vi.mock('@/lib/api.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    api: Object.fromEntries(Object.keys(actual.api).map((key) => [key, vi.fn()])),
  };
});

function renderLoginPage({ initialEntries = ['/login'] } = {}) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<p>signup page</p>} />
          <Route path="/checkout" element={<p>checkout page</p>} />
          <Route path="/" element={<p>home page</p>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

beforeEach(() => {
  vi.mocked(api.authMe).mockReset().mockRejectedValue(new ApiError('Not authenticated', 401));
  vi.mocked(api.authLogin).mockReset();
});

describe('LoginPage', () => {
  it('renders the eyebrow, heading, labelled fields and submit button', async () => {
    renderLoginPage();

    await waitFor(() => expect(api.authMe).toHaveBeenCalled());
    expect(screen.getByText('Your account')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('links "Continue with Google" to /api/auth/google?returnTo=/ when there is no returnTo', async () => {
    renderLoginPage();

    await waitFor(() => expect(api.authMe).toHaveBeenCalled());
    expect(screen.getByRole('link', { name: 'Continue with Google' })).toHaveAttribute(
      'href',
      '/api/auth/google?returnTo=%2F'
    );
  });

  it('carries returnTo through to the Google link and to the Create an account link', async () => {
    renderLoginPage({ initialEntries: ['/login?returnTo=%2Fcheckout'] });

    await waitFor(() => expect(api.authMe).toHaveBeenCalled());
    expect(screen.getByRole('link', { name: 'Continue with Google' })).toHaveAttribute(
      'href',
      '/api/auth/google?returnTo=%2Fcheckout'
    );
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
      'href',
      '/signup?returnTo=%2Fcheckout'
    );
  });

  it('links "Create an account" to /signup', async () => {
    renderLoginPage();

    await waitFor(() => expect(api.authMe).toHaveBeenCalled());
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
      'href',
      '/signup'
    );
  });

  it('shows "Google sign-in didn\'t work. Please try again." as an alert for ?error=google', async () => {
    renderLoginPage({ initialEntries: ['/login?error=google'] });

    await waitFor(() => expect(api.authMe).toHaveBeenCalled());
    expect(screen.getByRole('alert')).toHaveTextContent(
      "Google sign-in didn't work. Please try again."
    );
  });

  it('submits email and password, then navigates to returnTo on success', async () => {
    vi.mocked(api.authLogin).mockResolvedValue({
      user: { id: 1, email: 'ada@example.com', name: 'Ada', avatarUrl: null, role: 'customer' },
    });

    renderLoginPage({ initialEntries: ['/login?returnTo=%2Fcheckout'] });
    await waitFor(() => expect(api.authMe).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(screen.getByText('checkout page')).toBeInTheDocument());
    expect(api.authLogin).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'password1' });
  });

  it('shows the API error message in an alert when login fails', async () => {
    vi.mocked(api.authLogin).mockRejectedValue(new ApiError('Email or password is incorrect', 401));

    renderLoginPage();
    await waitFor(() => expect(api.authMe).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Email or password is incorrect');
  });

  it('redirects to returnTo immediately when already authenticated', async () => {
    vi.mocked(api.authMe)
      .mockReset()
      .mockResolvedValue({
        user: { id: 1, email: 'ada@example.com', name: 'Ada', avatarUrl: null, role: 'customer' },
      });

    renderLoginPage({ initialEntries: ['/login?returnTo=%2Fcheckout'] });

    await waitFor(() => expect(screen.getByText('checkout page')).toBeInTheDocument());
  });
});
