import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api.js';
import { ScrollTrigger } from '@/lib/motion.js';
import LandingHero from '@/components/LandingHero.jsx';
import LandingStones from '@/components/LandingStones.jsx';
import LandingCraft from '@/components/LandingCraft.jsx';
import LandingStory from '@/components/LandingStory.jsx';
import LandingQuotes from '@/components/LandingQuotes.jsx';
import LandingOrder from '@/components/LandingOrder.jsx';
import { useLandingRevealMotion } from '@/hooks/useLandingRevealMotion.js';
import './styles/LandingPage.css';

// /: a dark, GSAP-animated rebuild of drinkstill.nz's layout, filled with our
// own three bracelets. Fetches the catalogue itself (the ProductsContext
// clean-up is out of scope). Header and footer are rendered once by
// StoreLayout, not here.
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

  const ready = Boolean(products?.length);
  useLandingRevealMotion(rootRef, ready);

  // Once the products have loaded (and the sections a hash like #order might
  // target are in the DOM), scroll to a deep link from another page — e.g.
  // /#order from the product page — after ScrollTrigger has recalculated
  // section positions for the pin-spacers the motion hooks just added.
  useEffect(() => {
    if (!ready || !window.location.hash) return;
    const id = window.location.hash.slice(1);
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      document.getElementById(id)?.scrollIntoView();
    });
  }, [ready]);

  return (
    <div className="landing" ref={rootRef}>
      {loadFailed && (
        <p className="landing-status" role="alert">
          The collection couldn't be loaded right now. Please try again in a moment.
        </p>
      )}
      {!products && !loadFailed && <p className="landing-status">Loading the collection…</p>}
      {products && products.length === 0 && (
        <p className="landing-status">No stones are available right now.</p>
      )}

      {ready && (
        <>
          <LandingHero products={products} />
          <LandingStones products={products} />
        </>
      )}

      <LandingCraft products={products} />

      {ready && <LandingStory product={products[0]} />}

      {ready && <LandingQuotes products={products} />}

      {ready && <LandingOrder products={products} />}
    </div>
  );
}
