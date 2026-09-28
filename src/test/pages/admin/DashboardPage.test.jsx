import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { api } from '@/lib/api.js';
import { formatPrice } from '@/lib/formatPrice.js';
import DashboardPage from '@/pages/admin/DashboardPage.jsx';

vi.mock('@/lib/api.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    api: Object.fromEntries(Object.keys(actual.api).map((key) => [key, vi.fn()])),
  };
});

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/orders" element={<p>orders list page</p>} />
        <Route path="/admin/orders/:id" element={<p>order detail page</p>} />
        <Route path="/admin/products/:id" element={<p>product edit page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

const baseSummary = {
  newOrders: 3,
  revenueThisMonthCents: 125000,
  lowStock: [],
  recentOrders: [],
};

beforeEach(() => {
  vi.mocked(api.adminGetSummary).mockReset();
});

describe('DashboardPage', () => {
  it('shows the New orders count linking to the filtered order list', async () => {
    vi.mocked(api.adminGetSummary).mockResolvedValue(baseSummary);

    renderDashboard();

    await waitFor(() => expect(screen.getByText('New orders')).toBeInTheDocument());
    expect(screen.getByText('3')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /New orders/ });
    expect(link).toHaveAttribute('href', '/admin/orders?status=new');
  });

  it("shows this month's revenue formatted as a price", async () => {
    vi.mocked(api.adminGetSummary).mockResolvedValue(baseSummary);

    renderDashboard();

    await waitFor(() => expect(screen.getByText('Revenue this month')).toBeInTheDocument());
    expect(screen.getByText(formatPrice(125000))).toBeInTheDocument();
  });

  it('lists low-stock products, each linking to its edit page', async () => {
    vi.mocked(api.adminGetSummary).mockResolvedValue({
      ...baseSummary,
      lowStock: [{ id: 1, name: 'Sunlit Amber', stock: 3 }],
    });

    renderDashboard();

    await waitFor(() => expect(screen.getByText('Sunlit Amber')).toBeInTheDocument());
    const link = screen.getByRole('link', { name: /Sunlit Amber/ });
    expect(link).toHaveAttribute('href', '/admin/products/1');
  });

  it('shows "All products are well stocked" when lowStock is empty', async () => {
    vi.mocked(api.adminGetSummary).mockResolvedValue(baseSummary);

    renderDashboard();

    await waitFor(() =>
      expect(screen.getByText('All products are well stocked')).toBeInTheDocument()
    );
  });

  it('shows recent orders as short ids, with a View all orders link', async () => {
    vi.mocked(api.adminGetSummary).mockResolvedValue({
      ...baseSummary,
      recentOrders: [{ id: '3f2a9c1b-7d4e-4a1a-9c3e-1234567890ab', customerName: 'Ada Lovelace' }],
    });

    renderDashboard();

    await waitFor(() => expect(screen.getByText('#3F2A9C1B')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'View all orders' })).toHaveAttribute(
      'href',
      '/admin/orders'
    );
  });
});
