import { memo } from 'react';

function StatusBanner({ status, warning, matchedStudent, color }) {
  const resolvedColor = color || (matchedStudent ? '#0f7b3a' : '#9e2a2b');

  return (
    <section className="status-wrap">
      <div className="status-main" style={{ color: resolvedColor }}>
        {status}
      </div>

      {warning && <div className="status-warning">{warning}</div>}
    </section>
  );
}

export default memo(StatusBanner);
