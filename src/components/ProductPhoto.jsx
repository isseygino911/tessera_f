import { useEffect, useState } from 'react';
import { productImage } from '../productImage.js';

export default function ProductPhoto({ slug, name, className = '', ...rest }) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [slug]);

  if (broken) {
    return <div className={`product__media-placeholder ${className}`} aria-hidden="true" {...rest} />;
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
