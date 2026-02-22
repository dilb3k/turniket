function StatusBanner({ status, warning, matchedStudent, color }) {
  const resolvedColor = color || (matchedStudent ? 'green' : '#b00020');

  return (
    <>
      <div
        style={{
          color: resolvedColor,
          fontSize: '1.1rem',
          margin: '12px 0',
          fontWeight: 600,
        }}
      >
        {status}
      </div>

      {warning && (
        <div style={{ color: '#8a6d3b', marginBottom: '8px', fontSize: '0.95rem' }}>
          {warning}
        </div>
      )}
    </>
  );
}

export default StatusBanner;
