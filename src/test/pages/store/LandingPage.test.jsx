import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { api } from '@/lib/api.js';
import { CartProvider } from '@/context/CartContext.jsx';
import { CRAFT_TABS, QUOTES, STORY } from '@/data/landingContent.js';
import { formatPrice } from '@/lib/formatPrice.js';
import LandingPage from '@/pages/store/LandingPage.jsx';

vi.mock('@/lib/api.js');

const amber = {
  id: 1,
  slug: 'sunlit-amber',
  name: 'Sunlit Amber',
  hex: '#d9b45f',
  tagline: 'Warmth you can carry',
  story: 'Hand-faceted amber.',
  priceCents: 4800,
  stock: 20,
  images: [
    {
      id: 1,
      name: 'main',
      url: 'https://s3.test/products/sunlit-amber/main.jpg',
      alt: 'Sunlit Amber cut-out bead',
      role: 'main',
    },
    {
      id: 2,
      name: 'dish',
      url: 'https://s3.test/products/sunlit-amber/dish.jpg',
      alt: 'Sunlit Amber bracelet on a ceramic dish',
      role: 'gallery',
    },
    {
      id: 3,
      name: 'reading',
      url: 'https://s3.test/products/sunlit-amber/reading.jpg',
      alt: 'Sunlit Amber bracelet worn while reading',
      role: 'other',
    },
  ],
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
  images: [
    {
      id: 4,
      name: 'main',
      url: 'https://s3.test/products/forest-emerald/main.jpg',
      alt: 'Forest Emerald cut-out bead',
      role: 'main',
    },
    {
      id: 5,
      name: 'slate',
      url: 'https://s3.test/products/forest-emerald/slate.jpg',
      alt: 'Forest Emerald bracelet on a dark slate dish',
      role: 'gallery',
    },
  ],
};

const topaz = {
  id: 3,
  slug: 'ocean-topaz',
  name: 'Ocean Topaz',
  hex: '#1c4b6b',
  tagline: 'Made to wear daily',
  story: 'Hand-faceted topaz.',
  priceCents: 3900,
  stock: 0,
  images: [
    {
      id: 6,
      name: 'main',
      url: 'https://s3.test/products/ocean-topaz/main.jpg',
      alt: 'Ocean Topaz cut-out bead',
      role: 'main',
    },
    {
      id: 7,
      name: 'reflection',
      url: 'https://s3.test/products/ocean-topaz/reflection.jpg',
      alt: 'Ocean Topaz bracelet reflected on a dark glossy surface',
      role: 'gallery',
    },
  ],
};

const products = [amber, emerald, topaz];

function renderLanding() {
  return render(
    <CartProvider>
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    </CartProvider>
  );
}

async function findOrderSection() {
  const heading = await screen.findByRole('heading', { name: 'Order direct from the studio.' });
  return heading.closest('section');
}

function findOrderCard(orderSection, productName) {
  const name = within(orderSection).getByText(productName, {
    selector: '.landing-order__card-serif',
  });
  return name.closest('article');
}

beforeEach(() => {
  vi.mocked(api.getProducts).mockReset();
});

describe('LandingPage', () => {
  it('shows loading text, then the hero heading and each product name in Shop by stone', async () => {
    api.getProducts.mockResolvedValue(products);

    renderLanding();

    expect(screen.getByText('Loading the collection…')).toBeInTheDocument();

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Hand-faceted crystal, cut to hold the light.',
      })
    ).toBeInTheDocument();

    const stonesSection = document.getElementById('stones');
    expect(stonesSection).toBeTruthy();

    for (const product of products) {
      expect(
        within(stonesSection).getByRole('heading', { level: 3, name: product.name })
      ).toBeInTheDocument();
    }
  });

  it('shows an alert with the error message when getProducts rejects, while Craft still renders', async () => {
    api.getProducts.mockRejectedValue(new Error('network down'));

    renderLanding();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "The collection couldn't be loaded right now. Please try again in a moment."
    );

    expect(screen.getByRole('heading', { name: 'Hand-faceted.' })).toBeInTheDocument();
  });

  it('shows "No stones are available right now." when the product list is empty', async () => {
    api.getProducts.mockResolvedValue([]);

    renderLanding();

    expect(await screen.findByText('No stones are available right now.')).toBeInTheDocument();
  });

  it('renders 4 craft tabs in a tablist with the first selected by default', async () => {
    api.getProducts.mockResolvedValue(products);

    renderLanding();

    const tablist = await screen.findByRole('tablist');
    const tabs = within(tablist).getAllByRole('tab');

    expect(tabs).toHaveLength(4);
    expect(tabs).toHaveLength(CRAFT_TABS.length);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    tabs.slice(1).forEach((tab) => expect(tab).toHaveAttribute('aria-selected', 'false'));

    const firstTab = CRAFT_TABS[0];
    const panelId = tabs[0].getAttribute('aria-controls');
    const panel = document.getElementById(panelId);
    expect(within(panel).getByText(firstTab.title)).toBeInTheDocument();
    expect(within(panel).getByText(firstTab.text)).toBeInTheDocument();
  });

  it('selects another craft tab on click and shows its label and title in the tabpanel', async () => {
    api.getProducts.mockResolvedValue(products);

    renderLanding();

    const tablist = await screen.findByRole('tablist');
    const tabs = within(tablist).getAllByRole('tab');
    const nextTab = CRAFT_TABS[1];

    fireEvent.click(screen.getByRole('tab', { name: nextTab.label }));

    expect(screen.getByRole('tab', { name: nextTab.label })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');

    const panelId = screen.getByRole('tab', { name: nextTab.label }).getAttribute('aria-controls');
    const panel = document.getElementById(panelId);
    expect(within(panel).getByText(nextTab.title)).toBeInTheDocument();
  });

  it('adds a product to the cart and confirms it with a status message', async () => {
    api.getProducts.mockResolvedValue(products);

    renderLanding();

    const addButton = await screen.findByRole('button', { name: 'Add Sunlit Amber to cart' });
    fireEvent.click(addButton);

    expect(await screen.findByRole('status')).toHaveTextContent('Added to your cart.');
  });

  it('disables the control for an out-of-stock product and labels it Sold out', async () => {
    api.getProducts.mockResolvedValue(products);

    renderLanding();

    const orderSection = await findOrderSection();
    const topazCard = findOrderCard(orderSection, 'Ocean Topaz');

    const soldOutButton = within(topazCard).getByRole('button', { name: 'Sold out' });
    expect(soldOutButton).toBeDisabled();
    expect(soldOutButton).toHaveTextContent('Sold out');
  });

  it('shows the product price via formatPrice for the ordering cards', async () => {
    api.getProducts.mockResolvedValue(products);

    renderLanding();

    await screen.findByRole('button', { name: 'Add Sunlit Amber to cart' });
    expect(screen.getAllByText(formatPrice(amber.priceCents)).length).toBeGreaterThan(0);
  });

  it('tells the studio story under the "Our Studio" heading', async () => {
    api.getProducts.mockResolvedValue(products);

    renderLanding();

    const heading = await screen.findByRole('heading', { name: 'Our Studio' });
    const section = heading.closest('section');
    expect(within(section).getByText(STORY.lead)).toBeInTheDocument();
    STORY.paragraphs.forEach((paragraph) =>
      expect(within(section).getByText(paragraph)).toBeInTheDocument()
    );
    expect(within(section).getByText(STORY.signoff)).toBeInTheDocument();
  });

  it('renders 3 blockquotes, each cited to a stone name from QUOTES', async () => {
    api.getProducts.mockResolvedValue(products);

    renderLanding();

    await screen.findByRole('heading', { level: 1 });

    const blockquotes = document.querySelectorAll('blockquote');
    expect(blockquotes).toHaveLength(3);
    expect(QUOTES).toHaveLength(3);

    QUOTES.forEach((quote) => {
      const cite = screen.getByText(quote.name, { selector: 'cite' });
      expect(cite).toBeInTheDocument();
      expect(cite.closest('blockquote')).toHaveTextContent(quote.text);
    });
  });

  describe('when Sunlit Amber is not on sale', () => {
    beforeEach(() => {
      api.getProducts.mockResolvedValue([emerald, topaz]);
    });

    it('shows the next product with a photo in the hero, and counts only the stones on sale', async () => {
      renderLanding();

      await screen.findByRole('heading', { level: 1 });
      const heroPhoto = document.querySelector('.landing-hero__photo-wrap img');
      expect(heroPhoto).toHaveAttribute('src', 'https://s3.test/products/forest-emerald/main.jpg');
      expect(screen.getByText('2 stones · Hand-faceted')).toBeInTheDocument();
    });

    it('leaves out the Sunlit Amber quote', async () => {
      renderLanding();

      await screen.findByRole('heading', { level: 1 });
      expect(document.querySelectorAll('blockquote')).toHaveLength(2);
      expect(screen.queryByText('Sunlit Amber', { selector: 'cite' })).not.toBeInTheDocument();
    });
  });

  it('does not render its own header or footer landmarks (owned by the layout)', async () => {
    api.getProducts.mockResolvedValue(products);

    renderLanding();

    await screen.findByRole('heading', { level: 1 });

    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });
});
