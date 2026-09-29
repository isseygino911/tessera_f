import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SPEC_GROUPS } from '@/data/productFacts.js';
import { formatPrice } from '@/lib/formatPrice.js';
import { ScrollTrigger } from '@/lib/motion.js';
import { useLandingStonesMotion } from '@/hooks/useLandingStonesMotion.js';
import ProductPhoto from './ProductPhoto.jsx';
import './styles/LandingStones.css';

const HEADING = 'Shop by stone';

// Only the Stone + Fit spec rows show in the stage (Ordering is covered by
// LandingOrder further down the page).
const STAGE_SPEC_ROWS = SPEC_GROUPS.filter((group) => group.title !== 'Ordering').flatMap(
  (group) => group.items
);

// Pinned 3-step stones stage (section map row 2). Every product renders as an
// <article> in the DOM at all times so tests and non-motion visitors see all
// of it; useLandingStonesMotion (desktop + motion only) pins the whole section
// at exactly 100vh (header row + heading + two-column stage + index all fit in
// the viewport together) and drives `active` via onStep, and CSS crossfades
// the active article: its text lines slide in from the left in turn, the photo
// slides in from the right, and the section's ambient tint fades to the active
// stone's colour. Mobile and reduced-motion fall back to a horizontal
// scroll-snap row (see LandingStones.css).
export default function LandingStones({ products }) {
  const rootRef = useRef(null);
  const scrollRef = useRef(null);
  const [active, setActive] = useState(0);

  useLandingStonesMotion(rootRef, products.length, setActive);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActive(Math.max(0, Math.min(products.length - 1, index)));
  }

  function handleIndexClick(index) {
    setActive(index);

    const el = scrollRef.current;
    if (el && el.scrollWidth > el.clientWidth) {
      el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
      return;
    }

    const trigger = ScrollTrigger.getById('landing-stones-stage');
    if (trigger) {
      const target =
        trigger.start + (trigger.end - trigger.start) * (index / (products.length - 1));
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
  }

  return (
    <section
      id="stones"
      className="landing-stones"
      aria-labelledby="landing-stones-title"
      ref={rootRef}
      style={{ '--stone': products[active]?.hex }}
    >
      <div className="landing-stones__inner site-container">
        <div className="landing-stones__header">
          <p className="eyebrow">{'02 / Shop by stone'}</p>
          <p
            className="landing-stones__counter"
            aria-hidden="true"
          >{`${active + 1} / ${products.length}`}</p>
        </div>

        <h2 id="landing-stones-title" className="landing-stones__heading" aria-label={HEADING}>
          <span aria-hidden="true">
            {HEADING.split('').map((char, index) => (
              <span key={index} className="landing-stones__letter" data-stones-letter>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </span>
        </h2>

        <div className="landing-stones__stage">
          <div className="landing-stones__row" ref={scrollRef} onScroll={handleScroll}>
            {products.map((product, index) => (
              <StoneCard
                key={product.id}
                product={product}
                index={index}
                isActive={index === active}
              />
            ))}
          </div>
        </div>

        <div className="landing-stones__index">
          {products.map((product, index) => (
            <button
              key={product.id}
              type="button"
              className={`landing-stones__index-btn${index === active ? ' landing-stones__index-btn--active' : ''}`}
              aria-label={`Show ${product.name}`}
              onClick={() => handleIndexClick(index)}
            >
              {String(index + 1).padStart(2, '0')}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function stockStatus(stock) {
  if (stock === 0) return 'Sold out';
  if (stock <= 5) return `Only ${stock} left`;
  return 'In stock';
}

function StoneCard({ product, index, isActive }) {
  const paragraphs = product.story ? product.story.split(/\n\s*\n/) : [];
  const body = paragraphs[0] ?? '';

  return (
    <article
      className={`landing-stones__card${isActive ? ' landing-stones__card--active' : ''}`}
      style={{ '--stone': product.hex }}
    >
      <div className="landing-stones__info">
        <div className="landing-stones__meta">
          <p className="landing-stones__code">{`No.${String(index + 1).padStart(2, '0')}`}</p>
          <p className="eyebrow">{stockStatus(product.stock)}</p>
        </div>
        <h3 className="landing-stones__name">
          {product.name}
          <span className="landing-stones__dot" aria-hidden="true" />
        </h3>
        <p className="landing-stones__tagline">{product.tagline}</p>
        <p className="landing-stones__body">{body}</p>
        <div className="landing-stones__rule" aria-hidden="true" />
        <dl className="landing-stones__specs">
          {STAGE_SPEC_ROWS.map((row) => (
            <div key={row.term} className="landing-stones__spec-row">
              <dt>{row.term}</dt>
              <dd>{row.detail}</dd>
            </div>
          ))}
        </dl>
        <div className="landing-stones__total">
          <span>{'Price'}</span>
          <span>{formatPrice(product.priceCents)}</span>
        </div>
        <Link to={`/products/${product.slug}`} className="landing-stones__link">
          {`View ${product.name}`}
        </Link>
      </div>

      <div className="landing-stones__visual" aria-hidden="true">
        <span className="landing-stones__numeral">{String(index + 1).padStart(2, '0')}</span>
        <div className="landing-stones__photo-wrap">
          <div className="landing-stones__glow" />
          <ProductPhoto
            product={product}
            name={product.name}
            className="blend landing-stones__photo"
          />
          <div className="landing-stones__ring" />
        </div>
      </div>
    </article>
  );
}
