import { memo } from 'react';

function MatchedInfo({ matchedStudent, recognizedAt }) {
  if (!matchedStudent || !recognizedAt) {
    return null;
  }

  return (
    <section className="matched-card">
      <div className="matched-title">Kirish tasdiqlandi</div>
      <div className="matched-user">{matchedStudent}</div>
      <div className="matched-time">{recognizedAt.toLocaleString()}</div>
    </section>
  );
}

export default memo(MatchedInfo);
