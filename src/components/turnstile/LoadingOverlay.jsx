function LoadingOverlay({ text = 'Yuklanmoqda...' }) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-card">
        <span className="loading-spinner" aria-hidden="true" />
        <span>{text}</span>
      </div>
    </div>
  );
}

export default LoadingOverlay;
