import { Link } from 'react-router-dom';
import CameraPanel from '../components/turnstile/CameraPanel';
import EntryLogs from '../components/turnstile/EntryLogs';
import LoadingOverlay from '../components/turnstile/LoadingOverlay';
import MatchedInfo from '../components/turnstile/MatchedInfo';
import StatusBanner from '../components/turnstile/StatusBanner';
import TurnstileSkeleton from '../components/turnstile/TurnstileSkeleton';
import { useTurnstile } from '../hooks/useTurnstile';

function TurnstilePage() {
  const {
    webcamRef,
    canvasRef,
    status,
    warning,
    users,
    matchedStudent,
    recognizedAt,
    entryLogs,
    isBootstrapping,
    videoConstraints,
    handleVideoPlay,
  } = useTurnstile();

  return (
    <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1>Maktab Turniketi - Face Recognition</h1>

      <div style={{ marginBottom: '12px' }}>
        <Link to="/register" style={{ color: '#0f62fe', fontWeight: 600 }}>
          Register sahifasiga o'tish
        </Link>
      </div>

      <StatusBanner status={status} warning={warning} matchedStudent={matchedStudent} />

      {isBootstrapping ? (
        <>
          <TurnstileSkeleton />
          <LoadingOverlay text="Model va userlar yuklanmoqda..." />
        </>
      ) : (
        <>
          <CameraPanel
            webcamRef={webcamRef}
            canvasRef={canvasRef}
            videoConstraints={videoConstraints}
            onPlay={handleVideoPlay}
          />

          <MatchedInfo matchedStudent={matchedStudent} recognizedAt={recognizedAt} />

          <div style={{ marginTop: '20px', color: '#555', fontSize: '0.95rem' }}>
            Bazadagi userlar soni: <strong>{users.length}</strong>
          </div>

          <EntryLogs entryLogs={entryLogs} />
        </>
      )}
    </div>
  );
}

export default TurnstilePage;
