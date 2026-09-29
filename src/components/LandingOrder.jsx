import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext.jsx';
import { HOW_IT_WORKS } from '@/data/landingContent.js';
import { formatPrice } from '@/lib/formatPrice.js';
import ProductPhoto from './ProductPhoto.jsx';
import './styles/LandingOrder.css';

// "06 / Ordering": the How-it-works columns, then bordered order cards wired
// to the real cart (no pack toggle — this store has none). On mobile the steps
// become a numbered timeline and the cards a swipe row; the timeline marks are
// hidden on desktop.
export default function LandingOrder({ products }) {
  const headingId = useId();
  const { add } = useCart();
  const [addedSlug, setAddedSlug] = useState(null);

  function handleAdd(product) {
    add(product, 1);
    setAddedSlug(product.slug);
  }

  return (
    <section className="landing-order" id="order" aria-labelledby={headingId}>
      <div className="site-container landing-order__inner">
        <p className="eyebrow">06 / Ordering</p>
        <h2 id={headingId} className="landing-order__title">
          Order direct from the studio.
        </h2>

        <div className="landing-order__how" data-m-group>
          <span className="landing-order__how-line" data-m-line aria-hidden="true" />
          {HOW_IT_WORKS.map((step, index) => (
            <div className="landing-order__how-col" key={step.title} data-m-rise>
              <span className="landing-order__how-num" aria-hidden="true">
                0{index + 1}
              </span>
              <h3 className="landing-order__how-title">{step.title}</h3>
              <p className="landing-order__how-text">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="landing-order__divider" role="presentation">
          <span className="landing-order__divider-line" />
          <span className="landing-order__divider-text">Order direct</span>
          <span className="landing-order__divider-line" />
        </div>

        <div className="landing-order__cards">
          {products.map((product, index) => {
            const soldOut = product.stock === 0;
            return (
              <article className="landing-order__card" key={product.slug} data-m-slide>
                <div className="landing-order__card-media">
                  <ProductPhoto
                    product={product}
                    name={product.name}
                    className="landing-order__card-photo"
                  />
                </div>

                <p className="landing-order__card-name">
                  <span className="landing-order__card-index">0{index + 1}</span>
                  <span className="landing-order__card-serif">{product.name}</span>
                </p>
                <p className="landing-order__card-tagline">{product.tagline}</p>
                <p className="landing-order__card-price">{formatPrice(product.priceCents)}</p>

                <button
                  type="button"
                  className="btn-gold"
                  disabled={soldOut}
                  onClick={() => handleAdd(product)}
                  aria-label={soldOut ? undefined : `Add ${product.name} to cart`}
                >
                  {soldOut ? 'Sold out' : 'Add to cart'}
                </button>

                {addedSlug === product.slug && !soldOut && (
                  <p className="landing-order__card-status" role="status">
                    Added to your cart.
                  </p>
                )}

                <Link to={`/products/${product.slug}`} className="landing-order__card-details">
                  Details
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
