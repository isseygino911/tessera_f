import { Link } from 'react-router-dom';
import { formatPrice } from '@/lib/formatPrice.js';
import ProductPhoto from './ProductPhoto.jsx';

import './styles/ProductCard.css';

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.slug}`} className="pcard" style={{ '--stone': product.hex }}>
      <div className="pcard__media">
        <div className="pcard__glow" aria-hidden="true" />
        <ProductPhoto product={product} name={product.name} className="pcard__photo blend" />
        {product.stock <= 0 && <span className="pcard__badge">Sold out</span>}
      </div>
      <p className="pcard__name">
        {product.name}
        <span className="pcard__dot" aria-hidden="true" />
      </p>
      <p className="pcard__tagline">{product.tagline}</p>
      <p className="pcard__price">{formatPrice(product.priceCents)}</p>
      <span className="pcard__details">Details →</span>
    </Link>
  );
}
