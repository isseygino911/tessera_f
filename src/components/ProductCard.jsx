import { Link } from 'react-router-dom';
import { formatPrice } from '../formatPrice.js';
import ProductPhoto from './ProductPhoto.jsx';

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.slug}`} className="card">
      <div className="card__media">
        <ProductPhoto slug={product.slug} name={product.name} className="blend" />
        {product.stock <= 0 && <span className="card__badge">Sold out</span>}
      </div>
      <span className="card__stone" style={{ '--stone': product.hex }}>
        {product.tagline}
      </span>
      <span className="card__name">{product.name}</span>
      <span className="card__price">{formatPrice(product.priceCents)}</span>
    </Link>
  );
}
