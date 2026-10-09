import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientApp   from './pages/patient/PatientApp';
import DoctorApp    from './pages/doctor/DoctorApp';
import AdminApp     from './pages/admin/AdminApp';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100vh', gap: 16,
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(99,102,241,.3)',
        animation: 'float 2s ease-in-out infinite',
      }}>
        <div className="spinner" style={{ width: 22, height: 22 }} />
      </div>
      <p style={{
        color: '#94a3b8', fontSize: '.85rem', fontWeight: 500,
        fontFamily: 'Inter, system-ui, sans-serif',
        animation: 'pulse 2s ease-in-out infinite',
      }}>
        Loading MyDoctor...
      </p>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return <Navigate to={user.role === 'DOCTOR' ? '/doctor' : '/patient'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.87rem',
              borderRadius: '12px',
              background: '#fff',
              boxShadow: '0 10px 40px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.06)',
              border: '1px solid rgba(226,232,240,.6)',
              padding: '12px 16px',
              fontWeight: 500,
            },
            success: {
              iconTheme: { primary: '#6366f1', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#f43f5e', secondary: '#fff' },
            },
          }}
        />
        <Routes>
          <Route path="/"         element={<RootRedirect />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/patient/*" element={
            <ProtectedRoute role="PATIENT"><PatientApp /></ProtectedRoute>
          } />
          <Route path="/doctor/*" element={
            <ProtectedRoute role="DOCTOR"><DoctorApp /></ProtectedRoute>
          } />
          <Route path="/admin/*" element={
            <ProtectedRoute role="ADMIN"><AdminApp /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
