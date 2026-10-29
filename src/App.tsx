// src/App.tsx — Enrutador principal de NutriMesh

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import Landing      from './pages/Landing';
import Login        from './pages/Login';
import HotelDashboard from './pages/HotelDashboard';
import BancoDashboard from './pages/BancoDashboard';
import DriverView   from './pages/DriverView';
import ImpactPanel  from './pages/ImpactPanel';
import AdminPanel   from './pages/AdminPanel';

import './styles/global.css';

// ---- Guard de autenticación y rol ----
function RequireAuth({ roles, children }: { roles?: string[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login', { state: { from: location }, replace: true });
      return;
    }
    if (roles && !roles.includes(user.role)) {
      // Redirigir al dashboard correcto
      const dest = user.role === 'hotel' ? '/hotel' : user.role === 'coordinator' ? '/banco' : '/admin';
      navigate(dest, { replace: true });
    }
  }, [user, loading, roles, navigate, location]);

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!user) return null;
  if (roles && !roles.includes(user.role)) return null;
  return <>{children}</>;
}

// ---- Redirigir si ya está logueado ----
function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (user) {
    const dest = user.role === 'hotel' ? '/hotel' : user.role === 'coordinator' ? '/banco' : '/admin';
    return <Navigate to={dest} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Público */}
      <Route path="/"       element={<Landing />} />
      <Route path="/login"  element={<PublicOnly><Login /></PublicOnly>} />

      {/* Chofer — sin auth */}
      <Route path="/c/:token" element={<DriverView />} />

      {/* Hotel */}
      <Route path="/hotel" element={
        <RequireAuth roles={['hotel', 'admin']}>
          <HotelDashboard />
        </RequireAuth>
      } />

      {/* Banco */}
      <Route path="/banco" element={
        <RequireAuth roles={['coordinator', 'admin']}>
          <BancoDashboard />
        </RequireAuth>
      } />

      {/* Impacto */}
      <Route path="/impacto" element={
        <RequireAuth roles={['coordinator', 'admin']}>
          <ImpactPanel />
        </RequireAuth>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <RequireAuth roles={['admin']}>
          <AdminPanel />
        </RequireAuth>
      } />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
