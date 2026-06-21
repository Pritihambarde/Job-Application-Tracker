export default function StatsPanel({ stats }) {
  if (!stats) return null;

  const items = [
    { label: 'Total applications', value: stats.total },
    { label: 'Response rate', value: `${stats.responseRate}%`, hint: 'moved past Applied' },
    { label: 'Offer rate', value: `${stats.offerRate}%` },
    {
      label: 'Avg. days to response',
      value: stats.avgDaysToResponse !== null ? stats.avgDaysToResponse : '—',
    },
  ];

  return (
    <div className="stats-panel">
      {items.map((item) => (
        <div className="stat-card" key={item.label}>
          <span className="stat-value">{item.value}</span>
          <span className="stat-label">{item.label}</span>
          {item.hint && <span className="stat-hint">{item.hint}</span>}
        </div>
      ))}
      {stats.staleCount > 0 && (
        <div className="stat-card stat-card-alert">
          <span className="stat-value">{stats.staleCount}</span>
          <span className="stat-label">Needs a follow-up</span>
          <span className="stat-hint">Applied 7+ days ago, no update</span>
        </div>
      )}
    </div>
  );
}
