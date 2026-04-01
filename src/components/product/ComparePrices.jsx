export default function ComparePrices({ comparePrices }) {
    if (!comparePrices || comparePrices.length === 0) return null;

    const minPrice = Math.min(...comparePrices.map(c => c.price));

    return (
      <div className="rounded-2xl p-4 mb-4" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
        <h3 className="mb-3" style={{ color: '#F5F0E8', fontSize: '16px', fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
          Compare Prices
        </h3>
        <div className="flex flex-col gap-2">
          {comparePrices
            .sort((a, b) => a.price - b.price)
            .map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: i < comparePrices.length - 1 ? '1px solid #1E1E1E' : 'none' }}>
                <div className="flex items-center gap-2">
                  <p style={{ color: '#F5F0E8', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500 }}>{item.store}</p>
                  {item.price === minPrice && (
                    <span style={{
                      background: 'rgba(212, 168, 83, 0.15)',
                      color: '#D4A853',
                      border: '1px solid rgba(212, 168, 83, 0.3)',
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontFamily: 'Inter',
                      fontWeight: 600
                    }}>
                      Best Price
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ color: item.price === minPrice ? '#D4A853' : '#F5F0E8', fontSize: '15px', fontFamily: 'DM Mono, monospace', fontWeight: 500 }}>
                    ${item.price.toFixed(2)}
                  </span>
                  <button type="button" className="px-3 py-1 rounded-full"
                    style={{ background: '#1E1E1E', color: '#F5F0E8', fontSize: '12px', fontFamily: 'Inter', fontWeight: 500 }}>
                    Buy
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }
