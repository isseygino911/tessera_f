import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { useRef } from 'react';
import { gsap } from '@/lib/motion.js';
import { useLandingMobileMotion } from '@/hooks/useLandingMobileMotion.js';

function MobileMotionHarness({ ready = true }) {
  const rootRef = useRef(null);
  useLandingMobileMotion(rootRef, ready);

  return (
    <div ref={rootRef}>
      <div data-m-group>
        <p data-m-rise>Rises in from below</p>
      </div>
      <p data-m-line>A single revealed line</p>
      <p data-m-words>
        <span>Some</span> <span>words</span> <span>here</span>
      </p>
      <div data-m-slide>Slides into place</div>
    </div>
  );
}

function mockMatchMedia(matches) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.matchMedia = undefined;
  mockMatchMedia(false);
});

describe('useLandingMobileMotion', () => {
  it('scopes gsap.matchMedia to a query combining reduced-motion and the mobile breakpoint', () => {
    mockMatchMedia(false);
    let capturedQuery;
    const realMatchMedia = gsap.matchMedia.bind(gsap);
    vi.spyOn(gsap, 'matchMedia').mockImplementation(() => {
      const mm = realMatchMedia();
      const realAdd = mm.add.bind(mm);
      mm.add = (query, ...rest) => {
        capturedQuery = query;
        return realAdd(query, ...rest);
      };
      return mm;
    });

    render(<MobileMotionHarness />);

    expect(capturedQuery).toEqual(expect.stringContaining('prefers-reduced-motion: no-preference'));
    expect(capturedQuery).toEqual(expect.stringContaining('max-width: 767px'));
  });

  it('reverts the gsap context on unmount', () => {
    mockMatchMedia(false);
    const matchMediaSpy = vi.spyOn(gsap, 'matchMedia');

    const { unmount } = render(<MobileMotionHarness />);

    const mm = matchMediaSpy.mock.results[0].value;
    const revertSpy = vi.spyOn(mm, 'revert');

    unmount();

    expect(revertSpy).toHaveBeenCalledTimes(1);
  });

  it('leaves elements with no inline opacity/transform styles when reduced motion is preferred', () => {
    mockMatchMedia(false);

    const { container } = render(<MobileMotionHarness />);

    const animatable = container.querySelectorAll(
      '[data-m-rise], [data-m-line], [data-m-words] > span, [data-m-slide]'
    );
    expect(animatable.length).toBeGreaterThan(0);
    animatable.forEach((el) => {
      expect(el.style.opacity).toBe('');
      expect(el.style.transform).toBe('');
    });
  });
});
