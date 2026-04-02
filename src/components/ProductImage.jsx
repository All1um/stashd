// src/components/ProductImage.jsx
import { useState } from 'react';
import StashdPlaceholder from './StashdPlaceholder';

export default function ProductImage({ src, alt = '', size = 'md', className, style }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <StashdPlaceholder size={size} className={className} style={style} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={className}
      style={style}
    />
  );
}
