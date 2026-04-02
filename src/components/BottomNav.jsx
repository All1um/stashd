import { LayoutGrid, Layers, Bell, User, Plus, Search } from 'lucide-react';

// Tabs without the FAB slot — spacer holds its position in the flex row
const LEFT_TABS  = [
  { id: 'home',    icon: LayoutGrid, label: 'Assets' },
  { id: 'lists',   icon: Layers,     label: 'Lists'  },
];
const RIGHT_TABS = [
  { id: 'discover', icon: Search, label: null      },
  { id: 'alerts',   icon: Bell,   label: 'Alerts'  },
  { id: 'profile',  icon: User,   label: 'Profile' },
];

function NavTab({ tab, isActive, badge, onClick }) {
  const Icon = tab.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 pb-1 pt-2 px-3 min-w-[52px] transition-all"
    >
      <div className="relative">
        <Icon
          size={24}
          color={isActive ? '#D4A853' : '#6B6B6B'}
          strokeWidth={isActive ? 2 : 1.5}
        />
        {badge > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: '#E74C3C', color: 'white', fontSize: '10px', fontFamily: 'Inter' }}
          >
            {badge}
          </span>
        )}
      </div>
      {tab.label ? (
        <span style={{
          fontSize: '10px',
          color: isActive ? '#D4A853' : '#6B6B6B',
          fontFamily: 'Inter',
          fontWeight: isActive ? 600 : 400,
          lineHeight: 1,
        }}>
          {tab.label}
        </span>
      ) : (
        <span style={{ height: '12px', display: 'block' }} />
      )}
    </button>
  );
}

export default function BottomNav({ activeTab, setActiveTab, alertCount }) {
  return (
    <nav
      style={{
        position:      'fixed',
        bottom:        0,
        left:          0,
        right:         0,
        zIndex:        40,
        overflow:      'visible',          /* REQUIRED: lets FAB protrude above the bar */
        background:    '#0D0D0D',
        borderTop:     '1px solid #1E1E1E',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}
    >
      {/* ── Docked FAB — absolutely positioned, protrudes above the bar ── */}
      <button
        type="button"
        onClick={() => setActiveTab('add')}
        className="transition-transform active:scale-95"
        style={{
          position:       'absolute',
          left:           '50%',
          transform:      'translateX(-50%)',
          top:            '-28px',
          zIndex:         50,
          width:          '56px',
          height:         '56px',
          borderRadius:   '50%',
          background:     '#E8652B',
          boxShadow:      '0 4px 24px rgba(232,101,43,0.6), 0 0 0 4px #0D0D0D',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          touchAction:    'manipulation',
          cursor:         'pointer',
        }}
      >
        <Plus size={24} color="white" strokeWidth={2.5} />
      </button>

      {/* ── Tab row — spacer in center holds FAB footprint ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingLeft: '8px', paddingRight: '8px' }}>
        {LEFT_TABS.map(tab => (
          <NavTab
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            badge={0}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}

        {/* Spacer for FAB */}
        <div style={{ width: '56px', flexShrink: 0 }} />

        {RIGHT_TABS.map(tab => (
          <NavTab
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            badge={tab.id === 'alerts' ? alertCount : 0}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>
    </nav>
  );
}
