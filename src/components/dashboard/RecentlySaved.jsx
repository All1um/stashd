export default function RecentlySaved({ products, onProductClick }) {
    return (
      <div className="mb-24">
        <h2 className="mb-3" style={{ color: '#F5F0E8', fontSize: '18px', fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
          Recently Saved
        </h2>
        <div className="flex flex-col gap-2">
          {products.slice(0, 8).map((product) => {
            const isDown = product.currentPrice < product.savedPrice;
            const pct = Math.round(Math.abs((product.savedPrice - product.currentPrice) / product.savedPrice) * 100);
            return (
              <div
                key={product.id}
                role="button"
                tabIndex={0}
                onClick={() => onProductClick(product)}
                onKeyDown={(e) => e.key === 'Enter' && onProductClick(product)}
                className="flex items-center gap-3 rounded-2xl p-3 cursor-pointer active:scale-98 transition-all"
                style={{ background: '#141414', border: '1px solid #1E1E1E' }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="rounded-xl object-cover flex-shrink-0"
                  style={{ width: '52px', height: '52px' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate" style={{ color: '#F5F0E8', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500 }}>
                    {product.name}
                  </p>
                  <span style={{
                    background: 'rgba(212, 168, 83, 0.1)',
                    color: '#D4A853',
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    display: 'inline-block',
                    marginTop: '3px'
                  }}>
                    {product.store}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <p style={{ color: '#D4A853', fontSize: '14px', fontFamily: 'DM Mono, monospace', fontWeight: 500 }}>
                    ${product.currentPrice.toFixed(2)}
                  </p>
                  {pct > 0 && (
                    <p style={{ color: isDown ? '#2ECC71' : '#E74C3C', fontSize: '11px', fontFamily: 'Inter' }}>
                      {isDown ? '↓' : '↑'} {pct}%
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
