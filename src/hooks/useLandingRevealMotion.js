import { useLayoutEffect } from 'react';
import { gsap, MOTION_OK, revealEach } from '@/lib/motion.js';

// Generic scroll-reveal for the homepage's static sections. Re-runs once
// `ready` flips true (products have loaded and the sections they gate are in
// the DOM), and reverts on unmount.
export function useLandingRevealMotion(rootRef, ready) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      MOTION_OK,
      () => {
        revealEach('[data-reveal]');
      },
      rootRef.current
    );

    return () => mm.revert();
  }, [rootRef, ready]);
}
