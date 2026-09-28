import { useLayoutEffect } from 'react';
import { gsap, ScrollTrigger, MOTION_OK } from '@/lib/motion.js';

const DESKTOP = '(min-width: 768px)';
const STAGED_CLASS = 'landing-stones--staged';

// Pins the whole stones section — header row, heading, two-column stage and
// index together — at exactly 100vh (adds `landing-stones--staged`, which
// locks the section's height so nothing scrolls out from under the pin) for
// (count - 1) * 100% of scroll, snapping through each step. `onUpdate` sets
// the active index (never inside an effect body — it runs outside React's
// render). Also staggers each active article's [data-stage-item] lines and
// the heading letters once, on mount. A no-op under reduced motion or on
// mobile/tablet, where LandingStones renders a scroll-snap row instead.
export function useLandingStonesMotion(rootRef, count, onStep) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || count < 2) return undefined;
    const mm = gsap.matchMedia();

    mm.add(
      `${MOTION_OK} and ${DESKTOP}`,
      () => {
        root.classList.add(STAGED_CLASS);

        const heading = root.querySelectorAll('[data-stones-letter]');

        gsap.from(heading, {
          y: 24,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.02,
          scrollTrigger: { trigger: root, start: 'top 75%' },
        });

        ScrollTrigger.create({
          id: 'landing-stones-stage',
          trigger: root,
          start: 'top top',
          end: `+=${(count - 1) * 100}%`,
          pin: true,
          scrub: 1,
          snap: 1 / (count - 1),
          onUpdate: (self) => {
            const index = Math.min(count - 1, Math.round(self.progress * (count - 1)));
            onStep(index);
          },
        });

        return () => {
          root.classList.remove(STAGED_CLASS);
        };
      },
      root
    );

    ScrollTrigger.refresh();

    return () => mm.revert();
  }, [rootRef, count, onStep]);
}
