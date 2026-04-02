// src/components/StashdPlaceholder.jsx
// Size map: sm=40px thumbnail, md=60px list item, lg=full-width hero (220px tall)
const SIZE_MAP = {
  sm: { dim: 40,    circle: 18, letter: 14, sub: false },
  md: { dim: 60,    circle: 24, letter: 18, sub: false },
  lg: { dim: '100%', height: 220, circle: 36, letter: 28, sub: true  },
};

export default function StashdPlaceholder({ size = 'md', className, style }) {
  const s = SIZE_MAP[size] ?? SIZE_MAP.md;
  return (
    <div
      className={className}
      style={{
        width:           s.dim,
        height:          s.height ?? s.dim,
        background:      '#141414',
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        gap:             '6px',
        flexShrink:      0,
        ...style,
      }}
    >
      <div style={{
        width:        s.circle * 2,
        height:       s.circle * 2,
        borderRadius: '50%',
        background:   'rgba(212,168,83,0.08)',
        border:       '1px solid rgba(212,168,83,0.2)',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize:   s.letter,
          color:      '#D4A853',
          fontWeight: 700,
          lineHeight: 1,
          userSelect: 'none',
        }}>
          S
        </span>
      </div>
      {s.sub && (
        <span style={{
          fontFamily:    'DM Mono, monospace',
          fontSize:      8,
          color:         '#6B6B6B',
          letterSpacing: '0.15em',
          userSelect:    'none',
        }}>
          STASHD
        </span>
      )}
    </div>
  );
}
