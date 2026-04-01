export default function PriceDropsScroll({ products, onProductClick }) {
    const pct = (p) => Math.round(((p.savedPrice - p.currentPrice) / p.savedPrice) * 100);

    return (
      <div className="mb-6">
        <h2 className="mb-3" style={{ color: '#F5F0E8', fontSize: '18px', fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
          Recent Price Drops
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {products.map((product) => (
            <div
              key={product.id}
              role="button"
              tabIndex={0}
              onClick={() => onProductClick(product)}
              onKeyDown={(e) => e.key === 'Enter' && onProductClick(product)}
              className="flex-shrink-0 rounded-2xl p-3 cursor-pointer active:scale-95 transition-transform"
              style={{ background: '#141414', border: '1px solid #1E1E1E', width: '148px' }}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full rounded-xl mb-2 object-cover"
                style={{ height: '100px' }}
              />
              <p style={{ color: '#F5F0E8', fontSize: '12px', fontFamily: 'Inter', fontWeight: 500, lineHeight: 1.3, marginBottom: '6px' }}
                 className="line-clamp-2">
                {product.name}
              </p>
              <p style={{ color: '#6B6B6B', fontSize: '11px', fontFamily: 'Inter', textDecoration: 'line-through', marginBottom: '2px' }}>
                ${product.savedPrice.toFixed(2)}
              </p>
              <div className="flex items-center gap-1 mb-2">
                <span style={{ color: '#2ECC71', fontSize: '14px', fontFamily: 'DM Mono, monospace', fontWeight: 500 }}>
                  ↓ ${product.currentPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{
                  background: 'rgba(46, 204, 113, 0.12)',
                  color: '#2ECC71',
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  fontFamily: 'Inter',
                  fontWeight: 600
                }}>
                  -{pct(product)}%
                </span>
                <button
                  type="button"
                  className="text-white rounded-full px-2 py-1 transition-opacity active:opacity-70"
                  style={{ background: '#E8652B', fontSize: '10px', fontFamily: 'Inter', fontWeight: 600 }}
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
