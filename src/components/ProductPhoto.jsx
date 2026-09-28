import { useState } from 'react';
import { mainImage } from '@/lib/productImages.js';

import './styles/ProductPhoto.css';

export default function ProductPhoto({ product, name, className = '', ...rest }) {
  const [broken, setBroken] = useState(false);
  const [prevProductId, setPrevProductId] = useState(product?.id);

  if (product?.id !== prevProductId) {
    setPrevProductId(product?.id);
    setBroken(false);
  }

  const url = mainImage(product)?.url;

  if (!url || broken) {
    return (
      <div className={`product__media-placeholder ${className}`} aria-hidden="true" {...rest} />
    );
  }

  return (
    <img
      src={url}
      alt={name}
      className={className || undefined}
      onError={() => setBroken(true)}
      {...rest}
    />
  );
}
