import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError } from '../../api.js';
import { useCart } from '../../cart/CartContext.jsx';
import Orbit from '../../components/Orbit.jsx';
import Ornament from '../../components/Ornament.jsx';
import ProductCard from '../../components/ProductCard.jsx';
import ProductPhoto from '../../components/ProductPhoto.jsx';
import QtyStepper from '../../components/QtyStepper.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import { formatPrice } from '../../formatPrice.js';
import { useProductMotion } from './useProductMotion.js';
import './product.css';

function stockMessage(stock) {
  if (stock <= 0) return { text: 'Sold out', tone: 'out' };
  if (stock <= 5) return { text: `Only ${stock} left`, tone: 'low' };
  return { text: `${stock} in stock`, tone: null };
}

const pad = (n) => String(n).padStart(2, '0');

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
      <div className="container pd-status">
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

  return (
    <div className="lux pd" ref={rootRef}>
      <section className="pd-hero" aria-labelledby="pd-title">
        <div className="pd-hero__media">
          <Orbit data-orbit />
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

      <article className="story" aria-labelledby="story-title">
        <header className="section-title section-title--center" data-reveal>
          <p className="eyebrow">In the maker&apos;s words</p>
          <h2 id="story-title">The story of {product.name}</h2>
          <Ornament />
        </header>
        <div className="story__body">{renderParagraphs(paragraphs.slice(0, half), 0)}</div>

        {paragraphs.length > 1 && (
          <div className="story__banner" data-banner aria-hidden="true">
            <ProductPhoto slug={product.slug} name="" className="story__banner-img" data-banner-img />
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
