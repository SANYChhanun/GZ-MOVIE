// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('gz_access_token');
    if (token) {
      authApi.getProfile()
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('gz_access_token');
          localStorage.removeItem('gz_refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

const login = async (username, password) => {
  try {
    const response = await authApi.login({ username, password });
    const { access, refresh } = response.data;
    localStorage.setItem('gz_access_token', access);
    localStorage.setItem('gz_refresh_token', refresh);
    const profile = await authApi.getProfile();
    setUser(profile.data);
    return { success: true, user: profile.data };   // ★ បន្ថែម user
  } catch (err) {
    return { success: false, error: err.response?.data?.detail || 'ការចូលគណនីបរាជ័យ' };
  }
};

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      if (response.data.access) {
        localStorage.setItem('gz_access_token', response.data.access);
        localStorage.setItem('gz_refresh_token', response.data.refresh);
        const profile = await authApi.getProfile();
        setUser(profile.data);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'ការចុះឈ្មោះបរាជ័យ' };
    }
  };

  // Logout ស្ងាត់ - មិនហៅ API
  const logout = () => {
    localStorage.removeItem('gz_access_token');
    localStorage.removeItem('gz_refresh_token');
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isVIP = user?.is_vip === true || user?.active_subscription != null;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isVIP, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};