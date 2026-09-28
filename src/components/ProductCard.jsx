import { Link } from 'react-router-dom';
import { formatPrice } from '@/lib/formatPrice.js';
import { CARD_CHIPS } from '@/data/productFacts.js';
import ProductPhoto from './ProductPhoto.jsx';

import './styles/ProductCard.css';

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.slug}`} className="card">
      <div className="card__media">
        <span className="card__chips" aria-hidden="true">
          {CARD_CHIPS.map((chip) => (
            <span key={chip} className="chip">
              {chip}
            </span>
          ))}
        </span>
        <ProductPhoto slug={product.slug} name={product.name} className="blend" />
        {product.stock <= 0 && <span className="card__badge">Sold out</span>}
      </div>
      <div className="card__meta">
        <div className="card__row">
          <span className="card__name">{product.name}</span>
          <span className="card__price">{formatPrice(product.priceCents)}</span>
        </div>
        <span className="card__tagline">{product.tagline}</span>
        <span className="card__stone">
          <span className="mono-label">Colour</span>
          <span className="swatch" style={{ '--swatch': product.hex }} />
        </span>
      </div>
    </Link>
  );
}
