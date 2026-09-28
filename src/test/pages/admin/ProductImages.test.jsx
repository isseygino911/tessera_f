import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { api, ApiError } from '@/lib/api.js';
import ProductImages from '@/pages/admin/ProductImages.jsx';

// Keep the real ApiError class (its constructor sets `message`/`status`);
// only replace the `api` functions with mocks.
vi.mock('@/lib/api.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    api: Object.fromEntries(Object.keys(actual.api).map((key) => [key, vi.fn()])),
  };
});

const product = {
  id: 7,
  slug: 'rose-quartz',
  images: [
    {
      id: 1,
      name: 'main',
      url: 'https://s3.test/products/rose-quartz/main.jpg',
      alt: 'Rose Quartz main photo',
      role: 'main',
      fit: 'cover',
      focalPoint: null,
      sortOrder: 0,
    },
    {
      id: 2,
      name: 'dish',
      url: 'https://s3.test/products/rose-quartz/dish.jpg',
      alt: 'Rose Quartz in a dish',
      role: 'gallery',
      fit: 'cover',
      focalPoint: null,
      sortOrder: 1,
    },
  ],
};

beforeEach(() => {
  vi.mocked(api.adminUploadImage).mockReset();
  vi.mocked(api.adminUpdateImage).mockReset();
  vi.mocked(api.adminDeleteImage).mockReset();
});

describe('ProductImages', () => {
  it('uploads each chosen file in turn via adminUploadImage and calls onChange with the returned product', async () => {
    const fileA = new File(['a'], 'a.jpg', { type: 'image/jpeg' });
    const fileB = new File(['b'], 'b.jpg', { type: 'image/jpeg' });
    const afterA = { ...product, images: [...product.images, { id: 3 }] };
    const afterB = { ...product, images: [...product.images, { id: 3 }, { id: 4 }] };
    vi.mocked(api.adminUploadImage).mockResolvedValueOnce(afterA).mockResolvedValueOnce(afterB);
    const onChange = vi.fn();

    render(<ProductImages product={product} onChange={onChange} />);

    const input = screen.getByLabelText('Add photos');
    fireEvent.change(input, { target: { files: [fileA, fileB] } });

    await waitFor(() => expect(api.adminUploadImage).toHaveBeenCalledTimes(2));
    expect(api.adminUploadImage).toHaveBeenNthCalledWith(1, product.id, fileA);
    expect(api.adminUploadImage).toHaveBeenNthCalledWith(2, product.id, fileB);
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(afterB));
  });

  it('labels each card uniquely and Save sends only the fields changed on that card', async () => {
    vi.mocked(api.adminUpdateImage).mockResolvedValue(product);

    render(<ProductImages product={product} onChange={vi.fn()} />);

    expect(screen.getByLabelText('Role for image 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Fit for image 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Alt text for image 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Order for image 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Role for image 2')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Alt text for image 2'), {
      target: { value: 'Updated alt' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Save' })[1]);

    await waitFor(() =>
      expect(api.adminUpdateImage).toHaveBeenCalledWith(product.id, 2, { alt: 'Updated alt' })
    );
  });

  it('deletes an image after a two-step confirm', async () => {
    vi.mocked(api.adminDeleteImage).mockResolvedValue({ ...product, images: [product.images[0]] });
    const onChange = vi.fn();

    render(<ProductImages product={product} onChange={onChange} />);

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButtons[1]);
    expect(api.adminDeleteImage).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }));

    await waitFor(() => expect(api.adminDeleteImage).toHaveBeenCalledWith(product.id, 2));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
  });

  it('shows a role=alert message when an API call fails', async () => {
    vi.mocked(api.adminUploadImage).mockRejectedValue(
      new ApiError('Upload a JPG, PNG or WebP image', 400)
    );
    const file = new File(['a'], 'a.txt', { type: 'text/plain' });

    render(<ProductImages product={product} onChange={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Add photos'), { target: { files: [file] } });

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Upload a JPG, PNG or WebP image')
    );
  });
});
