import { useState } from 'react';
import { ArrowLeft, Pencil, Bell } from 'lucide-react';
import { getListProducts } from '../data/mockData';

export default function ListDetail({ list, onBack, onProductClick }) {
  const [sortBy, setSortBy] = useState('date');
  const [filter, setFilter] = useState('all');

  const products = getListProducts(list.id);
  const filters = ['All', 'Dropped', 'Increased', 'Alerted'];

  const filtered = products.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'dropped') return p.currentPrice < p.savedPrice;
    if (filter === 'increased') return p.currentPrice > p.savedPrice;
    if (filter === 'alerted') return p.hasAlert;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-low') return a.currentPrice - b.currentPrice;
    if (sortBy === 'price-high') return b.currentPrice - a.currentPrice;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return new Date(b.savedDate) - new Date(a.savedDate);
  });

  const totalCost = filtered.reduce((sum, p) => sum + p.currentPrice, 0);

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A', paddingTop: 'max(20px, env(safe-area-inset-top, 20px))' }}>
      <div className="px-4">
        <div className="flex items-center gap-3 mb-2">
          <button type="button" onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
            <ArrowLeft size={18} color="#F5F0E8" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <span style={{ fontSize: '20px' }}>{list.emoji}</span>
            <h1 style={{ color: '#F5F0E8', fontSize: '22px', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
              {list.name}
            </h1>
            <Pencil size={14} color="#6B6B6B" />
          </div>
        </div>
        <p style={{ color: '#D4A853', fontSize: '18px', fontFamily: 'DM Mono, monospace', fontWeight: 500, marginBottom: '16px', paddingLeft: '48px' }}>
          ${totalCost.toFixed(2)} total
        </p>

        <div className="flex items-center justify-end mb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
            <span style={{ color: '#6B6B6B', fontSize: '12px', fontFamily: 'Inter' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="outline-none"
              style={{ background: 'transparent', color: '#F5F0E8', fontSize: '12px', fontFamily: 'Inter', fontWeight: 500 }}
            >
              <option value="date" style={{ background: '#1E1E1E' }}>Date</option>
              <option value="price-low" style={{ background: '#1E1E1E' }}>Price: Low</option>
              <option value="price-high" style={{ background: '#1E1E1E' }}>Price: High</option>
              <option value="name" style={{ background: '#1E1E1E' }}>Name</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-4" style={{ scrollbarWidth: 'none' }}>
          {filters.map(f => {
            const key = f.toLowerCase();
            const isActive = filter === key;
            return (
              <button
                type="button"
                key={f}
                onClick={() => setFilter(key)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full transition-all"
                style={{
                  background: isActive ? '#D4A853' : '#141414',
                  border: `1px solid ${isActive ? '#D4A853' : '#1E1E1E'}`,
                  color: isActive ? '#0A0A0A' : '#6B6B6B',
                  fontSize: '13px',
                  fontFamily: 'Inter',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 mb-24">
          {sorted.map(product => {
            const isDown = product.currentPrice < product.savedPrice;
            const pct = Math.round(Math.abs((product.savedPrice - product.currentPrice) / product.savedPrice) * 100);
            return (
              <div
                key={product.id}
                role="button"
                tabIndex={0}
                onClick={() => onProductClick(product)}
                onKeyDown={(e) => e.key === 'Enter' && onProductClick(product)}
                className="flex items-center gap-3 rounded-2xl p-3 cursor-pointer active:scale-98 transition-transform"
                style={{ background: '#141414', border: '1px solid #1E1E1E' }}
              >
                <img src={product.image} alt={product.name} className="rounded-xl object-cover flex-shrink-0"
                  style={{ width: '60px', height: '60px' }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate" style={{ color: '#F5F0E8', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500 }}>
                      {product.name}
                    </p>
                    {product.hasAlert && <Bell size={12} color="#D4A853" />}
                  </div>
                  <span style={{
                    background: 'rgba(212, 168, 83, 0.1)', color: '#D4A853',
                    fontSize: '10px', padding: '2px 8px', borderRadius: '9999px',
                    fontFamily: 'Inter', fontWeight: 500, display: 'inline-block', marginTop: '3px'
                  }}>
                    {product.store}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <p style={{ color: '#D4A853', fontSize: '15px', fontFamily: 'DM Mono, monospace', fontWeight: 500 }}>
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
    </div>
  );
}
