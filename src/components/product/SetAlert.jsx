import { useState } from 'react';
import { toastSuccess, toastInfo } from '@/lib/toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';

export default function SetAlert({ product }) {
  const { user } = useAuth();

  // Normalise — product may be Supabase snake_case or mock camelCase
  const currentPrice = product?.current_price ?? product?.currentPrice ?? 0;
  const productId    = product?.id ?? null;

  const [enabled,     setEnabled]     = useState(false);
  const [mode,        setMode]        = useState('price');
  const [targetPrice, setTargetPrice] = useState('');
  const [pctDrop,     setPctDrop]     = useState('10');
  const [saving,      setSaving]      = useState(false);

  const calcPrice = mode === 'percent'
    ? (currentPrice * (1 - parseInt(pctDrop, 10) / 100)).toFixed(2)
    : targetPrice;

  const handleSave = async () => {
    if (!user) {
      toastInfo('Sign in to set alerts', '');
      return;
    }
    if (!calcPrice || parseFloat(calcPrice) <= 0) {
      toastInfo('Enter a valid target price', '');
      return;
    }

    setSaving(true);

    const { error } = await supabase.from('price_alerts').upsert({
      user_id:      user.id,
      product_id:   productId,
      target_price: parseFloat(calcPrice),
      alert_type:   mode === 'percent' ? 'percentage' : 'price',
    }, { onConflict: 'user_id,product_id' });

    setSaving(false);

    if (error) {
      toastInfo('Could not save alert', error.message);
      return;
    }

    toastSuccess('Alert set', `Notify when ↓ $${parseFloat(calcPrice).toFixed(2)}`);
    setEnabled(false);
  };

  return (
    <div className="rounded-2xl p-4 mb-28" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ color: '#F5F0E8', fontSize: '16px', fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
          Price Alert
        </h3>
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className="relative w-12 h-6 rounded-full transition-all"
          style={{ background: enabled ? '#D4A853' : '#1E1E1E' }}
        >
          <div
            className="absolute top-0.5 transition-all w-5 h-5 rounded-full"
            style={{ background: 'white', left: enabled ? '26px' : '2px' }}
          />
        </button>
      </div>

      {enabled && (
        <div className="space-y-3">
          {/* Mode selector */}
          <div className="flex gap-2">
            {['price', 'percent'].map(m => (
              <button
                type="button"
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 py-2 rounded-xl transition-all"
                style={{
                  background: mode === m ? '#D4A853' : '#1E1E1E',
                  color:      mode === m ? '#0A0A0A' : '#6B6B6B',
                  fontSize: '13px', fontFamily: 'Inter', fontWeight: 600,
                }}
              >
                {m === 'price' ? 'Target Price' : '% Drop'}
              </button>
            ))}
          </div>

          {/* Input */}
          {mode === 'price' ? (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: '#1E1E1E' }}>
              <span style={{ color: '#D4A853', fontFamily: 'DM Mono, monospace', fontSize: '16px' }}>$</span>
              <input
                type="number"
                value={targetPrice}
                onChange={e => setTargetPrice(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent outline-none"
                style={{ color: '#F5F0E8', fontFamily: 'DM Mono, monospace', fontSize: '16px' }}
              />
            </div>
          ) : (
            <div className="flex gap-2">
              {['10', '20', '30'].map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPctDrop(p)}
                  className="flex-1 py-2 rounded-xl transition-all"
                  style={{
                    background: 'transparent',
                    border: `1px solid ${pctDrop === p ? '#D4A853' : '#1E1E1E'}`,
                    color: pctDrop === p ? '#D4A853' : '#6B6B6B',
                    fontSize: '12px', fontFamily: 'Inter', fontWeight: 600,
                  }}
                >
                  -{p}%
                </button>
              ))}
            </div>
          )}

          {calcPrice && (
            <p style={{ color: '#6B6B6B', fontSize: '12px', fontFamily: 'Inter' }}>
              Alert when price drops to{' '}
              <span style={{ color: '#2ECC71', fontFamily: 'DM Mono, monospace' }}>${parseFloat(calcPrice).toFixed(2)}</span>
            </p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-2xl transition-opacity active:opacity-80 disabled:opacity-50"
            style={{ background: '#E8652B', color: 'white', fontFamily: 'Inter', fontWeight: 600, fontSize: '15px' }}
          >
            {saving ? 'Saving…' : 'Save Alert'}
          </button>
        </div>
      )}
    </div>
  );
}
