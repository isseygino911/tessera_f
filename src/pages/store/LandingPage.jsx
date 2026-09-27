import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api.js';
import ProductCard from '@/components/ProductCard.jsx';
import ProductPhoto from '@/components/ProductPhoto.jsx';
import SiteFooter from '@/components/SiteFooter.jsx';
import TrustStrip from '@/components/TrustStrip.jsx';
import { photoAlt, photoUrl } from '@/data/photoManifest.js';
import { useLandingMotion } from '@/hooks/useLandingMotion.js';
import './LandingPage.css';

const STONES = [
  { slug: 'forest-emerald', scene: 'commute', name: 'Forest Emerald' },
  { slug: 'ocean-topaz', scene: 'cafe', name: 'Ocean Topaz' },
  { slug: 'sunlit-amber', scene: 'camera', name: 'Sunlit Amber' },
];

const pad = (n) => String(n).padStart(2, '0');

export default function LandingPage() {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const [products, setProducts] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [canScroll, setCanScroll] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .getProducts()
      .then((list) => !cancelled && setProducts(list))
      .catch(() => !cancelled && setLoadFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  useLandingMotion(rootRef, Boolean(products?.length));

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !products?.length) return undefined;

    const update = () => {
      const scrollable = track.scrollWidth - track.clientWidth > 1;
      setCanScroll(scrollable);
      if (!scrollable) {
        setIndex(0);
        return;
      }
      const itemWidth = track.firstElementChild?.getBoundingClientRect().width || track.clientWidth;
      setIndex(Math.min(products.length - 1, Math.round(track.scrollLeft / itemWidth)));
    };

    update();
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      track.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [products]);

  const slide = (dir) => {
    const track = trackRef.current;
    track.scrollBy({ left: (dir * track.clientWidth) / 3, behavior: 'smooth' });
  };

  return (
    <div className="landing" ref={rootRef}>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__media" aria-hidden="true" data-hero-photo>
          <ProductPhoto slug="sunlit-amber" name="" className="hero__img" />
        </div>

        <div className="hero__copy">
          <p className="eyebrow" data-hero-fade>
            Three stones · Hand-faceted
          </p>
          <h1 id="hero-title" className="hero__title">
            <span className="hero__line">
              <span data-hero-line>Hand-faceted crystal, cut to hold the light.</span>
            </span>
          </h1>
          <p className="hero__lede" data-hero-fade>
            Three bracelets, hand-faceted bead by bead until each one catches light from every
            angle.
          </p>
          <a href="#collection" className="btn-outline btn-outline--sm" data-hero-fade>
            Shop the collection
          </a>
        </div>

        <div className="hero__card" data-hero-card>
          <p className="mono-label">Featured</p>
          <h2>Sunlit Amber</h2>
          <p className="hero__card-sub">Warmth you can carry</p>
          <Link
            to="/products/sunlit-amber"
            className="hero__card-link"
            aria-label="Discover Sunlit Amber"
          >
            <span>Discover</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </section>

      <section id="collection" className="collection" aria-labelledby="collection-title">
        <div className="rail-head">
          <h2 id="collection-title">The Collection</h2>
          {products && canScroll && (
            <p className="rail-head__counter" aria-live="polite">
              {pad(index + 1)} / {pad(products.length)}
            </p>
          )}
          {products && !canScroll && <p className="rail-head__counter">{products.length} pieces</p>}
          {products && canScroll && (
            <div className="rail-head__nav">
              <button
                type="button"
                className="rail-arrow"
                onClick={() => slide(-1)}
                aria-label="Previous"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                className="rail-arrow"
                onClick={() => slide(1)}
                aria-label="Next"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {loadFailed && (
          <p className="collection__status" role="alert">
            The collection couldn't be loaded right now. Please try again in a moment.
          </p>
        )}
        {!products && !loadFailed && <p className="collection__status">Loading the collection…</p>}

        {products && (
          <ul className="carousel__track" ref={trackRef} data-cards>
            {products.map((p) => (
              <li key={p.id} data-card>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="stones-grid" aria-labelledby="stones-title">
        <div className="rail-head">
          <h2 id="stones-title">Shop by stone</h2>
          <p className="rail-head__counter">3 stones</p>
        </div>
        <ul className="stones-grid__list">
          {STONES.map(({ slug, scene, name }) => (
            <li key={slug} data-reveal>
              <Link to={`/products/${slug}`} className="stone-block">
                <img
                  src={photoUrl(slug, 'lifestyle', scene)}
                  alt={photoAlt(slug, 'lifestyle', scene)}
                />
                <span className="stone-block__scrim" aria-hidden="true" />
                <span className="stone-block__label">
                  <span className="mono-label">Shop</span>
                  <span className="stone-block__name">
                    {name}
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <TrustStrip />

      {products && (
        <section id="stories" className="stories" aria-labelledby="stories-title">
          <div className="rail-head">
            <h2 id="stories-title">Their Stories</h2>
            <p className="rail-head__counter">{products.length} stories</p>
          </div>
          <ul className="stories__grid" data-stories>
            {products.map((p, i) => (
              <li key={p.id} data-story>
                <Link to={`/products/${p.slug}`} className="story-card">
                  <ProductPhoto slug={p.slug} name="" className="story-card__img" />
                  <div className="story-card__body">
                    <span className="story-card__index">
                      <strong>{String(i + 1).padStart(2, '0')}</strong>
                      Story
                    </span>
                    <div>
                      <h3>{p.name}</h3>
                      <p>{p.story}</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
