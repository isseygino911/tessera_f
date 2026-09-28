import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { api } from '@/lib/api.js';
import OrdersListPage from '@/pages/admin/OrdersListPage.jsx';

vi.mock('@/lib/api.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    api: Object.fromEntries(Object.keys(actual.api).map((key) => [key, vi.fn()])),
  };
});

function renderOrdersList({ initialEntries = ['/admin/orders'] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/admin/orders" element={<OrdersListPage />} />
        <Route path="/admin/orders/:id" element={<p>order detail page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

const order = (overrides = {}) => ({
  id: '3f2a9c1b-7d4e-4a1a-9c3e-1234567890ab',
  customerName: 'Ada Lovelace',
  email: 'ada@example.com',
  totalCents: 4800,
  status: 'new',
  itemCount: 2,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

beforeEach(() => {
  vi.mocked(api.adminGetOrders).mockReset();
});

describe('OrdersListPage', () => {
  it('reads the status filter from the URL and passes it to adminGetOrders', async () => {
    vi.mocked(api.adminGetOrders).mockResolvedValue({ orders: [], total: 0 });

    renderOrdersList({ initialEntries: ['/admin/orders?status=new'] });

    await waitFor(() =>
      expect(api.adminGetOrders).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'new', page: 1 })
      )
    );
  });

  it('has a search box labelled "Search orders" and a "Search" button', async () => {
    vi.mocked(api.adminGetOrders).mockResolvedValue({ orders: [order()], total: 1 });

    renderOrdersList();

    await waitFor(() => expect(screen.getByLabelText('Search orders')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('calls adminGetOrders with q when the search box is submitted', async () => {
    vi.mocked(api.adminGetOrders).mockResolvedValue({ orders: [], total: 0 });

    renderOrdersList();
    await waitFor(() => expect(api.adminGetOrders).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText('Search orders'), { target: { value: 'ada' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() =>
      expect(api.adminGetOrders).toHaveBeenLastCalledWith(
        expect.objectContaining({ q: 'ada', page: 1 })
      )
    );
  });

  it('shows an Items column with the itemCount', async () => {
    vi.mocked(api.adminGetOrders).mockResolvedValue({
      orders: [order({ itemCount: 4 })],
      total: 1,
    });

    renderOrdersList();

    await waitFor(() => expect(screen.getByText('Items')).toBeInTheDocument());
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('shows a pager with Previous, Page X of Y and Next when there is more than one page', async () => {
    vi.mocked(api.adminGetOrders).mockResolvedValue({
      orders: Array.from({ length: 20 }, (_, i) => order({ id: `id-${i}` })),
      total: 25,
    });

    renderOrdersList();

    await waitFor(() => expect(screen.getByText('Page 1 of 2')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('hides the pager when there is only one page', async () => {
    vi.mocked(api.adminGetOrders).mockResolvedValue({ orders: [order()], total: 1 });

    renderOrdersList();

    await waitFor(() => expect(screen.getByText('Ada Lovelace')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument();
  });

  it('shows "No orders match." when filtered and empty', async () => {
    vi.mocked(api.adminGetOrders).mockResolvedValue({ orders: [], total: 0 });

    renderOrdersList({ initialEntries: ['/admin/orders?status=new'] });

    await waitFor(() => expect(screen.getByText('No orders match.')).toBeInTheDocument());
  });

  it('shows "No orders yet." when unfiltered and empty', async () => {
    vi.mocked(api.adminGetOrders).mockResolvedValue({ orders: [], total: 0 });

    renderOrdersList();

    await waitFor(() => expect(screen.getByText('No orders yet.')).toBeInTheDocument());
  });
});
