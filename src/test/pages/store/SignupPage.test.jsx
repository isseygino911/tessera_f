import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import { AuthProvider } from '@/context/AuthContext.jsx';
import SignupPage from '@/pages/store/SignupPage.jsx';

// Keep the real ApiError class (its constructor sets `message`/`status`);
// only replace the `api` functions with mocks.
vi.mock('@/lib/api.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    api: Object.fromEntries(Object.keys(actual.api).map((key) => [key, vi.fn()])),
  };
});

function renderSignupPage({ initialEntries = ['/signup'] } = {}) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<p>login page</p>} />
          <Route path="/checkout" element={<p>checkout page</p>} />
          <Route path="/" element={<p>home page</p>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

beforeEach(() => {
  vi.mocked(api.authMe).mockReset().mockRejectedValue(new ApiError('Not authenticated', 401));
  vi.mocked(api.authSignup).mockReset();
});

describe('SignupPage', () => {
  it('renders the heading, labelled fields and submit button', async () => {
    renderSignupPage();

    await waitFor(() => expect(api.authMe).toHaveBeenCalled());
    expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
  });

  it('links "Continue with Google" to /api/auth/google?returnTo=...', async () => {
    renderSignupPage({ initialEntries: ['/signup?returnTo=%2Fcheckout'] });

    await waitFor(() => expect(api.authMe).toHaveBeenCalled());
    expect(screen.getByRole('link', { name: 'Continue with Google' })).toHaveAttribute(
      'href',
      '/api/auth/google?returnTo=%2Fcheckout'
    );
  });

  it('links "Sign in" to /login', async () => {
    renderSignupPage();

    await waitFor(() => expect(api.authMe).toHaveBeenCalled());
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
  });

  it('submits name, email and password, then navigates to returnTo on success', async () => {
    vi.mocked(api.authSignup).mockResolvedValue({
      user: {
        id: 1,
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        avatarUrl: null,
        role: 'customer',
      },
    });

    renderSignupPage({ initialEntries: ['/signup?returnTo=%2Fcheckout'] });
    await waitFor(() => expect(api.authMe).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada Lovelace' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => expect(screen.getByText('checkout page')).toBeInTheDocument());
    expect(api.authSignup).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'password1',
    });
  });

  it('shows the 409 duplicate-email message from the API in an alert', async () => {
    vi.mocked(api.authSignup).mockRejectedValue(
      new ApiError('An account with this email already exists', 409)
    );

    renderSignupPage();
    await waitFor(() => expect(api.authMe).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada Lovelace' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'An account with this email already exists'
    );
  });
});
