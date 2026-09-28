import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import { useCart } from '@/context/CartContext.jsx';
import ProductCard from '@/components/ProductCard.jsx';
import ProductPhoto from '@/components/ProductPhoto.jsx';
import QtyStepper from '@/components/QtyStepper.jsx';
import TrustStrip from '@/components/TrustStrip.jsx';
import { formatPrice } from '@/lib/formatPrice.js';
import { photoAlt, photoUrl } from '@/data/photoManifest.js';
import { SPEC_GROUPS } from '@/data/productFacts.js';
import { useProductMotion } from '@/hooks/useProductMotion.js';
import './styles/ProductPage.css';

function stockMessage(stock) {
  if (stock <= 0) return { text: 'Sold out', tone: 'out' };
  if (stock <= 5) return { text: `Only ${stock} left`, tone: 'low' };
  return { text: `${stock} in stock`, tone: null };
}

const pad = (n) => String(n).padStart(2, '0');

// Product-page gallery: slot 1 is the studio product shot (dark-background
// scenes are shown without background; dish.jpg sits on a light dish, so it
// shows plain like the lifestyle slots instead). Slots 2-3 are daylight
// lifestyle shots, always shown plain. Story banner reuses one lifestyle
// photo per stone, tuned per-photo below.
const GALLERY = {
  'forest-emerald': {
    slots: [
      { scene: 'slate', group: 'product', noBg: true },
      { scene: 'laptop', group: 'lifestyle' },
      { scene: 'sketch', group: 'lifestyle' },
    ],
    banner: { scene: 'woodslice', group: 'product', objectPosition: '55% 40%' },
  },
  'ocean-topaz': {
    slots: [
      { scene: 'reflection', group: 'product', noBg: true },
      { scene: 'bench', group: 'lifestyle' },
      { scene: 'dinner', group: 'lifestyle' },
    ],
    banner: { scene: 'coffee', group: 'product', objectPosition: '50% 45%' },
  },
  'sunlit-amber': {
    slots: [
      { scene: 'dish', group: 'product' },
      { scene: 'phone', group: 'lifestyle' },
      { scene: 'railing', group: 'lifestyle', native: true },
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
  const [prevProductId, setPrevProductId] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    api
      .getProducts()
      .then((data) => !cancelled && setProducts(data))
      .catch(
        (err) =>
          !cancelled && setError(err instanceof ApiError ? err.message : 'Could not load products.')
      );
    return () => {
      cancelled = true;
    };
  }, []);

  const index = products ? products.findIndex((p) => p.slug === slug) : -1;
  const product = index >= 0 ? products[index] : null;

  if (product?.id !== prevProductId) {
    setPrevProductId(product?.id);
    setQty(1);
    setAdded(false);
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product?.id]);

  useProductMotion(rootRef, product?.slug, setBarVisible);

  if (error || !products || !product) {
    let message = 'Loading…';
    if (error) message = error;
    else if (products) message = "We couldn't find that product.";
    return (
      <div className="pd-status">
        <p
          className={error || products ? 'form-banner' : undefined}
          role={error || products ? 'alert' : undefined}
        >
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
      <p key={offset + i} className={offset + i === 0 ? 'pd-story__lead' : undefined} data-reveal>
        {text}
      </p>
    ));

  const gallery = GALLERY[product.slug];

  return (
    <div className="pd" ref={rootRef} style={{ '--stone': product.hex }}>
      <section className="pd-hero" aria-labelledby="pd-title">
        <div className="pd-hero__info">
          <p className="eyebrow" data-pd-fade>
            {`The Collection · ${pad(index + 1)} / ${pad(products.length)}`}
          </p>
          <p className="pd-hero__code" data-pd-fade>{`No.${pad(index + 1)}`}</p>
          <h1 id="pd-title" className="pd-hero__title">
            <span className="pd-hero__line">
              <span data-pd-line>
                {product.name}
                <span className="pd-hero__dot" aria-hidden="true" />
              </span>
            </span>
          </h1>
          <p className="pd-hero__tagline" data-pd-fade>
            {product.tagline}
          </p>

          <div className="pd-buy" data-purchase data-pd-fade>
            <div className="pd-buy__total">
              <span className="pd-buy__price">{formatPrice(product.priceCents)}</span>
              <span className={`pd-buy__stock${stock.tone ? ` pd-buy__stock--${stock.tone}` : ''}`}>
                {stock.text}
              </span>
            </div>
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
        </div>

        <div className="pd-hero__media" data-pd-photo>
          <div className="pd-hero__glow" aria-hidden="true" />
          <ProductPhoto slug={product.slug} name={product.name} className="pd-hero__photo blend" />
          <div className="pd-hero__ring" aria-hidden="true" />
        </div>
      </section>

      <nav className="pd-stones" aria-label="Stones">
        <div className="site-container pd-stones__inner">
          {products.map((p, i) => (
            <Link
              key={p.id}
              to={`/products/${p.slug}`}
              className={`pd-stones__link${p.id === product.id ? ' pd-stones__link--active' : ''}`}
              aria-current={p.id === product.id ? 'page' : undefined}
            >
              {pad(i + 1)}
            </Link>
          ))}
        </div>
      </nav>

      <TrustStrip />

      {gallery && (
        <ul className="pd-gallery">
          {gallery.slots.map((slot) => (
            <li
              key={slot.scene}
              className={`pd-gallery__item${slot.native ? ' pd-gallery__item--native' : ''}`}
            >
              <img
                src={photoUrl(product.slug, slot.group, slot.scene)}
                alt={photoAlt(product.slug, slot.group, slot.scene)}
                className={slot.noBg ? 'pd-gallery__photo-nobg blend' : undefined}
              />
            </li>
          ))}
        </ul>
      )}

      <section className="pd-specs" aria-labelledby="specs-title">
        <p className="eyebrow" id="specs-title">
          Specifications
        </p>
        <div className="pd-specs__grid">
          {SPEC_GROUPS.map((group) => (
            <div key={group.title} className="pd-specs__group">
              <h3 className="pd-specs__group-title">{group.title}</h3>
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

      <article className="pd-story" aria-labelledby="story-title">
        <header className="pd-story__head" data-reveal>
          <p className="eyebrow">In the maker&apos;s words</p>
          <h2 id="story-title" className="pd-story__title">
            The story of {product.name}
          </h2>
        </header>
        <div className="pd-story__body">{renderParagraphs(paragraphs.slice(0, half), 0)}</div>

        {paragraphs.length > 1 && gallery && (
          <div className="pd-story__banner" data-banner aria-hidden="true">
            <img
              src={photoUrl(product.slug, gallery.banner.group, gallery.banner.scene)}
              className="pd-story__banner-img"
              data-banner-img
              style={{ objectPosition: gallery.banner.objectPosition }}
              alt=""
            />
          </div>
        )}

        <div className="pd-story__body">{renderParagraphs(paragraphs.slice(half), half)}</div>
      </article>

      {others.length > 0 && (
        <section className="pd-more" aria-labelledby="more-title">
          <header className="pd-more__head" data-reveal>
            <p className="eyebrow">Keep exploring</p>
            <h2 id="more-title" className="pd-more__title">
              Also in the collection
            </h2>
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

      <div className={`buy-bar${barVisible ? ' is-visible' : ''}`} inert={!barVisible}>
        <div className="buy-bar__inner">
          <ProductPhoto slug={product.slug} name="" className="buy-bar__thumb blend" />
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
