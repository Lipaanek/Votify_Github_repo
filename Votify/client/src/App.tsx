import { BrowserRouter, Route, Routes } from 'react-router-dom';

import HomePage from './pages/home';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import VerifyPage from './pages/verify';
import DashboardPage from './pages/dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
