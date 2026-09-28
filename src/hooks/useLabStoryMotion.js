import { useLayoutEffect } from 'react';
import { gsap, MOTION_OK } from '@/lib/motion.js';

// Scrubs the Story section's vertical "scroll" line from 0 to full height as
// the section passes through view. Reverts on unmount.
export function useLabStoryMotion(rootRef, ready) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      MOTION_OK,
      () => {
        const line = rootRef.current?.querySelector('[data-story-line]');
        if (!line) return;

        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top 60%',
              end: 'bottom 40%',
              scrub: 0.5,
            },
          }
        );
      },
      rootRef.current
    );

    return () => mm.revert();
  }, [rootRef, ready]);
}
