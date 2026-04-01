import { Search } from 'lucide-react';
import StatsGrid from '../components/dashboard/StatsGrid';
import PriceDropsScroll from '../components/dashboard/PriceDropsScroll';
import RecentlySaved from '../components/dashboard/RecentlySaved';
import { mockProducts, mockAlerts, recentPriceDrops } from '../data/mockData';

export default function Dashboard({ onProductClick }) {
  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A' }}>
      <div className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ height: '320px', zIndex: 0 }}>
        <div style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(180, 100, 220, 0.07) 0%, rgba(240, 160, 120, 0.04) 50%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
      </div>

      <div className="relative z-10 px-4 pt-safe" style={{ paddingTop: 'max(20px, env(safe-area-inset-top, 20px))' }}>
        <div className="flex items-center justify-between mb-6">
          <h1 style={{ color: '#F5F0E8', fontSize: '28px', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
            Stashd
          </h1>
          <div className="flex items-center gap-3">
            <button type="button" className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
              <Search size={16} color="#6B6B6B" />
            </button>
            <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #D4A853, #E8652B)' }}>
              <span style={{ color: 'white', fontSize: '14px', fontFamily: 'Inter', fontWeight: 600 }}>A</span>
            </div>
          </div>
        </div>

        <StatsGrid products={mockProducts} alerts={mockAlerts} />
        <PriceDropsScroll products={recentPriceDrops} onProductClick={onProductClick} />
        <RecentlySaved products={mockProducts} onProductClick={onProductClick} />
      </div>
    </div>
  );
}
