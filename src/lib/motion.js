import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

// Store pages only animate when the visitor hasn't asked for reduced motion;
// everything else renders in its final, static state.
export const MOTION_OK = '(prefers-reduced-motion: no-preference)';

// Call these inside a gsap.matchMedia().add(MOTION_OK, fn, scope) callback so
// selectors resolve within the page and unmount reverts them.
export function revealEach(selector) {
  gsap.utils.toArray(selector).forEach((el) => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });
}

export function scrubScale(target, trigger) {
  gsap.fromTo(
    target,
    { scale: 1.15 },
    {
      scale: 1,
      ease: 'none',
      scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: 1 },
    }
  );
}
