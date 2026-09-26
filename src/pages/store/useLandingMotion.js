import { useLayoutEffect } from 'react';
import { gsap, ScrollTrigger, MOTION_OK, revealEach, scrubScale, spinOrbit } from './motion.js';

export function useLandingMotion(rootRef, cardsReady) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      MOTION_OK,
      () => {
        gsap
          .timeline({ defaults: { ease: 'power3.out', duration: 1 } })
          .from('[data-hero-line]', { yPercent: 110, opacity: 0, stagger: 0.12 })
          .from('[data-hero-ornament]', { scaleX: 0, duration: 0.8 }, '-=0.6')
          .from('[data-hero-fade]', { y: 16, opacity: 0, stagger: 0.1, duration: 0.8 }, '-=0.5')
          .from('[data-hero-center]', { scale: 0.86, opacity: 0, duration: 1.4 }, '-=0.9')
          .from('[data-hero-side="left"]', { xPercent: -30, opacity: 0, duration: 1.2 }, '-=1.1')
          .from('[data-hero-side="right"]', { xPercent: 30, opacity: 0, duration: 1.2 }, '<');

        revealEach('[data-reveal]');

        gsap.from('[data-step]', {
          y: 50,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.15,
          scrollTrigger: { trigger: '[data-steps]', start: 'top 80%' },
        });

        gsap.utils.toArray('[data-parallax]').forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: -8 },
            {
              yPercent: 8,
              ease: 'none',
              scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 },
            }
          );
        });

        spinOrbit('[data-orbit]');
        scrubScale('[data-banner-img]', '[data-banner]');
      },
      rootRef.current
    );

    return () => mm.revert();
  }, [rootRef]);

  // Collection cards arrive after the products request, so they get their own
  // context once rendered, and trigger positions are recalculated for the
  // newly settled page height.
  useLayoutEffect(() => {
    if (!cardsReady) return undefined;
    const mm = gsap.matchMedia();

    mm.add(
      MOTION_OK,
      () => {
        gsap.from('[data-card]', {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.15,
          scrollTrigger: { trigger: '[data-cards]', start: 'top 80%' },
        });
      },
      rootRef.current
    );
    ScrollTrigger.refresh();

    return () => mm.revert();
  }, [rootRef, cardsReady]);
}
