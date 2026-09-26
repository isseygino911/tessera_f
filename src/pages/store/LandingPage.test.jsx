import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage.jsx';
import { api } from '../../api.js';

vi.mock('../../api.js');

const amber = {
  id: 1,
  slug: 'sunlit-amber',
  name: 'Sunlit Amber',
  hex: '#d9b45f',
  tagline: 'Warmth you can carry',
  story: 'Hand-faceted amber.',
  priceCents: 4800,
  stock: 20,
};

const emerald = {
  id: 2,
  slug: 'forest-emerald',
  name: 'Forest Emerald',
  hex: '#2e5c45',
  tagline: 'Cut to catch the light',
  story: 'Hand-faceted emerald.',
  priceCents: 4800,
  stock: 5,
};

const topaz = {
  id: 3,
  slug: 'ocean-topaz',
  name: 'Ocean Topaz',
  hex: '#1c4b6b',
  tagline: 'Made to wear daily',
  story: 'Hand-faceted topaz.',
  priceCents: 4800,
  stock: 0,
};

const products = [amber, emerald, topaz];

function renderLanding() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
}

async function findCollectionSection() {
  const heading = await screen.findByText('The Collection');
  return heading.closest('section');
}

beforeEach(() => {
  vi.mocked(api.getProducts).mockReset();
});

describe('LandingPage', () => {
  it('renders the hero heading', async () => {
    api.getProducts.mockResolvedValue(products);

    renderLanding();

    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders a link to each product page inside the collection section', async () => {
    api.getProducts.mockResolvedValue(products);

    renderLanding();

    const section = await findCollectionSection();
    expect(section).toBeTruthy();

    const links = await within(section).findAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));

    expect(hrefs).toEqual(expect.arrayContaining(['/products/sunlit-amber', '/products/forest-emerald', '/products/ocean-topaz']));

    const amberLink = links.find((link) => link.getAttribute('href') === '/products/sunlit-amber');
    expect(amberLink).toHaveAccessibleName(expect.stringContaining('Sunlit Amber'));
  });

  it('formats the price as dollars and cents', async () => {
    api.getProducts.mockResolvedValue(products);

    renderLanding();

    const section = await findCollectionSection();
    expect(within(section).getAllByText('$48.00').length).toBeGreaterThan(0);
  });

  it('shows "Sold out" exactly once, for the out-of-stock product', async () => {
    api.getProducts.mockResolvedValue(products);

    renderLanding();

    const section = await findCollectionSection();
    const soldOutMatches = await within(section).findAllByText('Sold out');
    expect(soldOutMatches).toHaveLength(1);
  });

  it('still renders all product links when prefers-reduced-motion is reported as matching', async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    api.getProducts.mockResolvedValue(products);

    try {
      renderLanding();

      const section = await findCollectionSection();
      const links = await within(section).findAllByRole('link');
      const hrefs = links.map((link) => link.getAttribute('href'));

      expect(hrefs).toEqual(
        expect.arrayContaining(['/products/sunlit-amber', '/products/forest-emerald', '/products/ocean-topaz'])
      );
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('still renders the hero heading when getProducts rejects', async () => {
    api.getProducts.mockRejectedValue(new Error('network down'));

    expect(() => renderLanding()).not.toThrow();

    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
