import { useRef } from 'react';
import { HERO } from '@/data/landingContent.js';
import { formatPrice } from '@/lib/formatPrice.js';
import { mainImage } from '@/lib/productImages.js';
import { useLandingHeroMotion } from '@/hooks/useLandingHeroMotion.js';
import ProductPhoto from './ProductPhoto.jsx';
import './styles/LandingHero.css';

const BRAND = 'Tessera';

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
  // The first active product with a photo, so hiding a product never leaves the hero empty.
  const heroProduct = products.find(mainImage);

  useLandingHeroMotion(rootRef);

  return (
    <section id="hero" className="landing-hero" aria-labelledby="landing-hero-title" ref={rootRef}>
      <div className="landing-hero__stage">
        <p className="landing-hero__wordmark" data-hero-wordmark role="img" aria-label={BRAND}>
          <span className="landing-hero__wordmark-text">
            {BRAND.toUpperCase()
              .split('')
              .map((letter, index) => (
                <span
                  key={index}
                  className="landing-hero__letter"
                  data-hero-letter
                  aria-hidden="true"
                >
                  {letter}
                </span>
              ))}
            <span className="landing-hero__dot" aria-hidden="true" />
          </span>
        </p>

        <div className="landing-hero__disc" data-hero-disc aria-hidden="true" />

        <div className="landing-hero__photo-wrap" data-hero-photo aria-hidden="true">
          <div className="landing-hero__glow" />
          <ProductPhoto product={heroProduct} name="" className="landing-hero__photo" />
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
          {`${products.length} stones · Hand-faceted`}
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
