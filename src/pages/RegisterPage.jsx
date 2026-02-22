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
    onInputChange,
    onSubmit,
  } = useRegister();

  return (
    <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1>User Register</h1>

      <div style={{ marginBottom: '12px' }}>
        <Link to="/" style={{ color: '#0f62fe', fontWeight: 600 }}>
          Turniket sahifasiga qaytish
        </Link>
      </div>

      <StatusBanner status={status} warning="" matchedStudent={false} color="#1f2a44" />

      {isBootstrapping ? (
        <>
          <TurnstileSkeleton />
          <LoadingOverlay text="Register modeli yuklanmoqda..." />
        </>
      ) : (
        <>
          <CameraPanel
            webcamRef={webcamRef}
            canvasRef={null}
            videoConstraints={videoConstraints}
            onPlay={undefined}
            showCanvas={false}
          />

          <RegisterForm
            form={form}
            onInputChange={onInputChange}
            onSubmit={onSubmit}
            registering={registering}
            isLoadingUsers={false}
            modelsLoaded={modelsLoaded}
          />
        </>
      )}
    </div>
  );
}

export default RegisterPage;
