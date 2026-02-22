function MatchedInfo({ matchedStudent, recognizedAt }) {
  if (!matchedStudent || !recognizedAt) {
    return null;
  }

  return (
    <div style={{ marginTop: '18px', fontSize: '1.2rem', color: 'green' }}>
      <div>
        Kirish tasdiqlandi: <strong>{matchedStudent}</strong>
      </div>
      <div>
        Vaqt: <strong>{recognizedAt.toLocaleString()}</strong>
      </div>
    </div>
  );
}

export default MatchedInfo;
