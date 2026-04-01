import { useState } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-xl" style={{ background: '#1E1E1E', border: '1px solid #2E2E2E' }}>
        <p style={{ color: '#D4A853', fontFamily: 'DM Mono, monospace', fontSize: '13px' }}>
          ${payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export default function PriceChart({ history }) {
  const [range, setRange] = useState(30);
  const ranges = [30, 60, 90];

  const data = history.slice(-range).map((price, i) => ({ day: i + 1, price }));

  const minP = Math.min(...data.map(d => d.price));
  const maxP = Math.max(...data.map(d => d.price));
  const domain = [Math.floor(minP * 0.97), Math.ceil(maxP * 1.02)];

  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ color: '#F5F0E8', fontSize: '16px', fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
          Price History
        </h3>
        <div className="flex gap-1">
          {ranges.map(r => (
            <button type="button" key={r} onClick={() => setRange(r)}
              className="px-3 py-1 rounded-full transition-all"
              style={{
                background: range === r ? '#D4A853' : '#1E1E1E',
                color: range === r ? '#0A0A0A' : '#6B6B6B',
                fontSize: '11px', fontFamily: 'Inter', fontWeight: 600
              }}>
              {r}d
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '140px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <YAxis domain={domain} hide />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#D4A853"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#D4A853', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
