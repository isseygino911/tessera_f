import { describe, it, expect, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import LandingCraft from '@/components/LandingCraft.jsx';

function mockMotion(matches) {
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe('LandingCraft', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('plays the muted, looping background video, hidden from screen readers', () => {
    mockMotion(true);

    render(<LandingCraft />);

    const video = document.querySelector('.landing-craft__video');
    expect(video).toHaveAttribute('src', '/videos/craft.mp4');
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.autoplay).toBe(true);
    expect(video).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows the still poster without autoplay when reduced motion is preferred', () => {
    mockMotion(false);

    render(<LandingCraft />);

    const video = document.querySelector('.landing-craft__video');
    expect(video.autoplay).toBe(false);
    expect(video).toHaveAttribute('poster', '/videos/craft-poster.jpg');
  });
});
