import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext.jsx';
import { HOW_IT_WORKS } from '@/data/labContent.js';
import { formatPrice } from '@/lib/formatPrice.js';
import ProductPhoto from './ProductPhoto.jsx';
import './styles/LabOrder.css';

// "06 / Ordering": the How-it-works columns, then bordered order cards wired
// to the real cart (no pack toggle — this store has none).
export default function LabOrder({ products }) {
  const headingId = useId();
  const { add } = useCart();
  const [addedSlug, setAddedSlug] = useState(null);

  function handleAdd(product) {
    add(product, 1);
    setAddedSlug(product.slug);
  }

  return (
    <section className="lab-order" id="order" aria-labelledby={headingId}>
      <div className="lab-container lab-order__inner">
        <p className="lab-eyebrow">06 / Ordering</p>
        <h2 id={headingId} className="lab-order__title">
          Order requests only.
        </h2>

        <div className="lab-order__how">
          {HOW_IT_WORKS.map((step) => (
            <div className="lab-order__how-col" key={step.title}>
              <h3 className="lab-order__how-title">{step.title}</h3>
              <p className="lab-order__how-text">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="lab-order__divider" role="presentation">
          <span className="lab-order__divider-line" />
          <span className="lab-order__divider-text">Order direct</span>
          <span className="lab-order__divider-line" />
        </div>

        <div className="lab-order__cards">
          {products.map((product, index) => {
            const soldOut = product.stock === 0;
            return (
              <article className="lab-order__card" key={product.slug}>
                <div className="lab-order__card-media">
                  <ProductPhoto
                    slug={product.slug}
                    name={product.name}
                    className="lab-order__card-photo"
                  />
                </div>

                <p className="lab-order__card-name">
                  <span className="lab-order__card-index">0{index + 1}</span>
                  <span className="lab-order__card-serif">{product.name}</span>
                </p>
                <p className="lab-order__card-tagline">{product.tagline}</p>
                <p className="lab-order__card-price">{formatPrice(product.priceCents)}</p>

                <button
                  type="button"
                  className="lab-order__card-add"
                  disabled={soldOut}
                  onClick={() => handleAdd(product)}
                  aria-label={soldOut ? undefined : `Add ${product.name} to cart`}
                >
                  {soldOut ? 'Sold out' : 'Add to cart'}
                </button>

                {addedSlug === product.slug && !soldOut && (
                  <p className="lab-order__card-status" role="status">
                    Added to your cart.
                  </p>
                )}

                <Link to={`/products/${product.slug}`} className="lab-order__card-details">
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
