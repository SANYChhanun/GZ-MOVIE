import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    // Only check auth if we have a token but haven't verified yet
    if (accessToken && !isAuthenticated) {
      checkAuth();
    }
  }, []); // Run once when component mounts

  // If no token at all, redirect to login
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // If we have a token and user is authenticated, show the page
  if (isAuthenticated) {
    return children;
  }

  // If we have a token but still loading/verifying, show nothing (or loading spinner)
  // This prevents flash of login page while checking auth
  return null; // or return <div>Loading...</div>;
};

export default PrivateRoute;
