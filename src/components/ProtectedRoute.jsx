import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-beige dark:bg-brand-dark flex items-center justify-center flex-col">
        <div className="w-12 h-12 border-4 border-brand-navy dark:border-white border-t-brand-gold rounded-full animate-spin"></div>
        <p className="mt-4 text-brand-navy dark:text-white font-bold tracking-wider animate-pulse">ARCHILLERY CMS</p>
      </div>
    );
  }

  if (!token || !user) {
    // Redirect to login but save the path they tried to hit
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role is allowed
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
