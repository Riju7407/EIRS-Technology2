import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedAdminRoute = ({ element }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();

  // Wait for auth state to initialise before deciding
  if (loading) return null;

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default ProtectedAdminRoute;
