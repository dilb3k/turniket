import { Link } from 'react-router-dom';
import CameraPanel from '../components/turnstile/CameraPanel';
import EntryLogs from '../components/turnstile/EntryLogs';
import LoadingOverlay from '../components/turnstile/LoadingOverlay';
import MatchedInfo from '../components/turnstile/MatchedInfo';
import StatsGrid from '../components/turnstile/StatsGrid';
import StatusBanner from '../components/turnstile/StatusBanner';
import TopUsers from '../components/turnstile/TopUsers';
import TurnstileActions from '../components/turnstile/TurnstileActions';
import TurnstileSkeleton from '../components/turnstile/TurnstileSkeleton';
import UsersDirectory from '../components/turnstile/UsersDirectory';
import { useTurnstile } from '../hooks/useTurnstile';

function downloadCsv(filename, rows) {
  const header = ['id', 'userId', 'name', 'at'];
  const lines = [header.join(',')];

  rows.forEach((row) => {
    const values = [row.id, row.userId, row.name, row.at].map((value) => {
      const escaped = String(value ?? '').replaceAll('"', '""');
      return `"${escaped}"`;
    });

    lines.push(values.join(','));
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

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
    topUsers,
    stats,
    isScanning,
    isBootstrapping,
    videoConstraints,
    handleVideoPlay,
    toggleScanning,
    refreshUsers,
    clearEntryLogs,
  } = useTurnstile();

  const handleExportLogs = () => {
    if (!entryLogs.length) {
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 19).replaceAll(':', '-');
    downloadCsv(`turnstile-logs-${timestamp}.csv`, entryLogs);
  };

  return (
    <main className="page-shell">
      <header className="page-hero">
        <div>
          <p className="eyebrow">Realtime Security</p>
          <h1>Maktab Turniketi</h1>
          <p className="subtext">Kirishlarni avtomatik nazorat, statistika va monitoring paneli</p>
        </div>
        <Link to="/register" className="btn btn-primary">
          Register sahifasi
        </Link>
      </header>

      <StatusBanner status={status} warning={warning} matchedStudent={matchedStudent} />

      <StatsGrid stats={stats} />

      <TurnstileActions
        isScanning={isScanning}
        onToggleScanning={toggleScanning}
        onRefreshUsers={refreshUsers}
        onClearLogs={clearEntryLogs}
        onExportLogs={handleExportLogs}
      />

      {isBootstrapping ? (
        <>
          <TurnstileSkeleton />
          <LoadingOverlay text="Model va userlar yuklanmoqda..." />
        </>
      ) : (
        <section className="main-grid">
          <div className="stack-col">
            <CameraPanel
              webcamRef={webcamRef}
              canvasRef={canvasRef}
              videoConstraints={videoConstraints}
              onPlay={handleVideoPlay}
            />
            <MatchedInfo matchedStudent={matchedStudent} recognizedAt={recognizedAt} />
            <EntryLogs entryLogs={entryLogs} />
          </div>

          <div className="stack-col">
            <UsersDirectory users={users} />
            <TopUsers users={topUsers} />
          </div>
        </section>
      )}
    </main>
  );
}

export default TurnstilePage;
