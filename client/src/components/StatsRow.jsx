const ORDER = ['New', 'Contacted', 'Qualified', 'Lost'];

export default function StatsRow({ stats, activeStatus, onPick }) {
  const cards = [{ key: '', label: 'All leads', value: stats?.total }].concat(
    ORDER.map((s) => ({ key: s, label: s, value: stats?.byStatus[s] })),
  );

  return (
    <section className="stats" aria-label="Lead counts by status">
      {cards.map((c) => (
        <button
          key={c.label}
          type="button"
          className={`stat stat-${(c.key || 'all').toLowerCase()}${activeStatus === c.key ? ' is-active' : ''}`}
          onClick={() => onPick(c.key)}
          aria-pressed={activeStatus === c.key}
        >
          <span className="stat-label">{c.label}</span>
          <span className="stat-value">{c.value ?? '–'}</span>
        </button>
      ))}
    </section>
  );
}
