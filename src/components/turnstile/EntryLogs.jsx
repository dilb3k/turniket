import { memo } from 'react';

function EntryLogs({ entryLogs }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Oxirgi kirishlar</h3>
      </div>

      {entryLogs.length === 0 ? (
        <div className="muted">Hozircha session kirishlari yo'q.</div>
      ) : (
        <ul className="entry-list">
          {entryLogs.map((log) => (
            <li key={log.id} className="entry-item">
              <span>{log.name}</span>
              <time>{new Date(log.at).toLocaleString()}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default memo(EntryLogs);
