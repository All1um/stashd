import { Plus } from 'lucide-react';
import { mockLists, getListProducts, getListStats } from '../data/mockData';

export default function Lists({ onListClick }) {
  return (
    <div className="min-h-screen px-4" style={{ background: '#0A0A0A', paddingTop: 'max(20px, env(safe-area-inset-top, 20px))' }}>
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ color: '#F5F0E8', fontSize: '28px', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
          My Lists
        </h1>
        <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: '#E8652B' }}>
          <Plus size={14} color="white" strokeWidth={2.5} />
          <span style={{ color: 'white', fontSize: '13px', fontFamily: 'Inter', fontWeight: 600 }}>New List</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-24">
        {mockLists.map((list) => {
          const stats = getListStats(list.id);
          const products = getListProducts(list.id);
          const thumbs = products.slice(0, 4);

          return (
            <div
              key={list.id}
              role="button"
              tabIndex={0}
              onClick={() => onListClick(list)}
              onKeyDown={(e) => e.key === 'Enter' && onListClick(list)}
              className="rounded-2xl p-4 cursor-pointer active:scale-95 transition-transform"
              style={{ background: '#141414', border: '1px solid #1E1E1E' }}
            >
              <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden mb-3" style={{ height: '80px' }}>
                {thumbs.length > 0 ? thumbs.map((p, i) => (
                  <img key={i} src={p.image} alt="" className="w-full h-full object-cover" style={{ height: '38px' }} />
                )) : (
                  <div className="col-span-2 flex items-center justify-center" style={{ height: '80px', background: '#1E1E1E' }}>
                    <span style={{ fontSize: '32px' }}>{list.emoji}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: '16px' }}>{list.emoji}</span>
                <p style={{ color: '#F5F0E8', fontSize: '15px', fontFamily: 'Inter', fontWeight: 600 }} className="truncate">
                  {list.name}
                </p>
              </div>
              <p style={{ color: '#6B6B6B', fontSize: '12px', fontFamily: 'Inter', marginBottom: '4px' }}>
                {stats.count} items
              </p>
              <p style={{ color: '#D4A853', fontSize: '14px', fontFamily: 'DM Mono, monospace', fontWeight: 500 }}>
                ${stats.totalValue.toFixed(0)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
