import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductPhoto from '@/components/ProductPhoto.jsx';

const productWithMain = {
  id: 1,
  images: [
    {
      id: 1,
      name: 'main',
      url: 'https://s3.test/products/sunlit-amber/main.jpg',
      alt: '',
      role: 'main',
    },
  ],
};

const productWithoutImages = { id: 2, images: [] };

describe('ProductPhoto', () => {
  it("renders an img with the product's main image url and the given name as alt text", () => {
    render(<ProductPhoto product={productWithMain} name="Sunlit Amber" />);

    const img = screen.getByRole('img', { name: 'Sunlit Amber' });
    expect(img).toHaveAttribute('src', 'https://s3.test/products/sunlit-amber/main.jpg');
  });

  it('renders a placeholder with no img when the product has no main image', () => {
    render(<ProductPhoto product={productWithoutImages} name="No Photo" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders a placeholder with no img when product is missing', () => {
    render(<ProductPhoto product={null} name="Missing" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('falls back to the placeholder once the image fails to load', () => {
    render(<ProductPhoto product={productWithMain} name="Sunlit Amber" />);

    const img = screen.getByRole('img', { name: 'Sunlit Amber' });
    fireEvent.error(img);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
