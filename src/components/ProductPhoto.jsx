import { useState } from 'react';
import { productImage } from '@/lib/productImage.js';

import './styles/ProductPhoto.css';

export default function ProductPhoto({ slug, name, className = '', ...rest }) {
  const [broken, setBroken] = useState(false);
  const [prevSlug, setPrevSlug] = useState(slug);

  if (slug !== prevSlug) {
    setPrevSlug(slug);
    setBroken(false);
  }

  if (broken) {
    return (
      <div className={`product__media-placeholder ${className}`} aria-hidden="true" {...rest} />
    );
  }

  return (
    <img
      src={productImage(slug)}
      alt={name}
      className={className || undefined}
      onError={() => setBroken(true)}
      {...rest}
    />
  );
}
