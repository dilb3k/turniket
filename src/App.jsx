import { Navigate, Route, Routes } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import TurnstilePage from './pages/TurnstilePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<TurnstilePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
