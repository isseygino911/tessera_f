import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { api } from '@/lib/api.js';
import ProductEditPage from '@/pages/admin/ProductEditPage.jsx';

// Keep the real ApiError class (its constructor sets `message`/`status`);
// only replace the `api` functions with mocks.
vi.mock('@/lib/api.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    api: Object.fromEntries(Object.keys(actual.api).map((key) => [key, vi.fn()])),
  };
});

// ProductImages is a self-contained component covered by its own tests
// (ProductImages.test.jsx); stubbing it here keeps this file focused on the
// edit form itself.
vi.mock('@/pages/admin/ProductImages.jsx', () => ({
  default: ({ product }) => <div data-testid="product-images">images for {product.id}</div>,
}));

const savedProduct = {
  id: 7,
  slug: 'rose-quartz',
  name: 'Rose Quartz',
  hex: '#e0a030',
  tagline: 'Soft and steady',
  story: 'A gentle stone.',
  priceCents: 4850,
  stock: 10,
  sortOrder: 1,
  active: true,
  images: [],
};

function renderPage(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/products/:id" element={<ProductEditPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.mocked(api.adminGetProduct).mockReset();
  vi.mocked(api.adminCreateProduct).mockReset();
  vi.mocked(api.adminUpdateProduct).mockReset();
  vi.mocked(api.adminDeleteProduct).mockReset();
});

describe('ProductEditPage', () => {
  it('labels the price field "Price ($)" and sends priceCents = dollars * 100', async () => {
    vi.mocked(api.adminGetProduct).mockResolvedValue(savedProduct);
    vi.mocked(api.adminUpdateProduct).mockResolvedValue(savedProduct);

    renderPage('/admin/products/7');
    await waitFor(() => expect(screen.getByLabelText('Price ($)')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '48.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(api.adminUpdateProduct).toHaveBeenCalled());
    const [, payload] = api.adminUpdateProduct.mock.calls[0];
    expect(payload.priceCents).toBe(4850);
  });

  it('fills the slug from the name on a new product, until the admin edits the slug', async () => {
    renderPage('/admin/products/new');
    await waitFor(() => expect(screen.getByLabelText('Name')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Rose Quartz' } });
    expect(screen.getByLabelText('Slug')).toHaveValue('rose-quartz');

    // Once the admin edits the slug directly, further name changes stop
    // overwriting it.
    fireEvent.change(screen.getByLabelText('Slug'), { target: { value: 'rose-quartz-custom' } });
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Rose Quartz Deluxe' } });
    expect(screen.getByLabelText('Slug')).toHaveValue('rose-quartz-custom');
  });

  it('navigates to /admin/products/:id after creating a new product', async () => {
    const createdProduct = { ...savedProduct, id: 42, images: [] };
    vi.mocked(api.adminCreateProduct).mockResolvedValue(createdProduct);
    vi.mocked(api.adminGetProduct).mockResolvedValue(createdProduct);

    render(
      <MemoryRouter initialEntries={['/admin/products/new']}>
        <Routes>
          <Route path="/admin/products/:id" element={<ProductEditPage />} />
          <Route path="/admin/products" element={<p>products list page</p>} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByLabelText('Name')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Rose Quartz' } });
    fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '48.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(api.adminCreateProduct).toHaveBeenCalled());
    // The route re-renders ProductEditPage at the new id rather than leaving
    // for the list, so it stays mounted showing the id-specific content.
    await waitFor(() => expect(api.adminGetProduct).toHaveBeenCalledWith('42'));
  });

  it('shows "Save the product to add photos." for a new, unsaved product', async () => {
    renderPage('/admin/products/new');

    await waitFor(() =>
      expect(screen.getByText('Save the product to add photos.')).toBeInTheDocument()
    );
    expect(screen.queryByTestId('product-images')).not.toBeInTheDocument();
  });

  it('renders ProductImages instead of the message once the product is saved', async () => {
    vi.mocked(api.adminGetProduct).mockResolvedValue(savedProduct);

    renderPage('/admin/products/7');

    await waitFor(() => expect(screen.getByTestId('product-images')).toBeInTheDocument());
    expect(screen.queryByText('Save the product to add photos.')).not.toBeInTheDocument();
  });

  it('deletes after a two-step confirm, and navigates to the list when not soft-deleted', async () => {
    vi.mocked(api.adminGetProduct).mockResolvedValue(savedProduct);
    vi.mocked(api.adminDeleteProduct).mockResolvedValue({ ok: true, softDeleted: false });

    render(
      <MemoryRouter initialEntries={['/admin/products/7']}>
        <Routes>
          <Route path="/admin/products/:id" element={<ProductEditPage />} />
          <Route path="/admin/products" element={<p>products list page</p>} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Delete product' })).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete product' }));
    expect(api.adminDeleteProduct).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }));

    await waitFor(() => expect(api.adminDeleteProduct).toHaveBeenCalledWith('7'));
    await waitFor(() => expect(screen.getByText('products list page')).toBeInTheDocument());
  });

  it('shows the soft-delete message and stays on the page when the server reports softDeleted', async () => {
    vi.mocked(api.adminGetProduct).mockResolvedValue(savedProduct);
    vi.mocked(api.adminDeleteProduct).mockResolvedValue({ ok: true, softDeleted: true });

    renderPage('/admin/products/7');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Delete product' })).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete product' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }));

    await waitFor(() =>
      expect(
        screen.getByText('This product has orders, so it was deactivated instead.')
      ).toBeInTheDocument()
    );
  });
});
