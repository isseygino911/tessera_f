import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import Orbit from '../../components/Orbit.jsx';
import Ornament from '../../components/Ornament.jsx';
import ProductCard from '../../components/ProductCard.jsx';
import ProductPhoto from '../../components/ProductPhoto.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import { useLandingMotion } from './useLandingMotion.js';
import './landing.css';

// Editorial sections feature specific bracelets; their photos are static
// files, so these render immediately without waiting for the API.
const HERO = [
  { slug: 'forest-emerald', name: 'Forest Emerald', side: 'left' },
  { slug: 'sunlit-amber', name: 'Sunlit Amber' },
  { slug: 'ocean-topaz', name: 'Ocean Topaz', side: 'right' },
];

const STEPS = [
  {
    title: 'Hand-faceted',
    text: 'Every bead is cut by hand into dozens of small planes, so it throws light back at you instead of simply holding it.',
  },
  {
    title: 'Matched by eye',
    text: 'Beads are sorted and matched one at a time, so each strand keeps a single, even colour from end to end.',
  },
  {
    title: 'Made to wear daily',
    text: 'Strung on a strong stretch cord that slips over the hand — no clasp to fumble, nothing to catch on a sleeve.',
  },
];

function SectionTitle({ id, eyebrow, children, align = 'center' }) {
  return (
    <header className={`section-title section-title--${align}`} data-reveal>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id}>{children}</h2>
      <Ornament />
    </header>
  );
}

export default function LandingPage() {
  const rootRef = useRef(null);
  const [products, setProducts] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);

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

  return (
    <div className="lux landing" ref={rootRef}>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__copy">
          <p className="eyebrow" data-hero-fade>
            Faceted &amp; Co.
          </p>
          <h1 id="hero-title" className="hero__title">
            <span className="hero__line">
              <span data-hero-line>Light,</span>
            </span>
            <span className="hero__line">
              <span data-hero-line>carried.</span>
            </span>
          </h1>
          <Ornament data-hero-ornament />
          <p className="hero__lede" data-hero-fade>
            Three bracelets of hand-faceted stone — amber, emerald and topaz — each cut to hold the
            light, and each with a story of its own.
          </p>
          <a href="#collection" className="btn-outline" data-hero-fade>
            Discover the collection
          </a>
        </div>

        <div className="hero__stage" aria-hidden="true">
          {HERO.map(({ slug, name, side }) => (
            <div
              key={slug}
              className={`hero__piece ${side ? `hero__piece--side hero__piece--${side}` : 'hero__piece--center'}`}
              {...(side ? { 'data-hero-side': side } : { 'data-hero-center': '' })}
            >
              <ProductPhoto slug={slug} name={name} className="blend" />
            </div>
          ))}
        </div>
      </section>

      <section className="split" aria-labelledby="story-title">
        <div className="split__copy">
          <SectionTitle id="story-title" eyebrow="About us" align="start">
            Cut to catch the light
          </SectionTitle>
          <div data-reveal>
            <p>
              Every bead begins as a rough stone no bigger than a fingertip. We facet each one by
              hand, plane after plane, until it catches light from every angle rather than only the
              one it happens to face.
            </p>
            <p>
              We make three bracelets, and only three: amber that holds the last of the afternoon
              sun, emerald that deepens like a forest after rain, and topaz that clears like shallow
              water over sand.
            </p>
            <a href="#collection" className="btn-outline btn-outline--sm">
              Read their stories
            </a>
          </div>
        </div>
        <div className="split__media macro" data-reveal>
          <ProductPhoto
            slug="forest-emerald"
            name="Close-up of faceted emerald-green beads"
            className="macro__img macro__img--emerald"
            data-parallax
          />
        </div>
      </section>

      <section className="craft" aria-labelledby="craft-title">
        <SectionTitle id="craft-title" eyebrow="Our craft">
          Made one bead at a time
        </SectionTitle>
        <div className="craft__showcase" data-reveal>
          <Orbit data-orbit />
          <ProductPhoto slug="ocean-topaz" name="Ocean Topaz bracelet" className="blend craft__piece" />
        </div>
        <ol className="craft__steps" data-steps>
          {STEPS.map((step, i) => (
            <li key={step.title} className="craft__step" data-step>
              <span className="craft__num">{String(i + 1).padStart(2, '0')}.</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="banner" aria-labelledby="banner-title" data-banner>
        <div className="banner__media" aria-hidden="true">
          <ProductPhoto slug="sunlit-amber" name="" className="banner__img" data-banner-img />
        </div>
        <div className="banner__copy" data-reveal>
          <h2 id="banner-title" className="banner__title">
            Introducing Sunlit Amber
          </h2>
          <p className="banner__sub">Warmth you can carry</p>
          <Link to="/products/sunlit-amber" className="banner__play" aria-label="Discover Sunlit Amber">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 7l8 5-8 5z" />
            </svg>
          </Link>
        </div>
      </section>

      <section className="split split--reverse" aria-labelledby="values-title">
        <div className="split__copy">
          <SectionTitle id="values-title" eyebrow="Why it lasts" align="start">
            For those who notice the light
          </SectionTitle>
          <p data-reveal>
            A bracelet you reach for without thinking — on a hard morning, on an ordinary Tuesday —
            that still catches your eye at four in the afternoon.
          </p>
          <ul className="features" data-reveal>
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8" />
                <circle cx="12" cy="12" r="4" />
              </svg>
              <h3>Stretch-fit cord</h3>
              <p>Slips on and off in a second, and sits close without pinching.</p>
            </li>
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 6h16v12H4z" />
                <path d="M4 7l8 6 8-6" />
              </svg>
              <h3>Personal ordering</h3>
              <p>Send an order request and we'll contact you ourselves to arrange payment and delivery.</p>
            </li>
          </ul>
        </div>
        <div className="split__media split__media--float" data-reveal>
          <ProductPhoto slug="sunlit-amber" name="Sunlit Amber bracelet" className="blend" data-parallax />
        </div>
      </section>

      <section id="collection" className="collection" aria-labelledby="collection-title">
        <SectionTitle id="collection-title" eyebrow="Three stones">
          The Collection
        </SectionTitle>

        {loadFailed && (
          <p className="collection__status" role="alert">
            The collection couldn't be loaded right now. Please try again in a moment.
          </p>
        )}
        {!products && !loadFailed && <p className="collection__status">Loading the collection…</p>}

        {products && (
          <ul className="collection__grid" data-cards>
            {products.map((p) => (
              <li key={p.id} data-card>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
