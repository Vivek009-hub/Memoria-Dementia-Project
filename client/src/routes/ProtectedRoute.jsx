import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Spinner } from '../components/common/Spinner.jsx';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-slate-400 font-semibold">Restoring session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
