import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api.js';
import LabHeader from '@/components/LabHeader.jsx';
import LabHero from '@/components/LabHero.jsx';
import LabStones from '@/components/LabStones.jsx';
import LabCraft from '@/components/LabCraft.jsx';
import LabStory from '@/components/LabStory.jsx';
import LabQuotes from '@/components/LabQuotes.jsx';
import LabOrder from '@/components/LabOrder.jsx';
import LabFooter from '@/components/LabFooter.jsx';
import { useLabRevealMotion } from '@/hooks/useLabRevealMotion.js';
import './styles/LabLandingPage.css';

// /lab: a dark, GSAP-animated rebuild of drinkstill.nz's layout, filled with
// our own three bracelets. Fetches the catalogue itself (same page-level
// pattern as LandingPage; the ProductsContext clean-up is out of scope).
export default function LabLandingPage() {
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
  useLabRevealMotion(rootRef, ready);

  return (
    <div className="lab" ref={rootRef}>
      <LabHeader />

      {loadFailed && (
        <p className="lab-status" role="alert">
          The collection couldn't be loaded right now. Please try again in a moment.
        </p>
      )}
      {!products && !loadFailed && <p className="lab-status">Loading the collection…</p>}
      {products && products.length === 0 && (
        <p className="lab-status">No stones are available right now.</p>
      )}

      {ready && (
        <>
          <LabHero products={products} />
          <LabStones products={products} />
        </>
      )}

      <LabCraft />

      {ready && <LabStory product={products[0]} />}

      <LabQuotes />

      {ready && <LabOrder products={products} />}

      <LabFooter />
    </div>
  );
}
