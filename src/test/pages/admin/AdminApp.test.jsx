import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import { AuthProvider } from '@/context/AuthContext.jsx';
import AdminApp from '@/pages/admin/AdminApp.jsx';

// Keep the real ApiError class (its constructor sets `message`/`status`);
// only replace the `api` functions with mocks.
vi.mock('@/lib/api.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    api: Object.fromEntries(Object.keys(actual.api).map((key) => [key, vi.fn()])),
  };
});

function renderAdminApp({ initialEntries = ['/admin'] } = {}) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/login" element={<p>login page</p>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

beforeEach(() => {
  vi.mocked(api.authMe).mockReset();
  vi.mocked(api.adminGetProducts)?.mockReset?.();
  vi.mocked(api.adminGetOrders)?.mockReset?.();
});

describe('AdminApp', () => {
  it('redirects a signed-out visitor to /login?returnTo=%2Fadmin', async () => {
    vi.mocked(api.authMe).mockRejectedValue(new ApiError('Not authenticated', 401));

    renderAdminApp();

    await waitFor(() => expect(screen.getByText('login page')).toBeInTheDocument());
  });

  it('shows "You don\'t have access to the admin area." as an alert for a signed-in customer', async () => {
    vi.mocked(api.authMe).mockResolvedValue({
      user: { id: 1, email: 'ada@example.com', name: 'Ada', avatarUrl: null, role: 'customer' },
    });

    renderAdminApp();

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        "You don't have access to the admin area."
      )
    );
  });

  it('renders the admin layout for a signed-in admin', async () => {
    vi.mocked(api.authMe).mockResolvedValue({
      user: { id: 1, email: 'admin@admin.com', name: 'Admin', avatarUrl: null, role: 'admin' },
    });
    if (api.adminGetProducts) {
      vi.mocked(api.adminGetProducts).mockResolvedValue([]);
    }
    if (api.adminGetOrders) {
      vi.mocked(api.adminGetOrders).mockResolvedValue([]);
    }

    renderAdminApp();

    await waitFor(() =>
      expect(screen.getByRole('navigation', { name: 'Admin' })).toBeInTheDocument()
    );
    expect(screen.getByRole('link', { name: 'Products' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Orders' })).toBeInTheDocument();
  });
});
