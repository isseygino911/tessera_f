import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { api } from '@/lib/api.js';
import OrderDetailPage from '@/pages/admin/OrderDetailPage.jsx';

vi.mock('@/lib/api.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    api: Object.fromEntries(Object.keys(actual.api).map((key) => [key, vi.fn()])),
  };
});

const ORDER_ID = '3f2a9c1b-7d4e-4a1a-9c3e-1234567890ab';

const baseOrder = {
  id: ORDER_ID,
  customerName: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '555-0100',
  addressLine1: '1 Analytical Engine Way',
  addressLine2: '',
  city: 'London',
  region: 'LDN',
  postalCode: 'W1A 1AA',
  country: 'UK',
  note: '',
  adminNote: '',
  status: 'new',
  totalCents: 4800,
  createdAt: '2026-01-01T00:00:00.000Z',
  items: [],
};

function renderOrderDetail() {
  return render(
    <MemoryRouter initialEntries={[`/admin/orders/${ORDER_ID}`]}>
      <Routes>
        <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.mocked(api.adminGetOrder).mockReset();
  vi.mocked(api.adminUpdateOrder).mockReset();
});

describe('OrderDetailPage', () => {
  it('shows a heading with the short order number', async () => {
    vi.mocked(api.adminGetOrder).mockResolvedValue(baseOrder);

    renderOrderDetail();

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Order #3F2A9C1B' })).toBeInTheDocument()
    );
  });

  it('saves the internal note and shows a "Note saved." status message', async () => {
    vi.mocked(api.adminGetOrder).mockResolvedValue(baseOrder);
    vi.mocked(api.adminUpdateOrder).mockResolvedValue({ ...baseOrder, adminNote: 'Call first' });

    renderOrderDetail();
    await waitFor(() => expect(screen.getByLabelText('Internal note')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Internal note'), { target: { value: 'Call first' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save note' }));

    await waitFor(() =>
      expect(api.adminUpdateOrder).toHaveBeenCalledWith(ORDER_ID, { adminNote: 'Call first' })
    );
    expect(screen.getByRole('status')).toHaveTextContent('Note saved.');
  });

  it('changes the status via the Status select, calling adminUpdateOrder', async () => {
    vi.mocked(api.adminGetOrder).mockResolvedValue(baseOrder);
    vi.mocked(api.adminUpdateOrder).mockResolvedValue({ ...baseOrder, status: 'contacted' });

    renderOrderDetail();
    await waitFor(() => expect(screen.getByLabelText('Status')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'contacted' } });

    await waitFor(() =>
      expect(api.adminUpdateOrder).toHaveBeenCalledWith(ORDER_ID, { status: 'contacted' })
    );
  });
});
