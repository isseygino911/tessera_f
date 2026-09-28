import { useRef } from 'react';
import { HERO } from '@/data/landingContent.js';
import { formatPrice } from '@/lib/formatPrice.js';
import { useLandingHeroMotion } from '@/hooks/useLandingHeroMotion.js';
import ProductPhoto from './ProductPhoto.jsx';
import './styles/LandingHero.css';

// Pinned hero (see docs/plans/lab-landing.md, section map row 0). Always
// renders its full end state in the DOM — copy, stats and photo all visible —
// so tests, mobile and reduced-motion visitors see everything without motion.
// On desktop with motion allowed, useLandingHeroMotion adds `landing-hero--staged`
// (which makes every child of .landing-hero__stage absolutely positioned inside
// one pinned 100vh box, matching the reference's single pinned composition)
// and scrubs the disc from its collapsed start state over that stage.
export default function LandingHero({ products }) {
  const rootRef = useRef(null);
  const minPriceCents = Math.min(...products.map((product) => product.priceCents));

  useLandingHeroMotion(rootRef);

  return (
    <section id="hero" className="landing-hero" aria-labelledby="landing-hero-title" ref={rootRef}>
      <div className="landing-hero__stage">
        <p className="landing-hero__wordmark" data-hero-wordmark aria-hidden="true">
          <span className="landing-hero__wordmark-text">
            {'FACETED'}
            <span className="landing-hero__dot" />
          </span>
        </p>

        <div className="landing-hero__disc" data-hero-disc aria-hidden="true" />

        <div className="landing-hero__photo-wrap" data-hero-photo aria-hidden="true">
          <div className="landing-hero__glow" />
          <ProductPhoto slug="sunlit-amber" name="" className="landing-hero__photo" />
        </div>

        <p
          className="landing-hero__line landing-hero__line--left"
          data-hero-line
          aria-hidden="true"
        >
          {HERO.lineLeft}
        </p>
        <p
          className="landing-hero__line landing-hero__line--right"
          data-hero-line
          aria-hidden="true"
        >
          {HERO.lineRight}
        </p>

        <div className="landing-hero__copy" data-hero-copy>
          <p className="eyebrow">{HERO.eyebrow}</p>
          <h1 id="landing-hero-title" className="landing-hero__title">
            {HERO.title}
          </h1>
          <div className="landing-hero__rule" aria-hidden="true" />
          <p className="landing-hero__lede">{HERO.lede}</p>
          <p className="landing-hero__stats">
            <span>{`${products.length} stones`}</span>
            <span aria-hidden="true"> · </span>
            <span>{`from ${formatPrice(minPriceCents)}`}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
