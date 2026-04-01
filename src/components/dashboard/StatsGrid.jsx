export default function StatsGrid({ products, alerts }) {
    const totalValue = products.reduce((sum, p) => sum + p.currentPrice, 0);
    const activeAlerts = alerts.filter(a => a.status === 'active').length;
    const dropsThisWeek = products.filter(p => p.currentPrice < p.savedPrice).length;

    const stats = [
      { label: 'Items Saved', value: products.length, color: '#F5F0E8', mono: false },
      { label: 'Total Value', value: `$${totalValue.toFixed(0)}`, color: '#D4A853', mono: true },
      { label: 'Active Alerts', value: activeAlerts, color: '#F5F0E8', mono: false },
      { label: 'Drops This Week', value: dropsThisWeek, color: dropsThisWeek > 0 ? '#2ECC71' : '#6B6B6B', mono: false },
    ];

    return (
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
            <p style={{ color: '#6B6B6B', fontSize: '12px', fontFamily: 'Inter', fontWeight: 500, marginBottom: '6px', letterSpacing: '0.02em' }}>
              {stat.label}
            </p>
            <p style={{
              color: stat.color,
              fontSize: '24px',
              fontWeight: 700,
              fontFamily: stat.mono ? 'DM Mono, monospace' : 'Playfair Display, serif',
              lineHeight: 1
            }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    );
  }
