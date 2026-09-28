import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { api } from '@/lib/api.js';
import { CartProvider } from '@/context/CartContext.jsx';
import { CRAFT_TABS, QUOTES } from '@/data/labContent.js';
import { formatPrice } from '@/lib/formatPrice.js';
import LabLandingPage from '@/pages/store/LabLandingPage.jsx';

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
  priceCents: 3900,
  stock: 0,
};

const products = [amber, emerald, topaz];

function renderLabLanding() {
  return render(
    <CartProvider>
      <MemoryRouter>
        <LabLandingPage />
      </MemoryRouter>
    </CartProvider>
  );
}

async function findOrderSection() {
  const heading = await screen.findByRole('heading', { name: 'Order requests only.' });
  return heading.closest('section');
}

function findOrderCard(orderSection, productName) {
  const name = within(orderSection).getByText(productName, { selector: '.lab-order__card-serif' });
  return name.closest('article');
}

beforeEach(() => {
  vi.mocked(api.getProducts).mockReset();
});

describe('LabLandingPage', () => {
  it('shows loading text, then the hero heading and each product name in Shop by stone', async () => {
    api.getProducts.mockResolvedValue(products);

    renderLabLanding();

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

  it('shows an alert with the error message when getProducts rejects, while Craft and the footer still render', async () => {
    api.getProducts.mockRejectedValue(new Error('network down'));

    renderLabLanding();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "The collection couldn't be loaded right now. Please try again in a moment."
    );

    expect(screen.getByRole('heading', { name: 'Hand-faceted.' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('shows "No stones are available right now." when the product list is empty', async () => {
    api.getProducts.mockResolvedValue([]);

    renderLabLanding();

    expect(await screen.findByText('No stones are available right now.')).toBeInTheDocument();
  });

  it('renders 4 craft tabs in a tablist with the first selected by default', async () => {
    api.getProducts.mockResolvedValue(products);

    renderLabLanding();

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

    renderLabLanding();

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

  it('adds a product to the cart, confirms it, and updates the header cart count', async () => {
    api.getProducts.mockResolvedValue(products);

    renderLabLanding();

    const addButton = await screen.findByRole('button', { name: 'Add Sunlit Amber to cart' });
    fireEvent.click(addButton);

    expect(await screen.findByRole('status')).toHaveTextContent('Added to your cart.');
    expect(await screen.findByRole('link', { name: 'Cart, 1 items' })).toBeInTheDocument();
  });

  it('disables the control for an out-of-stock product and labels it Sold out', async () => {
    api.getProducts.mockResolvedValue(products);

    renderLabLanding();

    const orderSection = await findOrderSection();
    const topazCard = findOrderCard(orderSection, 'Ocean Topaz');

    const soldOutButton = within(topazCard).getByRole('button', { name: 'Sold out' });
    expect(soldOutButton).toBeDisabled();
    expect(soldOutButton).toHaveTextContent('Sold out');
  });

  it('shows the product price via formatPrice for the ordering cards', async () => {
    api.getProducts.mockResolvedValue(products);

    renderLabLanding();

    await screen.findByRole('button', { name: 'Add Sunlit Amber to cart' });
    expect(screen.getAllByText(formatPrice(amber.priceCents)).length).toBeGreaterThan(0);
  });

  it('renders 3 blockquotes, each cited to a stone name from QUOTES', async () => {
    api.getProducts.mockResolvedValue(products);

    renderLabLanding();

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

  it('renders header nav anchors to the stones, craft, story and order sections', async () => {
    api.getProducts.mockResolvedValue(products);

    renderLabLanding();

    const nav = await screen.findByRole('navigation', { name: 'Lab' });

    expect(within(nav).getByRole('link', { name: 'Stones' })).toHaveAttribute('href', '#stones');
    expect(within(nav).getByRole('link', { name: 'Craft' })).toHaveAttribute('href', '#craft');
    expect(within(nav).getByRole('link', { name: 'Story' })).toHaveAttribute('href', '#story');
    expect(within(nav).getByRole('link', { name: 'Order' })).toHaveAttribute('href', '#order');
  });
});
