import { create } from 'zustand';
import { authApi } from '../api/authApi';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      // Django ត្រូវការ username
      const loginData = {
        username: credentials.username || credentials.email,
        password: credentials.password,
      };
      
      console.log('Login with:', loginData);
      const response = await authApi.login(loginData);
      console.log('Login response:', response.data);
      
      const { access, refresh, user } = response.data;
      
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false,
        accessToken: access,
        refreshToken: refresh 
      });
      return true;
    } catch (error) {
      console.log('Login error:', error.response?.data);
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.non_field_errors?.[0] ||
                      JSON.stringify(error.response?.data) ||
                      'Login failed. Please check your credentials.';
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Register with:', userData);
      const registerResponse = await authApi.register(userData);
      console.log('Register response:', registerResponse.data);
      
      // Auto-login after registration
      const loginResponse = await authApi.login({
        username: userData.username,
        password: userData.password,
      });
      
      const { access, refresh, user } = loginResponse.data;
      
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false,
        accessToken: access,
        refreshToken: refresh 
      });
      return true;
    } catch (error) {
      console.log('Register error:', error.response?.data);
      const errorMsg = error.response?.data?.detail || 
                      Object.values(error.response?.data || {}).flat()[0] || 
                      JSON.stringify(error.response?.data) ||
                      'Registration failed. Please try again.';
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      const refreshToken = get().refreshToken;
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null });
    }
  },

  checkAuth: async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      set({ isAuthenticated: false });
      return;
    }
    
    set({ isLoading: true });
    try {
      const response = await authApi.getProfile();
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      if (error.response?.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshResponse = await authApi.refreshToken(refreshToken);
            const newAccessToken = refreshResponse.data.access;
            localStorage.setItem('accessToken', newAccessToken);
            set({ accessToken: newAccessToken });
            
            const profileResponse = await authApi.getProfile();
            set({ user: profileResponse.data, isAuthenticated: true, isLoading: false });
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            set({ user: null, isAuthenticated: false, isLoading: false, accessToken: null, refreshToken: null });
          }
        } else {
          localStorage.removeItem('accessToken');
          set({ user: null, isAuthenticated: false, isLoading: false, accessToken: null });
        }
      } else {
        set({ isLoading: false });
      }
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
