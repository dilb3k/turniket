import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const TurnstilePage = lazy(() => import('./pages/TurnstilePage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

function RouteFallback() {
  return (
    <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'Segoe UI, sans-serif' }}>
      Sahifa yuklanmoqda...
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<TurnstilePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
