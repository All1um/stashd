import { Bell, ChevronRight, Heart, Shield, HelpCircle, LogOut, Star } from 'lucide-react';

export default function Profile() {
  const menuItems = [
    { icon: Bell, label: 'Notification Preferences', sub: 'Push, email alerts' },
    { icon: Heart, label: 'Saved Stores', sub: '12 stores tracked' },
    { icon: Star, label: 'Upgrade to Pro', sub: 'Unlimited alerts & history', gold: true },
    { icon: Shield, label: 'Privacy & Data', sub: null },
    { icon: HelpCircle, label: 'Help & Support', sub: null },
    { icon: LogOut, label: 'Sign Out', sub: null, danger: true },
  ];

  return (
    <div className="min-h-screen px-4" style={{ background: '#0A0A0A', paddingTop: 'max(20px, env(safe-area-inset-top, 20px))' }}>
      <h1 className="mb-6" style={{ color: '#F5F0E8', fontSize: '28px', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
        Profile
      </h1>

      <div className="rounded-2xl p-5 mb-6 flex items-center gap-4" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #D4A853, #E8652B)' }}>
          <span style={{ color: 'white', fontSize: '24px', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>A</span>
        </div>
        <div>
          <p style={{ color: '#F5F0E8', fontSize: '18px', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>Alex Johnson</p>
          <p style={{ color: '#6B6B6B', fontSize: '13px', fontFamily: 'Inter' }}>alex@email.com</p>
          <span style={{
            background: 'rgba(212, 168, 83, 0.1)', color: '#D4A853',
            fontSize: '10px', padding: '2px 10px', borderRadius: '9999px',
            fontFamily: 'Inter', fontWeight: 600, display: 'inline-block', marginTop: '4px'
          }}>
            Free Plan
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Saved', value: '20' },
          { label: 'Alerts', value: '3' },
          { label: 'Saved', value: '$824' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-3 text-center" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
            <p style={{ color: '#D4A853', fontSize: '20px', fontFamily: 'DM Mono, monospace', fontWeight: 500 }}>{s.value}</p>
            <p style={{ color: '#6B6B6B', fontSize: '11px', fontFamily: 'Inter' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden mb-24" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button type="button" key={i} className="w-full flex items-center gap-3 px-4 py-4 transition-all active:opacity-70"
              style={{ borderBottom: i < menuItems.length - 1 ? '1px solid #1E1E1E' : 'none' }}>
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
