import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SPEC_GROUPS } from '@/data/productFacts.js';
import { formatPrice } from '@/lib/formatPrice.js';
import { ScrollTrigger } from '@/lib/motion.js';
import { useLabStonesMotion } from '@/hooks/useLabStonesMotion.js';
import ProductPhoto from './ProductPhoto.jsx';
import './styles/LabStones.css';

const HEADING = 'Shop by stone';

// Only the Stone + Fit spec rows show in the stage (Ordering is covered by
// LabOrder further down the page).
const STAGE_SPEC_ROWS = SPEC_GROUPS.filter((group) => group.title !== 'Ordering').flatMap(
  (group) => group.items
);

// Pinned 3-step stones stage (section map row 2). Every product renders as an
// <article> in the DOM at all times so tests and non-motion visitors see all
// of it; useLabStonesMotion (desktop + motion only) pins the whole section at
// exactly 100vh (header row + heading + two-column stage + index all fit in
// the viewport together) and drives `active` via onStep, and CSS crossfades
// the active article. Mobile and reduced-motion fall back to a horizontal
// scroll-snap row (see LabStones.css).
export default function LabStones({ products }) {
  const rootRef = useRef(null);
  const scrollRef = useRef(null);
  const [active, setActive] = useState(0);

  useLabStonesMotion(rootRef, products.length, setActive);

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

    const trigger = ScrollTrigger.getById('lab-stones-stage');
    if (trigger) {
      const target =
        trigger.start + (trigger.end - trigger.start) * (index / (products.length - 1));
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
  }

  return (
    <section id="stones" className="lab-stones" aria-labelledby="lab-stones-title" ref={rootRef}>
      <div className="lab-stones__inner lab-container">
        <div className="lab-stones__header">
          <p className="lab-eyebrow">{'02 / Shop by stone'}</p>
          <p
            className="lab-stones__counter"
            aria-hidden="true"
          >{`${active + 1} / ${products.length}`}</p>
        </div>

        <h2 id="lab-stones-title" className="lab-stones__heading" aria-label={HEADING}>
          <span aria-hidden="true">
            {HEADING.split('').map((char, index) => (
              <span key={index} className="lab-stones__letter" data-stones-letter>
                {char === ' ' ? ' ' : char}
              </span>
            ))}
          </span>
        </h2>

        <div className="lab-stones__stage">
          <div className="lab-stones__row" ref={scrollRef} onScroll={handleScroll}>
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

        <div className="lab-stones__index">
          {products.map((product, index) => (
            <button
              key={product.id}
              type="button"
              className={`lab-stones__index-btn${index === active ? ' lab-stones__index-btn--active' : ''}`}
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
      className={`lab-stones__card${isActive ? ' lab-stones__card--active' : ''}`}
      style={{ '--stone': product.hex }}
    >
      <div className="lab-stones__info" data-stage-item>
        <div className="lab-stones__meta" data-stage-item>
          <p className="lab-stones__code">{`No.${String(index + 1).padStart(2, '0')}`}</p>
          <p className="lab-eyebrow">{stockStatus(product.stock)}</p>
        </div>
        <h3 className="lab-stones__name" data-stage-item>
          {product.name}
          <span className="lab-stones__dot" aria-hidden="true" />
        </h3>
        <p className="lab-stones__tagline" data-stage-item>
          {product.tagline}
        </p>
        <p className="lab-stones__body" data-stage-item>
          {body}
        </p>
        <div className="lab-stones__rule" aria-hidden="true" />
        <dl className="lab-stones__specs" data-stage-item>
          {STAGE_SPEC_ROWS.map((row) => (
            <div key={row.term} className="lab-stones__spec-row">
              <dt>{row.term}</dt>
              <dd>{row.detail}</dd>
            </div>
          ))}
        </dl>
        <div className="lab-stones__total" data-stage-item>
          <span>{'Price'}</span>
          <span>{formatPrice(product.priceCents)}</span>
        </div>
        <Link to={`/products/${product.slug}`} className="lab-stones__link" data-stage-item>
          {`View ${product.name}`}
        </Link>
      </div>

      <div className="lab-stones__visual" aria-hidden="true">
        <span className="lab-stones__numeral">{String(index + 1).padStart(2, '0')}</span>
        <div className="lab-stones__photo-wrap">
          <div className="lab-stones__glow" />
          <ProductPhoto slug={product.slug} name={product.name} className="lab-stones__photo" />
          <div className="lab-stones__ring" />
        </div>
      </div>
    </article>
  );
}
