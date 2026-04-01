import { useState } from 'react';
import { Settings } from 'lucide-react';
import { mockAlerts } from '../data/mockData';

export default function Alerts() {
  const [tab, setTab] = useState('active');

  const active = mockAlerts.filter(a => a.status === 'active');
  const triggered = mockAlerts.filter(a => a.status === 'triggered');

  const progress = (alert) => {
    if (alert.currentPrice <= alert.targetPrice) return 100;
    const total = alert.currentPrice - alert.targetPrice;
    return Math.max(10, Math.min(90, 100 - (total / alert.currentPrice) * 100 * 3));
  };

  return (
    <div className="min-h-screen px-4" style={{ background: '#0A0A0A', paddingTop: 'max(20px, env(safe-area-inset-top, 20px))' }}>
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ color: '#F5F0E8', fontSize: '28px', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
          Alerts
        </h1>
        <button type="button" className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
          <Settings size={16} color="#6B6B6B" />
        </button>
      </div>

      <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: '#141414' }}>
        {['active', 'triggered'].map(t => (
          <button type="button" key={t} onClick={() => setTab(t)}
            className="flex-1 py-2.5 rounded-xl capitalize transition-all"
            style={{
              background: tab === t ? '#1E1E1E' : 'transparent',
              color: tab === t ? '#F5F0E8' : '#6B6B6B',
              fontSize: '14px', fontFamily: 'Inter', fontWeight: tab === t ? 600 : 400
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

      <div className="flex flex-col gap-3 mb-24">
        {tab === 'active' ? active.map(alert => {
          const pct = Math.round(((alert.currentPrice - alert.targetPrice) / alert.currentPrice) * 100);
          const prog = progress(alert);
          return (
            <div key={alert.id} className="rounded-2xl p-4" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
              <div className="flex gap-3 mb-3">
                <img src={alert.productImage} alt={alert.productName}
                  className="rounded-xl object-cover flex-shrink-0" style={{ width: '52px', height: '52px' }} />
                <div className="flex-1 min-w-0">
                  <p className="truncate mb-1" style={{ color: '#F5F0E8', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500 }}>
                    {alert.productName}
                  </p>
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#6B6B6B', fontFamily: 'DM Mono, monospace', fontSize: '13px' }}>
                      ${alert.currentPrice.toFixed(2)}
                    </span>
                    <span style={{ color: '#6B6B6B', fontSize: '12px' }}>→</span>
                    <span style={{ color: '#D4A853', fontFamily: 'DM Mono, monospace', fontSize: '13px', fontWeight: 500 }}>
                      ${alert.targetPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ background: '#1E1E1E' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${prog}%`, background: '#D4A853' }} />
              </div>
              <p className="mt-1" style={{ color: '#6B6B6B', fontSize: '11px', fontFamily: 'Inter' }}>
                {pct}% away from target
              </p>
            </div>
          );
        }) : triggered.map(alert => (
          <div key={alert.id} className="rounded-2xl p-4"
            style={{ background: '#141414', border: '1px solid rgba(212, 168, 83, 0.3)', boxShadow: '0 0 24px rgba(212, 168, 83, 0.08)' }}>
            <div className="flex gap-3 items-center">
              <img src={alert.productImage} alt={alert.productName}
                className="rounded-xl object-cover flex-shrink-0" style={{ width: '52px', height: '52px' }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span style={{
                    background: 'rgba(212, 168, 83, 0.1)', color: '#D4A853',
                    fontSize: '10px', padding: '2px 8px', borderRadius: '9999px',
                    fontFamily: 'Inter', fontWeight: 600
                  }}>
                    Price Hit! 🎯
                  </span>
                </div>
                <p className="truncate" style={{ color: '#F5F0E8', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500 }}>
                  {alert.productName}
                </p>
                <p style={{ color: '#D4A853', fontFamily: 'DM Mono, monospace', fontSize: '15px', fontWeight: 500 }}>
                  ${alert.targetPrice.toFixed(2)}
                </p>
              </div>
              <button type="button" className="px-4 py-2 rounded-2xl flex-shrink-0"
                style={{ background: '#E8652B', color: 'white', fontSize: '13px', fontFamily: 'Inter', fontWeight: 600 }}>
                Buy Now →
              </button>
            </div>
          </div>
        ))}

        {((tab === 'active' && active.length === 0) || (tab === 'triggered' && triggered.length === 0)) && (
          <div className="text-center py-16">
            <p style={{ color: '#6B6B6B', fontSize: '16px', fontFamily: 'Inter' }}>No {tab} alerts</p>
          </div>
        )}
      </div>
    </div>
  );
}
