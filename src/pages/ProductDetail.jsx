import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import ProductImage from '../components/ProductImage';
import PriceChart from '../components/product/PriceChart';
import ComparePrices from '../components/product/ComparePrices';
import SetAlert from '../components/product/SetAlert';
import { meiFromPrices } from '@/utils/marketLogic';
import { supabase } from '@/lib/supabase';

export default function ProductDetail({ product, onBack }) {
  // Supabase returns snake_case — normalise with safe defaults
  const currentPrice  = product?.current_price  ?? product?.currentPrice  ?? 0;
  const originalPrice = product?.original_price ?? product?.savedPrice    ?? 0;
  const imageUrl      = product?.image_url      ?? product?.image         ?? null;
  const storeName     = product?.store_name     ?? product?.store         ?? null;
  const productUrl    = product?.url            ?? null;
  const createdAt     = product?.created_at     ?? product?.savedDate     ?? null;

  const isDown = currentPrice < originalPrice;
  const pct    = originalPrice > 0
    ? Math.round(Math.abs((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const savedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const [priceHistory, setPriceHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (!product?.id) { setHistoryLoading(false); return; }
    supabase
      .from('price_history')
      .select('price, checked_at')
      .eq('product_id', product.id)
      .order('checked_at', { ascending: true })
      .then(({ data }) => {
        setPriceHistory(data ?? []);
        setHistoryLoading(false);
      });
  }, [product?.id]);

  const lowestPrice = priceHistory.length > 0
    ? Math.min(...priceHistory.map(h => h.price))
    : currentPrice;

  const mei = priceHistory.length > 1
    ? meiFromPrices(currentPrice, priceHistory.map(h => h.price))
    : null;

  return (
    <div className="min-h-screen pb-32" style={{ background: '#0A0A0A' }}>

      {/* Hero image */}
      <div className="relative" style={{ height: '220px' }}>
        <ProductImage
          src={imageUrl}
          alt={product?.name ?? 'Product'}
          size="lg"
          style={{
            width: '100%',
            height: '220px',
            objectFit: 'cover',
            borderBottomLeftRadius: '24px',
            borderBottomRightRadius: '24px',
          }}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(10,10,10,0.4) 0%, transparent 40%)',
          borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px',
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

        {/* Name + store */}
        <h1 className="mb-1" style={{ color: '#F5F0E8', fontSize: '22px', fontFamily: 'Playfair Display, serif', fontWeight: 700, lineHeight: 1.25 }}>
          {product?.name ?? 'Unknown Product'}
        </h1>

        <div className="flex items-center gap-2 mb-4">
          {storeName && (
            <span style={{
              background: 'rgba(212,168,83,0.1)', color: '#D4A853',
              fontSize: '11px', padding: '2px 10px', borderRadius: '9999px',
              fontFamily: 'Inter', fontWeight: 500,
            }}>
              {storeName}
            </span>
          )}
          {savedDate && (
            <span style={{ color: '#6B6B6B', fontSize: '12px', fontFamily: 'Inter' }}>
              Saved {savedDate}
            </span>
          )}
        </div>

        {/* Price card */}
        <div className="rounded-2xl p-4 mb-4" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
          <div className="flex items-end gap-3 mb-1">
            <span style={{ color: '#D4A853', fontSize: '36px', fontFamily: 'DM Mono, monospace', fontWeight: 500, lineHeight: 1 }}>
              ${currentPrice.toFixed(2)}
            </span>
            {pct > 0 && (
              <span className="mb-1 px-2 py-0.5 rounded-full" style={{
                background: isDown ? 'rgba(46,204,113,0.12)' : 'rgba(231,76,60,0.12)',
                color: isDown ? '#2ECC71' : '#E74C3C',
                fontSize: '13px', fontFamily: 'Inter', fontWeight: 600,
              }}>
                {isDown ? '↓' : '↑'} {pct}%
              </span>
            )}
          </div>
          {originalPrice > 0 && originalPrice !== currentPrice && (
            <p style={{ color: '#6B6B6B', fontSize: '13px', fontFamily: 'Inter', textDecoration: 'line-through', marginBottom: '6px' }}>
              Was ${originalPrice.toFixed(2)} when saved
            </p>
          )}
          <p style={{ color: '#6B6B6B', fontSize: '12px', fontFamily: 'Inter' }}>
            Lowest seen:{' '}
            <span style={{ color: '#2ECC71', fontFamily: 'DM Mono, monospace' }}>${lowestPrice.toFixed(2)}</span>
          </p>
        </div>

        {/* MEI gauge */}
        <div className="rounded-2xl p-4 mb-4" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
          <p style={{ color: '#6B6B6B', fontSize: '9px', fontFamily: 'DM Mono, monospace', letterSpacing: '0.12em', marginBottom: '8px' }}>
            MARKET ENTRY INDEX
          </p>
          {mei ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <span style={{ color: mei.color, fontSize: '32px', fontFamily: 'DM Mono, monospace', fontWeight: 700, lineHeight: 1 }}>
                  {mei.score}
                </span>
                <div>
                  <p style={{ color: mei.color, fontSize: '13px', fontFamily: 'DM Mono, monospace', fontWeight: 600, letterSpacing: '0.06em' }}>
                    {mei.label.toUpperCase()}
                  </p>
                  <p style={{ color: '#6B6B6B', fontSize: '11px', fontFamily: 'Inter', marginTop: '2px' }}>
                    {priceHistory.length}-point price history
                  </p>
                </div>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: '4px', background: '#1E1E1E' }}>
                <div className="h-full rounded-full" style={{
                  width: `${mei.score}%`,
                  background: mei.color,
                  boxShadow: `0 0 6px ${mei.color}55`,
                }} />
              </div>
              <div className="flex justify-between mt-1.5">
                <span style={{ color: '#E74C3C', fontSize: '8px', fontFamily: 'DM Mono, monospace' }}>OVERVALUED</span>
                <span style={{ color: '#D4A853', fontSize: '8px', fontFamily: 'DM Mono, monospace' }}>HOLD</span>
                <span style={{ color: '#2ECC71', fontSize: '8px', fontFamily: 'DM Mono, monospace' }}>STRONG BUY</span>
              </div>
            </>
          ) : (
            <p style={{ color: '#6B6B6B', fontSize: '13px', fontFamily: 'DM Mono, monospace' }}>
              N/A — Monitoring Market Wisdom.
            </p>
          )}
        </div>

        {!historyLoading && <PriceChart history={priceHistory} />}

        <SetAlert product={product} />
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4" style={{
        background: 'linear-gradient(to top, #0A0A0A 60%, transparent)',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
      }}>
        <div className="flex gap-3">
          {productUrl && (
            <a
              href={productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl flex-shrink-0 transition-opacity active:opacity-80"
              style={{
                background: '#141414',
                border: '1px solid #1E1E1E',
                color: '#D4A853',
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              <ExternalLink size={16} color="#D4A853" />
              Store
            </a>
          )}
          <button
            type="button"
            className="flex-1 py-4 rounded-2xl font-semibold text-white transition-opacity active:opacity-80"
            style={{ background: '#E8652B', fontSize: '16px', fontFamily: 'Inter', fontWeight: 600 }}
          >
            Buy at Best Price →
          </button>
        </div>
      </div>
    </div>
  );
}
