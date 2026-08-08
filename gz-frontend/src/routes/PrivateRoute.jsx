import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Always verify auth on mount (or when token might have changed)
    checkAuth();
  }, [checkAuth]);

  // While checking, show a loading indicator (optional)
  if (!isAuthenticated) {
    // If checkAuth determined there is no valid token, redirect
    // (checkAuth already removes invalid tokens and sets isAuthenticated=false)
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;