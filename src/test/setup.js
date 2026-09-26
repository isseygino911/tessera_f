import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom has no matchMedia implementation, but GSAP's matchMedia() (used for
// prefers-reduced-motion handling) requires window.matchMedia to exist.
// Individual tests can override window.matchMedia to control `matches`.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// jsdom does not implement window.scrollTo; pages call it on navigation.
window.scrollTo = vi.fn();
