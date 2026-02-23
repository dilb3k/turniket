import { Link } from 'react-router-dom';
import CameraPanel from '../components/turnstile/CameraPanel';
import LoadingOverlay from '../components/turnstile/LoadingOverlay';
import RegisterForm from '../components/turnstile/RegisterForm';
import StatusBanner from '../components/turnstile/StatusBanner';
import TurnstileSkeleton from '../components/turnstile/TurnstileSkeleton';
import { useRegister } from '../hooks/useRegister';

function RegisterPage() {
  const {
    webcamRef,
    status,
    form,
    registering,
    modelsLoaded,
    isBootstrapping,
    videoConstraints,
    classQuickPicks,
    onInputChange,
    onClassQuickPick,
    onSubmit,
  } = useRegister();

  return (
    <main className="page-shell">
      <header className="page-hero">
        <div>
          <p className="eyebrow">Enrollment</p>
          <h1>User Register</h1>
          <p className="subtext">Yangi o'quvchini xavfsiz va tez ro'yxatdan o'tkazish</p>
        </div>
        <Link to="/" className="btn btn-neutral">
          Turniket paneliga qaytish
        </Link>
      </header>

      <StatusBanner status={status} warning="" matchedStudent={false} color="#1f2a44" />

      {isBootstrapping ? (
        <>
          <TurnstileSkeleton />
          <LoadingOverlay text="Register modeli yuklanmoqda..." />
        </>
      ) : (
        <section className="main-grid register-grid">
          <div className="stack-col">
            <CameraPanel
              webcamRef={webcamRef}
              canvasRef={null}
              videoConstraints={videoConstraints}
              onPlay={undefined}
              showCanvas={false}
            />
          </div>

          <div className="stack-col">
            <RegisterForm
              form={form}
              onInputChange={onInputChange}
              onClassQuickPick={onClassQuickPick}
              classQuickPicks={classQuickPicks}
              onSubmit={onSubmit}
              registering={registering}
              isLoadingUsers={false}
              modelsLoaded={modelsLoaded}
            />
          </div>
        </section>
      )}
    </main>
  );
}

export default RegisterPage;
