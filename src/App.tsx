import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ActivityProvider } from './context/ActivityContext';
import Nav from './components/Nav';
import Login from './pages/Login';
import HotelDashboard from './pages/HotelDashboard';
import BancoDashboard from './pages/BancoDashboard';
import DriverView from './pages/DriverView';
import './styles/global.css';

/** Blocks until Firebase has resolved the initial auth state. */
function AuthGate({ children }: { children: React.ReactElement }) {
  const { ready } = useAuth();
  if (!ready) return null; // or a tiny spinner
  return children;
}

/** If authenticated, redirect / to the correct dashboard. */
function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ong') return <Navigate to="/banco" replace />;
  return <Navigate to="/hotel" replace />;
}

function RequireRole({ role, children }: { role: 'hotel' | 'ong'; children: React.ReactElement }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthGate><RootRedirect /></AuthGate>} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/hotel"
        element={
          <AuthGate>
            <RequireRole role="hotel">
              <><Nav /><HotelDashboard /></>
            </RequireRole>
          </AuthGate>
        }
      />
      <Route
        path="/banco"
        element={
          <AuthGate>
            <RequireRole role="ong">
              <><Nav /><BancoDashboard /></>
            </RequireRole>
          </AuthGate>
        }
      />
      <Route path="/c/:token" element={<DriverView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ActivityProvider>
          <AppRoutes />
        </ActivityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
