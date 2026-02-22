function EntryLogs({ entryLogs }) {
  return (
    <div style={{ margin: '18px auto 0', maxWidth: '720px', textAlign: 'left' }}>
      <h3 style={{ marginBottom: '8px' }}>Oxirgi kirishlar</h3>
      {entryLogs.length === 0 ? (
        <div style={{ color: '#666' }}>Hozircha kirishlar yo'q.</div>
      ) : (
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {entryLogs.map((log) => (
            <li key={log.id} style={{ marginBottom: '4px' }}>
              {log.name} - {new Date(log.at).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EntryLogs;
