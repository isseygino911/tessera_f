import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from '@/context/CartContext.jsx';
import { api } from '@/lib/api.js';
import ProductPage from '@/pages/store/ProductPage.jsx';

vi.mock('@/lib/api.js');

const STORAGE_KEY = 'simple_ecom_cart';

const amber = {
  id: 1,
  slug: 'sunlit-amber',
  name: 'Sunlit Amber',
  hex: '#d9b45f',
  tagline: 'Warmth you can carry',
  story: 'The first paragraph of the amber story.\n\nThe second paragraph of the amber story.',
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
  priceCents: 5200,
  stock: 5,
};

const topaz = {
  id: 3,
  slug: 'ocean-topaz',
  name: 'Ocean Topaz',
  hex: '#1c4b6b',
  tagline: 'Made to wear daily',
  story: 'Hand-faceted topaz.',
  priceCents: 4400,
  stock: 0,
};

const products = [amber, emerald, topaz];

function renderProductPage(initialPath = '/products/sunlit-amber') {
  return render(
    <CartProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/products/:slug" element={<ProductPage />} />
        </Routes>
      </MemoryRouter>
    </CartProvider>
  );
}

async function findHero(name) {
  return screen.findByRole('region', { name });
}

beforeEach(() => {
  window.localStorage.clear();
  vi.mocked(api.getProducts).mockReset();
});

describe('ProductPage', () => {
  it('renders the product name, tagline, price and every story paragraph', async () => {
    api.getProducts.mockResolvedValue(products);

    renderProductPage();

    const hero = await findHero('Sunlit Amber');
    expect(
      within(hero).getByRole('heading', { level: 1, name: 'Sunlit Amber' })
    ).toBeInTheDocument();
    expect(within(hero).getByText('Warmth you can carry')).toBeInTheDocument();
    expect(within(hero).getByText('$48.00')).toBeInTheDocument();
    expect(screen.getByText('The first paragraph of the amber story.').tagName).toBe('P');
    expect(screen.getByText('The second paragraph of the amber story.').tagName).toBe('P');
  });

  it('adds the product to the cart with an increased quantity and shows the Added status', async () => {
    api.getProducts.mockResolvedValue(products);

    renderProductPage();

    const hero = await findHero('Sunlit Amber');

    fireEvent.click(within(hero).getByRole('button', { name: 'Increase quantity' }));
    expect(within(hero).getByLabelText('Quantity')).toHaveValue(2);

    fireEvent.click(within(hero).getByRole('button', { name: 'Add to cart' }));

    expect(await within(hero).findByText(/Added/)).toBeInTheDocument();

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    expect(stored).toEqual(
      expect.arrayContaining([expect.objectContaining({ productId: 1, qty: 2 })])
    );
  });

  it('disables the main button and reads "Sold out" for an out-of-stock product', async () => {
    api.getProducts.mockResolvedValue(products);

    renderProductPage('/products/ocean-topaz');

    const hero = await findHero('Ocean Topaz');

    const button = within(hero).getByRole('button', { name: 'Sold out' });
    expect(button).toBeDisabled();
  });

  it('shows the not-found message for an unknown slug once products load', async () => {
    api.getProducts.mockResolvedValue(products);

    renderProductPage('/products/nope');

    expect(await screen.findByText("We couldn't find that product.")).toBeInTheDocument();
  });

  it('renders a stone nav with links to all three products and marks the current one', async () => {
    api.getProducts.mockResolvedValue(products);

    renderProductPage();

    await findHero('Sunlit Amber');

    const nav = screen.getByRole('navigation', { name: 'Stones' });
    const links = within(nav).getAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));

    expect(hrefs).toEqual(
      expect.arrayContaining([
        '/products/sunlit-amber',
        '/products/forest-emerald',
        '/products/ocean-topaz',
      ])
    );

    const currentLink = links.find(
      (link) => link.getAttribute('href') === '/products/sunlit-amber'
    );
    expect(currentLink).toHaveAttribute('aria-current', 'page');

    const otherLink = links.find(
      (link) => link.getAttribute('href') === '/products/forest-emerald'
    );
    expect(otherLink).not.toHaveAttribute('aria-current', 'page');
  });

  it('lists exactly the other two products under "Also in the collection"', async () => {
    api.getProducts.mockResolvedValue(products);

    renderProductPage();

    const heading = await screen.findByText('Also in the collection');
    const section = heading.closest('section');
    expect(section).toBeTruthy();

    const links = within(section).getAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));

    expect(hrefs).toEqual(
      expect.arrayContaining(['/products/forest-emerald', '/products/ocean-topaz'])
    );
    expect(hrefs).not.toContain('/products/sunlit-amber');
  });

  it('renders the site footer', async () => {
    api.getProducts.mockResolvedValue(products);

    renderProductPage();

    await findHero('Sunlit Amber');

    expect(document.querySelector('footer')).toBeInTheDocument();
  });

  it('still renders the product when prefers-reduced-motion is reported as matching', async () => {
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
      const hero = await (async () => {
        renderProductPage();
        return findHero('Sunlit Amber');
      })();

      expect(within(hero).getByRole('button', { name: 'Add to cart' })).toBeInTheDocument();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
