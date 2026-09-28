import { useLayoutEffect } from 'react';
import { gsap, ScrollTrigger, MOTION_OK } from '@/lib/motion.js';

const DESKTOP = '(min-width: 768px)';
const STAGED_CLASS = 'landing-hero--staged';

// Pins the hero for the full viewport height plus 120% of scroll and scrubs
// the opaque disc from its collapsed start (small, bottom-centre, half
// off-screen, per still/d-00.png) to covering the viewport — occluding the
// wordmark as it grows. The photo-wrap starts co-located with the disc (same
// anchor + size in CSS, so the photo reads as already inside it), then tweens
// its own layout box (left/top/width/height, not a transform) to its settled
// size (min(56vh, 500px)) centred in the stage (still/d-01.jpeg) — computed
// purely from measured boxes, independent of the disc's own scale tween, and
// immune to any transform/scale-origin decomposition since no transform is
// involved. Slides the copy in and fades the wordmark/lines out only in the
// timeline's last stretch (per still/d-01.jpeg, which has neither). The
// timeline's total duration is exactly 1 so scrub progress (0–1) lines up
// directly with each tween's start/duration below. Keeps `site-header--hidden`
// on [data-site-header] for the whole pin, and always removes it again on
// unmount (even under reduced motion or on mobile, where this is a no-op) so
// navigating away from the homepage never leaves the header hidden.
export function useLandingHeroMotion(rootRef) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const header = document.querySelector('[data-site-header]');
    const mm = gsap.matchMedia();

    mm.add(
      `${MOTION_OK} and ${DESKTOP}`,
      () => {
        root.classList.add(STAGED_CLASS);

        const disc = root.querySelector('[data-hero-disc]');
        const wordmark = root.querySelector('[data-hero-wordmark]');
        const photo = root.querySelector('[data-hero-photo]');
        const lines = root.querySelectorAll('[data-hero-line]');
        const copy = root.querySelector('[data-hero-copy]');

        // Animate the photo-wrap's actual layout box (width/height/left/top),
        // not a transform, so its centre position is exactly what CSS layout
        // says it is at every point of the scrub — no transform decomposition
        // or scale/transform-origin math to get wrong. Measure the stage
        // (root, whose top-left is the (0,0) origin every `left`/`top` below
        // is relative to) and the photo's own start box, then compute the end
        // box directly: settled width/height, centred at 58%/50% of the
        // stage. This is independent of the disc's own `scale` tween.
        const stageRect = root.getBoundingClientRect();
        const startRect = photo.getBoundingClientRect();
        const startLeft = startRect.left - stageRect.left;
        const startTop = startRect.top - stageRect.top;
        const endWidth = Math.min(window.innerHeight * 0.56, 500);
        const endLeft = stageRect.width * 0.58 - endWidth / 2;
        const endTop = stageRect.height * 0.5 - endWidth / 2;

        gsap.set(photo, { left: startLeft, top: startTop, bottom: 'auto', right: 'auto' });
        gsap.set(copy, { x: -40, opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: '+=120%',
            scrub: 1,
            pin: true,
            onToggle: (self) => header?.classList.toggle('site-header--hidden', self.isActive),
            onLeave: () => header?.classList.remove('site-header--hidden'),
          },
        });

        tl.to(disc, { scale: 6, ease: 'none', duration: 0.8 }, 0)
          .to(
            photo,
            {
              left: endLeft,
              top: endTop,
              width: endWidth,
              height: endWidth,
              ease: 'none',
              duration: 0.8,
            },
            0
          )
          .to(copy, { x: 0, opacity: 1, ease: 'none', duration: 0.3 }, 0.5)
          .to([wordmark, ...lines], { opacity: 0, ease: 'none', duration: 0.15 }, 0.7);

        return () => {
          root.classList.remove(STAGED_CLASS);
          header?.classList.remove('site-header--hidden');
        };
      },
      root
    );

    ScrollTrigger.refresh();

    return () => {
      mm.revert();
      header?.classList.remove('site-header--hidden');
    };
  }, [rootRef]);
}
