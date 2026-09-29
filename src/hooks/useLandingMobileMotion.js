import { useLayoutEffect } from 'react';
import { gsap, MOTION_OK, MOBILE } from '@/lib/motion.js';

const START = 'top 85%';

// Phone-only scroll motion for the homepage, driven by data attributes so the
// section components only mark up what moves:
// - [data-m-rise] fades up; inside a [data-m-group] the group's rises play
//   together, staggered in DOM order, triggered by the group.
// - [data-m-line] draws a hairline: scrubbed scaleY by default, or a one-shot
//   scaleX with data-m-line="x".
// - [data-m-words] raises its direct child spans one by one.
// - [data-m-slide] slides in from the right, staggered across siblings and
//   triggered by their shared parent.
// Re-runs once `ready` flips true (the product-gated sections are in the DOM)
// and reverts on unmount; reduced-motion and desktop visitors get none of it.
export function useLandingMobileMotion(rootRef, ready) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      `${MOTION_OK} and ${MOBILE}`,
      () => {
        const rise = { y: 32, opacity: 0, duration: 0.9, ease: 'power3.out' };
        const groups = new Map();
        gsap.utils.toArray('[data-m-rise]').forEach((el) => {
          const group = el.closest('[data-m-group]');
          if (!group) {
            gsap.from(el, { ...rise, scrollTrigger: { trigger: el, start: START } });
            return;
          }
          groups.set(group, [...(groups.get(group) ?? []), el]);
        });
        groups.forEach((els, group) => {
          gsap.from(els, {
            ...rise,
            stagger: 0.12,
            scrollTrigger: { trigger: group, start: START },
          });
        });

        gsap.utils.toArray('[data-m-line]').forEach((line) => {
          if (line.dataset.mLine === 'x') {
            gsap.set(line, { transformOrigin: 'left center' });
            gsap.from(line, {
              scaleX: 0,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: { trigger: line, start: 'top 90%' },
            });
            return;
          }
          gsap.set(line, { transformOrigin: 'center top' });
          gsap.from(line, {
            scaleY: 0,
            ease: 'none',
            scrollTrigger: { trigger: line, start: START, end: 'bottom 55%', scrub: 0.5 },
          });
        });

        gsap.utils.toArray('[data-m-words]').forEach((el) => {
          const words = el.querySelectorAll(':scope > span');
          // Transforms don't apply to inline boxes.
          gsap.set(words, { display: 'inline-block' });
          gsap.from(words, {
            yPercent: 100,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.06,
            scrollTrigger: { trigger: el, start: START },
          });
        });

        const slideParents = new Set(
          gsap.utils.toArray('[data-m-slide]').map((el) => el.parentElement)
        );
        slideParents.forEach((parent) => {
          gsap.from(parent.querySelectorAll(':scope > [data-m-slide]'), {
            x: 60,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: { trigger: parent, start: START },
          });
        });
      },
      rootRef.current
    );

    return () => mm.revert();
  }, [rootRef, ready]);
}
