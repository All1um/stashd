import { ArrowLeft } from 'lucide-react';
import PriceChart from '../components/product/PriceChart';
import ComparePrices from '../components/product/ComparePrices';
import SetAlert from '../components/product/SetAlert';

export default function ProductDetail({ product, onBack }) {
  const isDown = product.currentPrice < product.savedPrice;
  const pct = Math.round(Math.abs((product.savedPrice - product.currentPrice) / product.savedPrice) * 100);

  const savedDate = new Date(product.savedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const lowestPrice = product.priceHistory
    ? Math.min(...product.priceHistory)
    : product.currentPrice;

  return (
    <div className="min-h-screen pb-32" style={{ background: '#0A0A0A' }}>
      <div className="relative" style={{ height: '220px' }}>
        <img src={product.image} alt={product.name} className="w-full h-full object-cover"
          style={{ borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }} />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(10,10,10,0.4) 0%, transparent 40%)',
          borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px'
        }} />
        <button
          type="button"
          onClick={onBack}
          className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-sm"
          style={{ background: 'rgba(10,10,10,0.6)', marginTop: 'max(4px, env(safe-area-inset-top, 4px))' }}
        >
          <ArrowLeft size={18} color="#F5F0E8" />
        </button>
      </div>

      <div className="px-4 pt-4">
        <h1 className="mb-1" style={{ color: '#F5F0E8', fontSize: '22px', fontFamily: 'Playfair Display, serif', fontWeight: 700, lineHeight: 1.25 }}>
          {product.name}
        </h1>

        <div className="flex items-center gap-2 mb-4">
          <span style={{
            background: 'rgba(212, 168, 83, 0.1)', color: '#D4A853',
            fontSize: '11px', padding: '2px 10px', borderRadius: '9999px',
            fontFamily: 'Inter', fontWeight: 500
          }}>
            {product.store}
          </span>
          <span style={{ color: '#6B6B6B', fontSize: '12px', fontFamily: 'Inter' }}>Saved {savedDate}</span>
        </div>

        <div className="rounded-2xl p-4 mb-4" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
          <div className="flex items-end gap-3 mb-1">
            <span style={{ color: '#D4A853', fontSize: '36px', fontFamily: 'DM Mono, monospace', fontWeight: 500, lineHeight: 1 }}>
              ${product.currentPrice.toFixed(2)}
            </span>
            {pct > 0 && (
              <span className="mb-1 px-2 py-0.5 rounded-full"
                style={{
                  background: isDown ? 'rgba(46,204,113,0.12)' : 'rgba(231,76,60,0.12)',
                  color: isDown ? '#2ECC71' : '#E74C3C',
                  fontSize: '13px', fontFamily: 'Inter', fontWeight: 600
                }}>
                {isDown ? '↓' : '↑'} {pct}%
              </span>
            )}
          </div>
          <p style={{ color: '#6B6B6B', fontSize: '13px', fontFamily: 'Inter', textDecoration: 'line-through', marginBottom: '6px' }}>
            Was ${product.savedPrice.toFixed(2)} when saved
          </p>
          <p style={{ color: '#6B6B6B', fontSize: '12px', fontFamily: 'Inter' }}>
            Lowest seen:{' '}
            <span style={{ color: '#2ECC71', fontFamily: 'DM Mono, monospace' }}>${lowestPrice.toFixed(2)}</span>
          </p>
        </div>

        {product.priceHistory && <PriceChart history={product.priceHistory} />}

        <ComparePrices comparePrices={product.comparePrices} />

        <SetAlert product={product} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4" style={{
        background: 'linear-gradient(to top, #0A0A0A 60%, transparent)',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))'
      }}>
        <button
          type="button"
          className="w-full py-4 rounded-2xl font-semibold text-white transition-opacity active:opacity-80"
          style={{ background: '#E8652B', fontSize: '16px', fontFamily: 'Inter', fontWeight: 600, letterSpacing: '0.01em' }}
        >
          Buy at Best Price →
        </button>
      </div>
    </div>
  );
}
