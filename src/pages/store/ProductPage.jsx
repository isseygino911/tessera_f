import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError } from '../../api.js';
import { useCart } from '../../cart/CartContext.jsx';
import Ornament from '../../components/Ornament.jsx';
import ProductCard from '../../components/ProductCard.jsx';
import ProductPhoto from '../../components/ProductPhoto.jsx';
import QtyStepper from '../../components/QtyStepper.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import TrustStrip from '../../components/TrustStrip.jsx';
import { formatPrice } from '../../formatPrice.js';
import { photoAlt, photoUrl } from '../../photoManifest.js';
import { SPEC_GROUPS } from '../../productFacts.js';
import { useProductMotion } from './useProductMotion.js';
import './product.css';

function stockMessage(stock) {
  if (stock <= 0) return { text: 'Sold out', tone: 'out' };
  if (stock <= 5) return { text: `Only ${stock} left`, tone: 'low' };
  return { text: `${stock} in stock`, tone: null };
}

const pad = (n) => String(n).padStart(2, '0');

// Product-page gallery: slot 1 is the studio product shot (dark-background
// scenes keep .blend; dish.jpg sits on a light dish, so it gets .warm-frame
// like the lifestyle slots instead). Slots 2-3 are daylight lifestyle shots.
// Story banner reuses one lifestyle photo per stone, tuned per-photo below.
const GALLERY = {
  'forest-emerald': {
    slots: [
      { scene: 'slate', group: 'product', treatment: 'blend' },
      { scene: 'laptop', group: 'lifestyle', treatment: 'warm-frame' },
      { scene: 'sketch', group: 'lifestyle', treatment: 'warm-frame' },
    ],
    banner: { scene: 'woodslice', group: 'product', objectPosition: '55% 40%' },
  },
  'ocean-topaz': {
    slots: [
      { scene: 'reflection', group: 'product', treatment: 'blend' },
      { scene: 'bench', group: 'lifestyle', treatment: 'warm-frame' },
      { scene: 'dinner', group: 'lifestyle', treatment: 'warm-frame' },
    ],
    banner: { scene: 'coffee', group: 'product', objectPosition: '50% 45%' },
  },
  'sunlit-amber': {
    slots: [
      { scene: 'dish', group: 'product', treatment: 'warm-frame' },
      { scene: 'phone', group: 'lifestyle', treatment: 'warm-frame' },
      { scene: 'railing', group: 'lifestyle', treatment: 'warm-frame', native: true },
    ],
    banner: { scene: 'reading', group: 'product', objectPosition: '48% 62%' },
  },
};

export default function ProductPage() {
  const { slug } = useParams();
  const { add } = useCart();
  const rootRef = useRef(null);

  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [barVisible, setBarVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .getProducts()
      .then((data) => !cancelled && setProducts(data))
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : 'Could not load products.'));
    return () => {
      cancelled = true;
    };
  }, []);

  const index = products ? products.findIndex((p) => p.slug === slug) : -1;
  const product = index >= 0 ? products[index] : null;

  useEffect(() => {
    setQty(1);
    setAdded(false);
    window.scrollTo(0, 0);
  }, [product?.id]);

  useProductMotion(rootRef, product?.slug, setBarVisible);

  if (error || !products || !product) {
    let message = 'Loading…';
    if (error) message = error;
    else if (products) message = "We couldn't find that product.";
    return (
      <div className="pd-status">
        <p className={error || products ? 'form-banner' : undefined} role={error || products ? 'alert' : undefined}>
          {message}
        </p>
        {products && <Link to="/#collection">Back to the collection</Link>}
      </div>
    );
  }

  const stock = stockMessage(product.stock);
  const soldOut = product.stock <= 0;
  const paragraphs = product.story ? product.story.split(/\n\s*\n/) : [];
  const half = Math.ceil(paragraphs.length / 2);
  const others = products.filter((p) => p.id !== product.id);

  const addToCart = () => {
    add(product, qty);
    setAdded(true);
  };

  const renderParagraphs = (list, offset) =>
    list.map((text, i) => (
      <p key={offset + i} className={offset + i === 0 ? 'story__lead' : undefined} data-reveal>
        {text}
      </p>
    ));

  const gallery = GALLERY[product.slug];

  return (
    <div className="pd" ref={rootRef}>
      <section className="pd-hero" aria-labelledby="pd-title">
        <div className="pd-hero__media">
          <div className="pd-hero__photo" data-pd-photo>
            <ProductPhoto slug={product.slug} name={product.name} className="blend" />
          </div>
        </div>

        <div className="pd-hero__info">
          <p className="eyebrow" data-pd-fade>
            The Collection · {pad(index + 1)} / {pad(products.length)}
          </p>
          <h1 id="pd-title" className="pd-hero__title">
            <span className="pd-hero__line">
              <span data-pd-line>{product.name}</span>
            </span>
          </h1>
          <p className="pd-hero__tagline" data-pd-fade>
            {product.tagline}
          </p>
          <Ornament data-pd-ornament />

          <div className="pd-buy" data-purchase data-pd-fade>
            <p className="pd-buy__price">{formatPrice(product.priceCents)}</p>
            <p className={`pd-buy__stock${stock.tone ? ` pd-buy__stock--${stock.tone}` : ''}`}>{stock.text}</p>
            <div className="pd-buy__actions">
              <QtyStepper value={qty} max={product.stock} onChange={setQty} disabled={soldOut} />
              <button type="button" className="btn-gold" disabled={soldOut} onClick={addToCart}>
                {soldOut ? 'Sold out' : 'Add to cart'}
              </button>
            </div>
            {added && !soldOut && (
              <p className="pd-buy__added" role="status">
                Added to your cart — <Link to="/cart">View cart</Link>
              </p>
            )}
          </div>

          <nav className="stones" aria-label="Stones" data-pd-fade>
            {products.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.slug}`}
                className="stones__item"
                aria-current={p.id === product.id ? 'page' : undefined}
              >
                <ProductPhoto slug={p.slug} name="" className="blend" />
                <span>{p.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <TrustStrip />

      {gallery && (
        <ul className="pd-gallery">
          {gallery.slots.map((slot) => (
            <li
              key={slot.scene}
              className={`pd-gallery__item${slot.treatment === 'warm-frame' ? ' warm-frame' : ''}${
                slot.native ? ' pd-gallery__item--native' : ''
              }`}
            >
              <img
                src={photoUrl(product.slug, slot.group, slot.scene)}
                alt={photoAlt(product.slug, slot.group, slot.scene)}
                className={slot.treatment === 'blend' ? 'blend' : undefined}
              />
            </li>
          ))}
        </ul>
      )}

      <section className="pd-specs" aria-labelledby="specs-title">
        <h2 id="specs-title" className="mono-label">
          Specifications
        </h2>
        <div className="pd-specs__grid">
          {SPEC_GROUPS.map((group) => (
            <div key={group.title} className="pd-specs__group">
              <h3 className="mono-label">{group.title}</h3>
              <dl>
                {group.items.map((item) => (
                  <div key={item.term} className="pd-specs__row">
                    <dt>{item.term}</dt>
                    <dd>{item.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>

      <article className="story" aria-labelledby="story-title">
        <header className="section-title section-title--center" data-reveal>
          <p className="eyebrow">In the maker&apos;s words</p>
          <h2 id="story-title">The story of {product.name}</h2>
          <Ornament />
        </header>
        <div className="story__body">{renderParagraphs(paragraphs.slice(0, half), 0)}</div>

        {paragraphs.length > 1 && gallery && (
          <div className="story__banner" data-banner aria-hidden="true">
            <img
              src={photoUrl(product.slug, gallery.banner.group, gallery.banner.scene)}
              className="story__banner-img"
              data-banner-img
              style={{ objectPosition: gallery.banner.objectPosition }}
              alt=""
            />
          </div>
        )}

        <div className="story__body">{renderParagraphs(paragraphs.slice(half), half)}</div>
      </article>

      {others.length > 0 && (
        <section className="pd-more" aria-labelledby="more-title">
          <header className="section-title section-title--center" data-reveal>
            <p className="eyebrow">Keep exploring</p>
            <h2 id="more-title">Also in the collection</h2>
            <Ornament />
          </header>
          <ul className="pd-more__grid">
            {others.map((p) => (
              <li key={p.id} data-reveal>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <SiteFooter />

      <div className={`buy-bar${barVisible ? ' is-visible' : ''}`} inert={!barVisible}>
        <div className="buy-bar__inner">
          <ProductPhoto slug={product.slug} name="" className="blend buy-bar__thumb" />
          <span className="buy-bar__name">{product.name}</span>
          <span className="buy-bar__price">{formatPrice(product.priceCents)}</span>
          <button
            type="button"
            className="btn-gold btn-gold--sm"
            disabled={soldOut}
            onClick={addToCart}
            aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
          >
            {soldOut ? 'Sold out' : added ? 'Add another' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
