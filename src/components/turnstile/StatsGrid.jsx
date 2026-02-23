import { memo } from 'react';

function StatsGrid({ stats }) {
  const cards = [
    { label: 'Jami user', value: stats.totalUsers },
    { label: 'Yaroqli descriptor', value: stats.validDescriptors },
    { label: 'Noto\'g\'ri descriptor', value: stats.invalidDescriptors },
    { label: 'Bugun o\'tganlar', value: stats.passedToday },
    { label: 'Session kirishlar', value: stats.sessionEntries },
    { label: 'Session unique', value: stats.uniqueSessionUsers },
    { label: 'Noma\'lum urinish', value: stats.unknownAttempts },
    {
      label: 'Oxirgi sync',
      value: stats.lastSyncAt ? new Date(stats.lastSyncAt).toLocaleTimeString() : '-',
    },
  ];

  return (
    <section className="stats-grid">
      {cards.map((card) => (
        <article key={card.label} className="stats-card">
          <div className="stats-label">{card.label}</div>
          <div className="stats-value">{card.value}</div>
        </article>
      ))}
    </section>
  );
}

export default memo(StatsGrid);
