import { useEffect, useState } from 'react';
import { Bell, ChevronRight, Heart, Shield, HelpCircle, LogOut, Star } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';

export default function Profile() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ saved: '—', alerts: '—', savings: '—' });

  useEffect(() => {
    if (!user) return;

    async function fetchStats() {
      const [productsRes, alertsRes] = await Promise.all([
        supabase
          .from('products')
          .select('original_price, current_price')
          .eq('user_id', user.id),
        supabase
          .from('price_alerts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_active', true),
      ]);

      const products = productsRes.data ?? [];
      const totalSavings = products.reduce((acc, p) => {
        const diff = (p.original_price ?? 0) - (p.current_price ?? 0);
        return acc + (diff > 0 ? diff : 0);
      }, 0);

      setStats({
        saved: String(products.length),
        alerts: String(alertsRes.count ?? 0),
        savings: `$${totalSavings.toFixed(0)}`,
      });
    }

    fetchStats();
  }, [user]);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User';

  const avatarLetter = displayName[0].toUpperCase();

  const menuItems = [
    { icon: Bell,      label: 'Notification Preferences', sub: 'Push, email alerts' },
    { icon: Heart,     label: 'Saved Stores',             sub: 'Tracked retailers'  },
    { icon: Star,      label: 'Upgrade to Pro',           sub: 'Unlimited alerts & history', gold: true },
    { icon: Shield,    label: 'Privacy & Data',           sub: null },
    { icon: HelpCircle,label: 'Help & Support',           sub: null },
    { icon: LogOut,    label: 'Sign Out',                 sub: null, danger: true, action: logout },
  ];

  return (
    <div className="min-h-screen px-4" style={{ background: '#0A0A0A', paddingTop: 'max(20px, env(safe-area-inset-top, 20px))' }}>
      <h1 className="mb-6" style={{ color: '#F5F0E8', fontSize: '28px', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
        Profile
      </h1>

      {/* User card */}
      <div className="rounded-2xl p-5 mb-6 flex items-center gap-4" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #D4A853, #E8652B)' }}>
          <span style={{ color: 'white', fontSize: '24px', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
            {avatarLetter}
          </span>
        </div>
        <div>
          <p style={{ color: '#F5F0E8', fontSize: '18px', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
            {displayName}
          </p>
          <p style={{ color: '#6B6B6B', fontSize: '12px', fontFamily: 'DM Mono, monospace' }}>{user?.email}</p>
          <span style={{
            background: 'rgba(212, 168, 83, 0.1)', color: '#D4A853',
            fontSize: '10px', padding: '2px 10px', borderRadius: '9999px',
            fontFamily: 'Inter', fontWeight: 600, display: 'inline-block', marginTop: '4px',
          }}>
            Free Plan
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Saved',   value: stats.saved   },
          { label: 'Alerts',  value: stats.alerts  },
          { label: 'Savings', value: stats.savings },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
            <p style={{ color: '#D4A853', fontSize: '20px', fontFamily: 'DM Mono, monospace', fontWeight: 500 }}>{s.value}</p>
            <p style={{ color: '#6B6B6B', fontSize: '11px', fontFamily: 'Inter' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="rounded-2xl overflow-hidden mb-24" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              type="button"
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-3 px-4 py-4 transition-all active:opacity-70"
              style={{ borderBottom: i < menuItems.length - 1 ? '1px solid #1E1E1E' : 'none' }}
            >
              <Icon size={18} color={item.danger ? '#E74C3C' : item.gold ? '#D4A853' : '#6B6B6B'} />
              <div className="flex-1 text-left">
                <p style={{ color: item.danger ? '#E74C3C' : '#F5F0E8', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500 }}>
                  {item.label}
                </p>
                {item.sub && <p style={{ color: '#6B6B6B', fontSize: '12px', fontFamily: 'Inter' }}>{item.sub}</p>}
              </div>
              {!item.danger && <ChevronRight size={16} color="#6B6B6B" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
