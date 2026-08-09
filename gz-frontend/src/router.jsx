// src/router.jsx
import { createBrowserRouter } from 'react-router-dom';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

// User Pages
import HomePage from './pages/HomePage';

// Authentication
import PrivateRoute, { AdminRoute } from './routes/PrivateRoute';

// Admin
import AdminPanel from './features/admin/AdminPanel';

export const router = createBrowserRouter([
  // ==========================================
  // PUBLIC ROUTES
  // ==========================================
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },

  // ==========================================
  // USER ROUTES (ត្រូវការ Login)
  // ==========================================
  {
    path: '/home',
    element: (
      <PrivateRoute>
        <HomePage />
      </PrivateRoute>
    ),
  },

  // ==========================================
  // ADMIN ROUTES (ត្រូវការ Admin Role)
  // ==========================================
  {
    path: '/admin/*',
    element: (
      <AdminRoute>
        <AdminPanel />
      </AdminRoute>
    ),
  },
]);