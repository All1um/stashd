import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import ProductImage from '../components/ProductImage';

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

function progressPct(currentPrice, targetPrice) {
  if (!currentPrice || !targetPrice) return 0;
  if (currentPrice <= targetPrice) return 100;
  const total = currentPrice - targetPrice;
  return Math.max(10, Math.min(90, 100 - (total / currentPrice) * 100 * 3));
}

export default function Alerts() {
  const { user } = useAuth();
  const [tab,       setTab]       = useState('active');
  const [alerts,    setAlerts]    = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    supabase
      .from('price_alerts')
      .select(`
        id, target_price, alert_type, is_triggered, is_active, created_at,
        products ( id, name, image_url, current_price, url )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setAlerts(data ?? []);
        setLoading(false);
      });
  }, [user]);

  const active    = alerts.filter(a =>  a.is_active && !a.is_triggered);
  const triggered = alerts.filter(a => a.is_triggered);

  return (
    <div
      style={{
        background: '#0A0A0A',
        paddingTop: 'max(20px, env(safe-area-inset-top, 20px))',
        height: '100vh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
      className="px-4"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ color: '#F5F0E8', fontSize: '28px', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
          Alerts
        </h1>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: '#141414' }}>
        {['active', 'triggered'].map(t => (
          <button type="button" key={t} onClick={() => setTab(t)}
            className="flex-1 py-2.5 rounded-xl capitalize transition-all"
            style={{
              background: tab === t ? '#1E1E1E' : 'transparent',
              color: tab === t ? '#F5F0E8' : '#6B6B6B',
              fontSize: '14px', fontFamily: 'Inter', fontWeight: tab === t ? 600 : 400,
            }}>
            {t}
            {t === 'triggered' && triggered.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-white"
                style={{ background: '#E74C3C', fontSize: '10px' }}>
                {triggered.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? <GoldSpinner /> : (
        <div className="flex flex-col gap-3 pb-40">
          {tab === 'active' ? (
            active.length === 0 ? (
              <div className="text-center py-16">
                <p style={{ fontSize: '40px', marginBottom: '12px' }}>🔔</p>
                <p style={{ color: '#F5F0E8', fontSize: '18px', fontFamily: 'Playfair Display, serif', fontWeight: 600, marginBottom: '8px' }}>
                  No active alerts.
                </p>
                <p style={{ color: '#6B6B6B', fontSize: '14px', fontFamily: 'Inter' }}>
                  Set a price alert on any product to start tracking.
                </p>
              </div>
            ) : active.map(alert => {
              const product      = alert.products;
              const currentPrice = product?.current_price ?? 0;
              const targetPrice  = alert.target_price ?? 0;
              const pct          = currentPrice > 0
                ? Math.round(Math.abs((currentPrice - targetPrice) / currentPrice) * 100)
                : 0;
              const prog = progressPct(currentPrice, targetPrice);

              return (
                <div key={alert.id} className="rounded-2xl p-4"
                  style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
                  <div className="flex gap-3 mb-3">
                    <ProductImage
                      src={product?.image_url}
                      alt={product?.name ?? ''}
                      size="md"
                      className="rounded-xl object-cover flex-shrink-0"
                      style={{ width: '52px', height: '52px' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate mb-1" style={{ color: '#F5F0E8', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500 }}>
                        {product?.name ?? 'Unknown product'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span style={{ color: '#6B6B6B', fontFamily: 'DM Mono, monospace', fontSize: '13px' }}>
                          ${currentPrice.toFixed(2)}
                        </span>
                        <span style={{ color: '#6B6B6B', fontSize: '12px' }}>→</span>
                        <span style={{ color: '#D4A853', fontFamily: 'DM Mono, monospace', fontSize: '13px', fontWeight: 500 }}>
                          ${targetPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: '#1E1E1E' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${prog}%`, background: '#D4A853' }} />
                  </div>
                  <p className="mt-1" style={{ color: '#6B6B6B', fontSize: '11px', fontFamily: 'Inter' }}>
                    {pct}% away from target
                  </p>
                </div>
              );
            })
          ) : (
            triggered.length === 0 ? (
              <div className="text-center py-16">
                <p style={{ color: '#6B6B6B', fontSize: '16px', fontFamily: 'Inter' }}>No triggered alerts</p>
              </div>
            ) : triggered.map(alert => {
              const product = alert.products;
              return (
                <div key={alert.id} className="rounded-2xl p-4"
                  style={{ background: '#141414', border: '1px solid rgba(212,168,83,0.3)', boxShadow: '0 0 24px rgba(212,168,83,0.08)' }}>
                  <div className="flex gap-3 items-center">
                    <ProductImage
                      src={product?.image_url}
                      alt={product?.name ?? ''}
                      size="md"
                      className="rounded-xl object-cover flex-shrink-0"
                      style={{ width: '52px', height: '52px' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{
                          background: 'rgba(212,168,83,0.1)', color: '#D4A853',
                          fontSize: '10px', padding: '2px 8px', borderRadius: '9999px',
                          fontFamily: 'Inter', fontWeight: 600,
                        }}>
                          Price Hit! 🎯
                        </span>
                      </div>
                      <p className="truncate" style={{ color: '#F5F0E8', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500 }}>
                        {product?.name ?? 'Unknown product'}
                      </p>
                      <p style={{ color: '#D4A853', fontFamily: 'DM Mono, monospace', fontSize: '15px', fontWeight: 500 }}>
                        ${(alert.target_price ?? 0).toFixed(2)}
                      </p>
                    </div>
                    {product?.url && (
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-2xl flex-shrink-0"
                        style={{ background: '#E8652B', color: 'white', fontSize: '13px', fontFamily: 'Inter', fontWeight: 600, textDecoration: 'none' }}
                      >
                        Buy Now →
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
