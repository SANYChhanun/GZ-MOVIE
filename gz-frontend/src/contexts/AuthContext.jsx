// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ពិនិត្យ Token ពេល App ចាប់ផ្តើម
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('gz_access_token');
      if (token) {
        try {
          const response = await authApi.getProfile();
          setUser(response.data);
        } catch (err) {
          console.error('Token invalid or expired:', err);
          localStorage.removeItem('gz_access_token');
          localStorage.removeItem('gz_refresh_token');
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      
      const response = await authApi.login({ 
        username, 
        password 
      });
      
      const { access, refresh } = response.data;
      
      // ប្រើ key ដូចគ្នានឹង axiosClient
      localStorage.setItem('gz_access_token', access);
      localStorage.setItem('gz_refresh_token', refresh);
      
      // ទាញយក User Profile បន្ទាប់ពី Login
      const profileResponse = await authApi.getProfile();
      setUser(profileResponse.data);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 
                      err.response?.data?.non_field_errors?.[0] || 
                      'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authApi.register(userData);
      
      // បើ API return token ដោយផ្ទាល់
      if (response.data.access) {
        localStorage.setItem('gz_access_token', response.data.access);
        localStorage.setItem('gz_refresh_token', response.data.refresh);
        
        const profileResponse = await authApi.getProfile();
        setUser(profileResponse.data);
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.detail || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('gz_refresh_token');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('gz_access_token');
      localStorage.removeItem('gz_refresh_token');
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await authApi.getProfile();
      setUser(response.data);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  // Computed properties
  const isAdmin = user?.role === 'ADMIN';
  const isVIP = user?.is_vip === true || 
                (user?.active_subscription !== null && user?.active_subscription !== undefined);
  const isAuthenticated = !!user;

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshProfile,
    isAdmin,
    isVIP,
    isAuthenticated,
    setError,
  };
  

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};