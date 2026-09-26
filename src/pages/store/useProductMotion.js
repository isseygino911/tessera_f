import { useLayoutEffect } from 'react';
import { gsap, ScrollTrigger, MOTION_OK, revealEach, scrubScale, spinOrbit } from './motion.js';

// Runs once per product shown (the stone selector swaps slug on the same
// mounted page, so the intro replays). The buy-bar toggle is not an
// animation, so it lives outside matchMedia and works with reduced motion too.
export function useProductMotion(rootRef, slug, setBarVisible) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!slug || !root) return undefined;

    const mm = gsap.matchMedia();
    mm.add(
      MOTION_OK,
      () => {
        gsap
          .timeline({ defaults: { ease: 'power3.out', duration: 1 } })
          .from('[data-pd-photo]', { scale: 0.88, opacity: 0, duration: 1.4 })
          .from('[data-pd-line]', { yPercent: 110, opacity: 0 }, 0.15)
          .from('[data-pd-ornament]', { scaleX: 0, duration: 0.8 }, '-=0.5')
          .from('[data-pd-fade]', { y: 16, opacity: 0, stagger: 0.08, duration: 0.8 }, '-=0.6');

        spinOrbit('[data-orbit]');
        revealEach('[data-reveal]');
        scrubScale('[data-banner-img]', '[data-banner]');
      },
      root
    );

    const bar = ScrollTrigger.create({
      trigger: root.querySelector('[data-purchase]'),
      start: 'bottom top',
      endTrigger: root.querySelector('.site-footer'),
      end: 'top bottom',
      onToggle: (self) => setBarVisible(self.isActive),
    });

    return () => {
      bar.kill();
      mm.revert();
      setBarVisible(false);
    };
  }, [rootRef, slug, setBarVisible]);
}
