import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SiteFooter from '@/components/SiteFooter.jsx';

function renderFooter() {
  return render(
    <MemoryRouter>
      <SiteFooter />
    </MemoryRouter>
  );
}

describe('SiteFooter', () => {
  it('renders a contentinfo landmark', () => {
    renderFooter();

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('links "Shop the collection" to /#order', () => {
    renderFooter();

    expect(screen.getByRole('link', { name: /Shop the collection/ })).toHaveAttribute(
      'href',
      '/#order'
    );
  });

  it('links "Your Cart" to /cart', () => {
    renderFooter();

    expect(screen.getByRole('link', { name: 'Your Cart' })).toHaveAttribute('href', '/cart');
  });
});
