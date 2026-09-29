import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CRAFT_TABS } from '@/data/landingContent.js';
import LandingCraft from '@/components/LandingCraft.jsx';

const amber = {
  id: 1,
  slug: 'sunlit-amber',
  name: 'Sunlit Amber',
  hex: '#d9b45f',
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
  ],
};

const emerald = {
  id: 2,
  slug: 'forest-emerald',
  name: 'Forest Emerald',
  hex: '#2e5c45',
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

function enableStones() {
  const originalMatchMedia = window.matchMedia;
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: true,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  return () => {
    window.matchMedia = originalMatchMedia;
  };
}

describe('LandingCraft', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the tab photo and no stone images when matchMedia does not match', async () => {
    render(<LandingCraft products={products} />);

    const image = await screen.findByRole('img', {
      name: 'Sunlit Amber bracelet on a ceramic dish',
    });
    expect(image).toHaveAttribute('src', 'https://s3.test/products/sunlit-amber/dish.jpg');
    expect(document.querySelectorAll('.landing-craft__stone')).toHaveLength(0);
  });

  it('shows the active stone image and no tab photo when the stone animation is enabled', async () => {
    const restore = enableStones();

    render(<LandingCraft products={products} />);

    const activeStone = await screen.findByRole('img', { name: 'Sunlit Amber cut-out bead' });
    expect(activeStone).toHaveClass('landing-craft__stone--active');
    expect(document.querySelector('.landing-craft__photo')).not.toBeInTheDocument();

    const stones = document.querySelectorAll('.landing-craft__stone');
    expect(stones).toHaveLength(products.length);
    const inactiveStones = [...stones].filter((stone) => stone !== activeStone);
    inactiveStones.forEach((stone) => {
      expect(stone).toHaveAttribute('alt', '');
      expect(stone).toHaveAttribute('aria-hidden', 'true');
    });

    restore();
  });

  it('keeps every stone node mounted and moves the active flag on a tab change', async () => {
    const restore = enableStones();

    render(<LandingCraft products={products} />);

    await screen.findByRole('img', { name: 'Sunlit Amber cut-out bead' });
    const srcsBefore = [...document.querySelectorAll('.landing-craft__stone')]
      .map((stone) => stone.getAttribute('src'))
      .sort();

    const nextTab = CRAFT_TABS[1];
    fireEvent.click(screen.getByRole('tab', { name: nextTab.label }));

    const activeAfter = await screen.findByRole('img', { name: 'Forest Emerald cut-out bead' });
    expect(activeAfter).toHaveClass('landing-craft__stone--active');

    const stonesAfter = [...document.querySelectorAll('.landing-craft__stone')];
    const srcsAfter = stonesAfter.map((stone) => stone.getAttribute('src')).sort();
    expect(srcsAfter).toEqual(srcsBefore);

    const previousActive = stonesAfter.find(
      (stone) => stone.getAttribute('alt') === 'Sunlit Amber cut-out bead'
    );
    expect(previousActive).toBeUndefined();

    restore();
  });

  it("falls back to the first product's stone when the active tab's product isn't on sale", async () => {
    const restore = enableStones();

    render(<LandingCraft products={[emerald, topaz]} />);

    // CRAFT_TABS[0] is tied to sunlit-amber, which isn't in `products`.
    const activeStone = await screen.findByRole('img', { name: 'Forest Emerald cut-out bead' });
    expect(activeStone).toHaveClass('landing-craft__stone--active');

    restore();
  });
});
