import { useRef } from 'react';
import { HERO } from '@/data/labContent.js';
import { formatPrice } from '@/lib/formatPrice.js';
import { useLabHeroMotion } from '@/hooks/useLabHeroMotion.js';
import ProductPhoto from './ProductPhoto.jsx';
import './styles/LabHero.css';

// Pinned hero (see docs/plans/lab-landing.md, section map row 0). Always
// renders its full end state in the DOM — copy, stats and photo all visible —
// so tests, mobile and reduced-motion visitors see everything without motion.
// On desktop with motion allowed, useLabHeroMotion adds `lab-hero--staged`
// (which makes every child of .lab-hero__stage absolutely positioned inside
// one pinned 100vh box, matching the reference's single pinned composition)
// and scrubs the disc from its collapsed start state over that stage.
export default function LabHero({ products }) {
  const rootRef = useRef(null);
  const minPriceCents = Math.min(...products.map((product) => product.priceCents));

  useLabHeroMotion(rootRef);

  return (
    <section id="hero" className="lab-hero" aria-labelledby="lab-hero-title" ref={rootRef}>
      <div className="lab-hero__stage">
        <p className="lab-hero__wordmark" data-hero-wordmark aria-hidden="true">
          <span className="lab-hero__wordmark-text">
            {'FACETED'}
            <span className="lab-hero__dot" />
          </span>
        </p>

        <div className="lab-hero__disc" data-hero-disc aria-hidden="true" />

        <div className="lab-hero__photo-wrap" data-hero-photo aria-hidden="true">
          <div className="lab-hero__glow" />
          <ProductPhoto slug="sunlit-amber" name="" className="lab-hero__photo" />
        </div>

        <p className="lab-hero__line lab-hero__line--left" data-hero-line aria-hidden="true">
          {HERO.lineLeft}
        </p>
        <p className="lab-hero__line lab-hero__line--right" data-hero-line aria-hidden="true">
          {HERO.lineRight}
        </p>

        <div className="lab-hero__copy" data-hero-copy>
          <p className="lab-eyebrow">{HERO.eyebrow}</p>
          <h1 id="lab-hero-title" className="lab-hero__title">
            {HERO.title}
          </h1>
          <div className="lab-hero__rule" aria-hidden="true" />
          <p className="lab-hero__lede">{HERO.lede}</p>
          <p className="lab-hero__stats">
            <span>{`${products.length} stones`}</span>
            <span aria-hidden="true"> · </span>
            <span>{`from ${formatPrice(minPriceCents)}`}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
