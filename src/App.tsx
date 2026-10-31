import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Nav from './components/Nav';
import Landing from './pages/Landing';
import Login from './pages/Login';
import HotelDashboard from './pages/HotelDashboard';
import BancoDashboard from './pages/BancoDashboard';
import DriverView from './pages/DriverView';
import './styles/global.css';

function RequireAuth({ children, role }: { children: React.ReactElement; role?: string }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<><Nav /><Landing /></>} />
      <Route path="/login" element={<Login />} />
      <Route path="/hotel" element={
        <RequireAuth role="hotel">
          <><Nav /><HotelDashboard /></>
        </RequireAuth>
      } />
      <Route path="/banco" element={
        <RequireAuth role="bank">
          <><Nav /><BancoDashboard /></>
        </RequireAuth>
      } />
      <Route path="/c/:token" element={<DriverView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
