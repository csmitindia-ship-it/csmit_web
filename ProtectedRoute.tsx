import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

interface ProtectedRouteProps {
  role?: 'admin' | 'student';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
