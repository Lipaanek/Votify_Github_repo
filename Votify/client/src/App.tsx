import { BrowserRouter, Route, Routes } from 'react-router-dom';

import HomePage from './pages/home';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import VerifyPage from './pages/verify';
import DashboardPage from './pages/dashboard';
import GroupPage from './pages/group';
import CreateGroupPage from './pages/createGroup';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/group/:groupId" element={<GroupPage />} />
        <Route path="/create-group" element={<CreateGroupPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
