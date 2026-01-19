import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import WalletPage from './pages/WalletPage';
import MarketsPage from './pages/MarketsPage';
import TradePage from './pages/TradePage';
import CryptoDashboardPage from './pages/CryptoDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

import ToastContainer from './components/ui/ToastContainer';

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        {/* public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/markets" element={<MarketsPage />} />
          <Route path="/trade/:symbol" element={<TradePage />} />
          <Route path="/crypto" element={<CryptoDashboardPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;