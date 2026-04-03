import { useState, useRef } from 'react';
import ProductImage from '../ProductImage';

/**
 * SwipeableGallery
 *
 * Props:
 *   images   — string[]  — list of image URLs; falls back to [fallbackSrc] if empty
 *   fallbackSrc — string | null — used when images is empty
 *   alt      — string
 *   height   — number (px) — default 220
 */
export default function SwipeableGallery({ images = [], fallbackSrc = null, alt = '', height = 220 }) {
  const [index, setIndex] = useState(0);

  // Resolve gallery: prefer images[], else use single fallback
  const gallery = images.length > 0 ? images : (fallbackSrc ? [fallbackSrc] : []);
  const total   = gallery.length;

  const startXRef = useRef(null);

  const prev = () => setIndex(i => (i - 1 + total) % total);
  const next = () => setIndex(i => (i + 1) % total);

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (startXRef.current === null) return;
    const dx = e.changedTouches[0].clientX - startXRef.current;
    if (Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
    }
    startXRef.current = null;
  };

  if (total === 0) {
    return (
      <div style={{ height, width: '100%', background: '#141414', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }} />
    );
  }

  return (
    <div
      style={{ position: 'relative', height, width: '100%', overflow: 'hidden', userSelect: 'none' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      <div
        style={{
          display:    'flex',
          width:      `${total * 100}%`,
          height:     '100%',
          transform:  `translateX(-${(index / total) * 100}%)`,
          transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {gallery.map((src, i) => (
          <div key={i} style={{ width: `${100 / total}%`, height: '100%', flexShrink: 0 }}>
            <ProductImage
              src={src}
              alt={`${alt} ${i + 1}`}
              size="lg"
              style={{
                width:                    '100%',
                height:                   '100%',
                objectFit:                'cover',
                borderBottomLeftRadius:   i === 0 ? '24px' : 0,
                borderBottomRightRadius:  i === total - 1 ? '24px' : 0,
              }}
            />
          </div>
        ))}
      </div>

      {/* Gradient overlay */}
      <div
        style={{
          position:                 'absolute',
          inset:                    0,
          background:               'linear-gradient(to bottom, rgba(10,10,10,0.4) 0%, transparent 40%)',
          borderBottomLeftRadius:   '24px',
          borderBottomRightRadius:  '24px',
          pointerEvents:            'none',
        }}
      />

      {/* Pagination dots — only render when >1 image */}
      {total > 1 && (
        <div
          style={{
            position:       'absolute',
            bottom:         '12px',
            left:           '50%',
            transform:      'translateX(-50%)',
            display:        'flex',
            gap:            '6px',
            alignItems:     'center',
          }}
        >
          {gallery.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              style={{
                width:        i === index ? '20px' : '6px',
                height:       '6px',
                borderRadius: '9999px',
                background:   i === index ? '#D4A853' : 'rgba(212,168,83,0.35)',
                border:       'none',
                padding:      0,
                cursor:       'pointer',
                transition:   'width 0.2s ease, background 0.2s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
