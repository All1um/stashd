import { LayoutGrid, Layers, Bell, User, Plus } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, alertCount }) {
  const tabs = [
    { id: 'home', icon: LayoutGrid, label: 'Home' },
    { id: 'lists', icon: Layers, label: 'Lists' },
    { id: 'add', icon: Plus, label: '' },
    { id: 'alerts', icon: Bell, label: 'Alerts' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40" style={{ background: '#0D0D0D', borderTop: '1px solid #1E1E1E' }}>
      <div className="flex items-center justify-around px-2 pb-safe" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
        {tabs.map((tab) => {
          if (tab.id === 'add') {
            return (
              <button
                type="button"
                key="add"
                onClick={() => setActiveTab('add')}
                className="flex items-center justify-center w-14 h-14 rounded-full -mt-5 shadow-2xl transition-transform active:scale-95"
                style={{ background: '#E8652B', boxShadow: '0 4px 24px rgba(232, 101, 43, 0.5)' }}
              >
                <Plus size={24} color="white" strokeWidth={2.5} />
              </button>
            );
          }

          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const triggeredCount = tab.id === 'alerts' ? alertCount : 0;

          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-1 py-2 px-3 min-w-[56px] transition-all"
            >
              <div className="relative">
                <Icon
                  size={22}
                  color={isActive ? '#E8652B' : '#6B6B6B'}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {triggeredCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center"
                    style={{ background: '#E74C3C', fontSize: '10px', fontFamily: 'Inter' }}>
                    {triggeredCount}
                  </span>
                )}
              </div>
              {tab.label && (
                <span style={{ fontSize: '10px', color: isActive ? '#E8652B' : '#6B6B6B', fontFamily: 'Inter', fontWeight: isActive ? 600 : 400 }}>
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
