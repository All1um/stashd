import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';

// ── Gold spinner ──────────────────────────────────────────

function GoldSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <svg width="28" height="28" viewBox="0 0 28 28" className="animate-spin">
        <circle cx="14" cy="14" r="11" fill="none" stroke="#1E1E1E" strokeWidth="2.5" />
        <circle cx="14" cy="14" r="11" fill="none" stroke="#D4A853" strokeWidth="2.5"
          strokeLinecap="round" strokeDasharray="52 18" />
      </svg>
    </div>
  );
}

// ── Wealthsimple empty state ──────────────────────────────

function EmptyState({ onDiscover }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.15)' }}>
        <span style={{ fontSize: '28px' }}>📊</span>
      </div>
      <p style={{
        color: '#F5F0E8',
        fontSize: '20px',
        fontFamily: 'Playfair Display, serif',
        fontWeight: 600,
        lineHeight: 1.3,
        marginBottom: '10px',
      }}>
        No assets stashed.
      </p>
      <p style={{ color: '#6B6B6B', fontSize: '14px', fontFamily: 'Inter', lineHeight: 1.7, marginBottom: '28px' }}>
        Monitor the market to begin.
      </p>
      <button
        type="button"
        onClick={onDiscover}
        className="px-6 py-3 rounded-2xl transition-opacity active:opacity-80"
        style={{
          background: 'rgba(212,168,83,0.12)',
          border: '1px solid rgba(212,168,83,0.3)',
          color: '#D4A853',
          fontFamily: 'Inter',
          fontWeight: 600,
          fontSize: '14px',
        }}
      >
        Discover Products
      </button>
    </div>
  );
}

// ── Asset row ─────────────────────────────────────────────

function AssetRow({ product, onProductClick }) {
  const current  = product.current_price  ?? 0;
  const original = product.original_price ?? 0;
  const diff     = current - original;
  const pct      = original > 0 ? (diff / original) * 100 : 0;
  const isDown   = diff < 0;
  const isUp     = diff > 0;

  return (
    <button
      type="button"
      onClick={() => onProductClick(product)}
      className="w-full flex items-center gap-3 py-3.5 transition-opacity active:opacity-70"
      style={{ borderBottom: '1px solid #111111' }}
    >
      {/* Thumbnail */}
      <div className="w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden"
        style={{ background: '#1A1A1A' }}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name}
            className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span style={{ fontSize: '18px' }}>📦</span>
          </div>
        )}
      </div>

      {/* Name + store */}
      <div className="flex-1 min-w-0 text-left">
        <p className="truncate" style={{
          color: '#F5F0E8', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500,
        }}>
          {product.name}
        </p>
        {product.store_name && (
          <p style={{ color: '#6B6B6B', fontSize: '12px', fontFamily: 'Inter' }}>
            {product.store_name}
          </p>
        )}
      </div>

      {/* Price + delta */}
      <div className="text-right flex-shrink-0">
        <p style={{ color: '#D4A853', fontSize: '15px', fontFamily: 'DM Mono, monospace', fontWeight: 500 }}>
          ${current.toFixed(2)}
        </p>
        <div className="flex items-center justify-end gap-1 mt-0.5">
          {isDown && <TrendingDown size={11} color="#2ECC71" />}
          {isUp   && <TrendingUp   size={11} color="#E74C3C" />}
          {!isDown && !isUp && <Minus size={11} color="#6B6B6B" />}
          <span style={{
            fontSize: '11px',
            fontFamily: 'DM Mono, monospace',
            color: isDown ? '#2ECC71' : isUp ? '#E74C3C' : '#6B6B6B',
          }}>
            {pct === 0 ? '—' : `${isDown ? '' : '+'}${pct.toFixed(1)}%`}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Main Dashboard ────────────────────────────────────────

export default function Dashboard({ onProductClick, onNavigate }) {
  const { user, profile } = useAuth();
  const currency          = profile?.currency ?? 'CAD';

  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [alertsActive, setAlertsActive] = useState(0);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    Promise.all([
      supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false }),
      supabase
        .from('price_alerts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('is_triggered', false),
    ]).then(([{ data: productsData }, { count }]) => {
      setProducts(productsData ?? []);
      setAlertsActive(count ?? 0);
      setLoading(false);
    });
  }, [user]);

  // ── Computed stats ──────────────────────────────────────
  const portfolioValue = products.reduce((sum, p) => sum + (p.current_price ?? 0), 0);
  const totalSavings   = products.reduce((sum, p) => {
    const diff = (p.original_price ?? 0) - (p.current_price ?? 0);
    return sum + (diff > 0 ? diff : 0);
  }, 0);

  const stats = [
    { label: 'POSITIONS',       value: String(products.length), mono: false },
    { label: 'PORTFOLIO',       value: `$${portfolioValue.toFixed(0)}`, mono: true,  gold: true },
    { label: 'ALERTS ACTIVE',   value: String(alertsActive), mono: false, gold: alertsActive > 0 },
    { label: 'TOTAL SAVINGS',   value: `$${totalSavings.toFixed(0)}`, mono: true,  green: totalSavings > 0 },
  ];

  return (
    <div className="min-h-screen" style={{
      background: '#000000',
      paddingTop: 'max(20px, env(safe-area-inset-top, 20px))',
    }}>

      {/* Gold glow */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ height: '300px', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(212,168,83,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
      </div>

      <div className="relative z-10 px-4 pb-32">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ color: '#F5F0E8', fontSize: '28px', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
              Assets
            </h1>
            <p style={{ color: '#6B6B6B', fontSize: '11px', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', marginTop: '2px' }}>
              {currency} · PORTFOLIO
            </p>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #D4A853, #E8652B)' }}>
            <span style={{ color: 'white', fontSize: '14px', fontFamily: 'Inter', fontWeight: 600 }}>
              {(profile?.display_name ?? user?.email ?? 'U')[0].toUpperCase()}
            </span>
          </div>
        </div>

        {loading ? <GoldSpinner /> : (
          <>
            {/* Stats grid */}
            {products.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-6">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-2xl p-4"
                    style={{ background: '#111111', border: '1px solid #1A1A1A' }}>
                    <p style={{
                      color: '#6B6B6B', fontSize: '9px',
                      fontFamily: 'DM Mono, monospace',
                      letterSpacing: '0.12em', marginBottom: '6px',
                    }}>
                      {s.label}
                    </p>
                    <p style={{
                      fontSize: '22px',
                      fontWeight: 700,
                      fontFamily: s.mono ? 'DM Mono, monospace' : 'Playfair Display, serif',
                      color: s.gold ? '#D4A853' : s.green ? '#2ECC71' : '#F5F0E8',
                      lineHeight: 1,
                    }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Asset list */}
            {products.length > 0 ? (
              <div className="rounded-2xl overflow-hidden mb-28"
                style={{ background: '#111111', border: '1px solid #1A1A1A' }}>
                <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                  <p style={{ color: '#6B6B6B', fontSize: '9px', fontFamily: 'DM Mono, monospace', letterSpacing: '0.12em' }}>
                    STASHED POSITIONS
                  </p>
                  <p style={{ color: '#6B6B6B', fontSize: '9px', fontFamily: 'DM Mono, monospace', letterSpacing: '0.08em' }}>
                    PRICE · CHANGE
                  </p>
                </div>
                <div className="px-4">
                  {products.map((p) => (
                    <AssetRow key={p.id} product={p} onProductClick={onProductClick} />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState onDiscover={() => onNavigate?.('discover')} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
