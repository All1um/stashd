// src/components/product/PriceChart.jsx
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const date  = entry.payload.checked_at
    ? new Date(entry.payload.checked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;
  return (
    <div className="px-3 py-2 rounded-xl" style={{ background: '#1E1E1E', border: '1px solid #2E2E2E' }}>
      <p style={{ color: '#D4A853', fontFamily: 'DM Mono, monospace', fontSize: '13px' }}>
        ${entry.value.toFixed(2)}
      </p>
      {date && (
        <p style={{ color: '#6B6B6B', fontFamily: 'Inter', fontSize: '11px', marginTop: '2px' }}>{date}</p>
      )}
    </div>
  );
};

export default function PriceChart({ history }) {
  const [range, setRange] = useState(30);
  const ranges = [30, 60, 90];

  // history is an array of { price, checked_at } objects from price_history table
  const sliced = history.slice(-range);

  if (sliced.length < 2) {
    return (
      <div className="rounded-2xl p-4 mb-4" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
        <p style={{ color: '#6B6B6B', fontSize: '13px', fontFamily: 'DM Mono, monospace' }}>
          Monitoring price data…
        </p>
      </div>
    );
  }

  const prices = sliced.map(d => d.price);
  const minP   = Math.min(...prices);
  const maxP   = Math.max(...prices);
  const domain = [Math.floor(minP * 0.97), Math.ceil(maxP * 1.02)];

  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ color: '#F5F0E8', fontSize: '16px', fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
          Price History
        </h3>
        <div className="flex gap-1">
          {ranges.map(r => (
            <button
              type="button"
              key={r}
              onClick={() => setRange(r)}
              className="px-3 py-1 rounded-full transition-all"
              style={{
                background: range === r ? '#D4A853' : '#1E1E1E',
                color:      range === r ? '#0A0A0A' : '#6B6B6B',
                fontSize: '11px', fontFamily: 'Inter', fontWeight: 600,
              }}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '140px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sliced}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#D4A853" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#D4A853" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <YAxis domain={domain} hide />
            <XAxis dataKey="checked_at" hide />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#D4A853"
              strokeWidth={2}
              fill="url(#goldGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#D4A853', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
