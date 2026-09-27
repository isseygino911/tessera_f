import { useLayoutEffect } from 'react';
import { gsap, ScrollTrigger, MOTION_OK, revealEach } from './motion.js';

export function useLandingMotion(rootRef, cardsReady) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      MOTION_OK,
      () => {
        gsap
          .timeline({ defaults: { ease: 'power3.out', duration: 1 } })
          .from('[data-hero-photo]', { scale: 1.12, opacity: 0, duration: 1.6 })
          .from('[data-hero-line]', { yPercent: 110, opacity: 0, stagger: 0.12 }, '-=1.1')
          .from('[data-hero-fade]', { y: 16, opacity: 0, stagger: 0.1, duration: 0.8 }, '-=0.5')
          .from('[data-hero-card]', { y: 24, opacity: 0, duration: 0.9 }, '-=0.5');

        revealEach('[data-reveal]');
      },
      rootRef.current
    );

    return () => mm.revert();
  }, [rootRef]);

  // Collection and story cards arrive after the products request, so they get their own
  // context once rendered, and trigger positions are recalculated for the
  // newly settled page height.
  useLayoutEffect(() => {
    if (!cardsReady) return undefined;
    const mm = gsap.matchMedia();

    mm.add(
      MOTION_OK,
      () => {
        [
          ['[data-card]', '[data-cards]'],
          ['[data-story]', '[data-stories]'],
        ].forEach(([items, trigger]) => {
          gsap.from(items, {
            y: 60,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
            stagger: 0.15,
            scrollTrigger: { trigger, start: 'top 80%' },
          });
        });
      },
      rootRef.current
    );
    ScrollTrigger.refresh();

    return () => mm.revert();
  }, [rootRef, cardsReady]);
}
