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

const emptySummary = {
  newOrders: 0,
  revenueThisMonthCents: 0,
  lowStock: [],
  recentOrders: [],
};

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
  vi.mocked(api.adminGetSummary)?.mockReset?.();
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

  it('renders the dashboard at /admin for a signed-in admin, with Dashboard, Products and Orders in the nav', async () => {
    vi.mocked(api.authMe).mockResolvedValue({
      user: { id: 1, email: 'admin@admin.com', name: 'Admin', avatarUrl: null, role: 'admin' },
    });
    vi.mocked(api.adminGetSummary).mockResolvedValue(emptySummary);

    renderAdminApp();

    await waitFor(() =>
      expect(screen.getByRole('navigation', { name: 'Admin' })).toBeInTheDocument()
    );
    const nav = screen.getByRole('navigation', { name: 'Admin' });
    const navLinkNames = Array.from(nav.querySelectorAll('a')).map((a) => a.textContent);
    expect(navLinkNames).toEqual(['Dashboard', 'Products', 'Orders']);

    await waitFor(() => expect(api.adminGetSummary).toHaveBeenCalled());
  });

  it('opens the empty add-product form at /admin/products/new without loading a product', async () => {
    vi.mocked(api.authMe).mockResolvedValue({
      user: { id: 1, email: 'admin@admin.com', name: 'Admin', avatarUrl: null, role: 'admin' },
    });

    renderAdminApp({ initialEntries: ['/admin/products/new'] });

    expect(await screen.findByRole('heading', { name: 'Add product' })).toBeInTheDocument();
    expect(screen.getByText('Save the product to add photos.')).toBeInTheDocument();
    expect(api.adminGetProduct).not.toHaveBeenCalled();
  });
});
