import axiosClient from './axiosClient';

export const authApi = {
  // Django SimpleJWT ត្រូវការ username និង password
  login: (credentials) => axiosClient.post('/auth/login/', {
    username: credentials.username || credentials.email.split('@')[0],
    password: credentials.password,
  }),
  
  register: (userData) => axiosClient.post('/auth/register/', {
    username: userData.username || userData.email.split('@')[0],
    email: userData.email,
    password: userData.password,
    password_confirm: userData.password_confirm || userData.password,
    phone: userData.phone || '',
  }),
  
  refreshToken: (refreshToken) => axiosClient.post('/auth/refresh/', { 
    refresh: refreshToken 
  }),
  
  logout: (refreshToken) => axiosClient.post('/auth/logout/', { 
    refresh: refreshToken 
  }),

  getProfile: () => axiosClient.get('/auth/profile/'),
  updateProfile: (userData) => axiosClient.patch('/auth/profile/', userData),
  changePassword: (passwordData) => axiosClient.post('/auth/change-password/', {
    old_password: passwordData.old_password,
    new_password: passwordData.new_password,
  }),
  forgotPassword: (email) => axiosClient.post('/auth/forgot-password/', { email }),
  resetPassword: (data) => axiosClient.post('/auth/reset-password/', {
    uid: data.uid,
    token: data.token,
    new_password: data.new_password,
  }),
  getDevices: () => axiosClient.get('/auth/devices/'),
  revokeDevice: (deviceId) => axiosClient.delete(`/auth/devices/${deviceId}/`),
};
