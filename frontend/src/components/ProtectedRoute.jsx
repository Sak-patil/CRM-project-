import { Navigate } from 'react';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Could be replaced with a real spinner component
  }

  // If no token or no user, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has one of them
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Alternatively, redirect to an "Unauthorized" page or a generic dashboard
    return <Navigate to="/" replace />;
  }

  // Authorized, render the route
  return children;
};

export default ProtectedRoute;
