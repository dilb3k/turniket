function TurnstileSkeleton() {
  return (
    <div style={{ marginTop: '10px' }}>
      <div
        className="skeleton"
        style={{ width: '720px', maxWidth: '100%', height: '560px', borderRadius: '12px', margin: '0 auto' }}
      />

      <div style={{ margin: '28px auto 0', maxWidth: '480px', display: 'grid', gap: '10px' }}>
        <div className="skeleton" style={{ width: '70%', height: '24px', margin: '0 auto', borderRadius: '8px' }} />
        <div className="skeleton" style={{ width: '100%', height: '42px', borderRadius: '8px' }} />
        <div className="skeleton" style={{ width: '100%', height: '42px', borderRadius: '8px' }} />
        <div className="skeleton" style={{ width: '100%', height: '42px', borderRadius: '8px' }} />
        <div className="skeleton" style={{ width: '100%', height: '42px', borderRadius: '8px' }} />
      </div>

      <div style={{ margin: '18px auto 0', maxWidth: '720px' }}>
        <div className="skeleton" style={{ width: '220px', height: '22px', borderRadius: '8px', marginBottom: '10px' }} />
        <div className="skeleton" style={{ width: '100%', height: '18px', borderRadius: '6px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '85%', height: '18px', borderRadius: '6px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '92%', height: '18px', borderRadius: '6px' }} />
      </div>
    </div>
  );
}

export default TurnstileSkeleton;
