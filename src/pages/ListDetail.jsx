import { useState, useEffect } from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';
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

export default function ListDetail({ list, onBack, onProductClick }) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [sortBy,   setSortBy]   = useState('date');
  const [filter,   setFilter]   = useState('all');

  useEffect(() => {
    if (!list?.id) { setLoading(false); return; }

    supabase
      .from('list_items')
      .select('products ( id, name, image_url, store_name, current_price, original_price, url, created_at )')
      .eq('list_id', list.id)
      .then(({ data }) => {
        setProducts((data ?? []).map(li => li.products).filter(Boolean));
        setLoading(false);
      });
  }, [list?.id]);

  const filters = ['All', 'Dropped', 'Increased'];

  const filtered = products.filter(p => {
    if (filter === 'all')       return true;
    if (filter === 'dropped')   return (p.current_price ?? 0) < (p.original_price ?? 0);
    if (filter === 'increased') return (p.current_price ?? 0) > (p.original_price ?? 0);
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-low')  return (a.current_price ?? 0) - (b.current_price ?? 0);
    if (sortBy === 'price-high') return (b.current_price ?? 0) - (a.current_price ?? 0);
    if (sortBy === 'name')       return (a.name ?? '').localeCompare(b.name ?? '');
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const totalCost = filtered.reduce((sum, p) => sum + (p.current_price ?? 0), 0);

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
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
          style={{ background: '#141414', border: '1px solid #1E1E1E' }}
        >
          <ArrowLeft size={18} color="#F5F0E8" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span style={{ fontSize: '20px' }}>{list.emoji}</span>
          <h1 className="truncate" style={{ color: '#F5F0E8', fontSize: '22px', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
            {list.name}
          </h1>
        </div>
      </div>

      <p style={{ color: '#D4A853', fontSize: '18px', fontFamily: 'DM Mono, monospace', fontWeight: 500, marginBottom: '16px', paddingLeft: '48px' }}>
        ${totalCost.toFixed(2)} total
      </p>

      {/* Sort + Filter row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
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

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0 ml-2"
          style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
          <span style={{ color: '#6B6B6B', fontSize: '12px', fontFamily: 'Inter' }}>Sort:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="outline-none"
            style={{ background: 'transparent', color: '#F5F0E8', fontSize: '12px', fontFamily: 'Inter', fontWeight: 500 }}
          >
            <option value="date"       style={{ background: '#1E1E1E' }}>Date</option>
            <option value="price-low"  style={{ background: '#1E1E1E' }}>Price: Low</option>
            <option value="price-high" style={{ background: '#1E1E1E' }}>Price: High</option>
            <option value="name"       style={{ background: '#1E1E1E' }}>Name</option>
          </select>
        </div>
      </div>

      {loading ? <GoldSpinner /> : (
        <>
          {sorted.length === 0 ? (
            <div className="text-center py-20">
              <p style={{ fontSize: '40px', marginBottom: '12px' }}>🛒</p>
              <p style={{ color: '#F5F0E8', fontSize: '18px', fontFamily: 'Playfair Display, serif', fontWeight: 600, marginBottom: '8px' }}>
                No products yet.
              </p>
              <p style={{ color: '#6B6B6B', fontSize: '14px', fontFamily: 'Inter' }}>
                Add products to this list using the + button.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pb-40">
              {sorted.map(product => {
                const curr = product.current_price  ?? 0;
                const orig = product.original_price ?? 0;
                const isDown = curr < orig;
                const pct    = orig > 0 ? Math.round(Math.abs((orig - curr) / orig) * 100) : 0;

                return (
                  <div
                    key={product.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onProductClick(product)}
                    onKeyDown={e => e.key === 'Enter' && onProductClick(product)}
                    className="flex items-center gap-3 rounded-2xl p-3 cursor-pointer active:scale-95 transition-transform"
                    style={{ background: '#141414', border: '1px solid #1E1E1E' }}
                  >
                    <ProductImage
                      src={product.image_url}
                      alt={product.name ?? ''}
                      size="md"
                      className="rounded-xl object-cover flex-shrink-0"
                      style={{ width: '60px', height: '60px' }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate" style={{ color: '#F5F0E8', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500 }}>
                          {product.name ?? 'Unnamed product'}
                        </p>
                        {product.has_alert && <Bell size={12} color="#D4A853" />}
                      </div>
                      {product.store_name && (
                        <span style={{
                          background: 'rgba(212,168,83,0.1)', color: '#D4A853',
                          fontSize: '10px', padding: '2px 8px', borderRadius: '9999px',
                          fontFamily: 'Inter', fontWeight: 500, display: 'inline-block', marginTop: '3px',
                        }}>
                          {product.store_name}
                        </span>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p style={{ color: '#D4A853', fontSize: '15px', fontFamily: 'DM Mono, monospace', fontWeight: 500 }}>
                        ${curr.toFixed(2)}
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
          )}
        </>
      )}
    </div>
  );
}
