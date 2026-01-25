import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ element }) => {
  const user = localStorage.getItem('user');

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const userData = JSON.parse(user);
    if (!userData.isAdmin) {
      return <Navigate to="/signin" replace />;
    }
    return element;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return <Navigate to="/admin/login" replace />;
  }
};

export default ProtectedAdminRoute;
