// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      // ✅ ប្រើ user ពី localStorage ភ្លាមៗ ដើម្បីកុំឱ្យរង់ចាំ API
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing saved user:', e);
      }
      // បន្ទាប់មកធ្វើបច្ចុប្បន្នភាពពី API
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authApi.getProfile();
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error fetching profile:', error);
      // មិនត្រូវ logout ទេ បើមាន error តិចតួច
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authApi.login(username, password);

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setUser(response.data.user);

      return {
        success: true,
        user: response.data.user,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.response?.data?.error || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setUser(response.data.user);

      return {
        success: true,
        user: response.data.user,
      };
    } catch (error) {
      console.error('Register error:', error);

      let errorMessage = 'Registration failed';
      if (error.response?.data) {
        const errors = error.response.data;
        if (typeof errors === 'string') {
          errorMessage = errors;
        } else if (typeof errors === 'object') {
          const messages = [];
          Object.values(errors).forEach((value) => {
            if (Array.isArray(value)) {
              messages.push(...value);
            } else if (typeof value === 'string') {
              messages.push(value);
            }
          });
          errorMessage = messages.join(', ');
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // ✅ កែការគណនា isAdmin - ពិនិត្យច្រើនកន្លែង
  const isAdmin =
    user?.role === 'ADMIN' ||
    user?.role === 'admin' ||
    user?.is_superuser === true ||
    user?.is_staff === true ||
    false;

  // ✅ កែការគណនា isVIP
  const isVIP = user?.is_vip === true || user?.has_active_subscription === true || false;

  // ★ FIX: field នេះបាត់! PrivateRoute/AdminRoute ត្រូវការ isAuthenticated ដើម្បីសម្រេចថា
  // តើអនុញ្ញាតឲ្យចូល protected route ដែរឬអត់។ បើគ្មាន field នេះ useAuth() នឹងត្រឡប់
  // isAuthenticated = undefined ជានិច្ច ដែលធ្វើឲ្យ `!isAuthenticated` ជា true ជានិច្ច →
  // AdminRoute/PrivateRoute redirect ទៅ /login ជានិច្ច ទោះបីជា login ជោគជ័យក៏ដោយ។
  const isAuthenticated = !!user;

  // ✅ Debug - បង្ហាញក្នុង console (អាចលុបចោលនៅពេល production)
  console.log('AuthContext - user:', user);
  console.log('AuthContext - isAuthenticated:', isAuthenticated);
  console.log('AuthContext - isAdmin:', isAdmin);
  console.log('AuthContext - isVIP:', isVIP);

  const value = {
    user,
    loading,
    isAuthenticated, // ★ FIX: added
    isAdmin,
    isVIP,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}