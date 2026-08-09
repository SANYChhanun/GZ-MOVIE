// src/api/authApi.js
import axiosClient from './axiosClient';

export const authApi = {
  // Django SimpleJWT ត្រូវការ username និង password
  login: (credentials) => axiosClient.post('/auth/login/', 
    {
      username: credentials.username || credentials.email?.split('@')[0],
      password: credentials.password,
    },
    {
      headers: { 'Content-Type': 'application/json' }  // បន្ថែមមួយនេះ!
    }
  ),
  
  register: (userData) => axiosClient.post('/auth/register/', 
    {
      username: userData.username || userData.email?.split('@')[0],
      email: userData.email,
      password: userData.password,
      password_confirm: userData.password_confirm || userData.password,
      phone: userData.phone || '',
    },
    {
      headers: { 'Content-Type': 'application/json' }  // បន្ថែមមួយនេះផង
    }
  ),
  
  refreshToken: (refreshToken) => axiosClient.post('/auth/refresh/', 
    { refresh: refreshToken },
    { headers: { 'Content-Type': 'application/json' } }  // បន្ថែមមួយនេះផង
  ),
  
  logout: (refreshToken) => axiosClient.post('/auth/logout/', 
    { refresh: refreshToken },
    { headers: { 'Content-Type': 'application/json' } }  // បន្ថែមមួយនេះផង
  ),

  getProfile: () => axiosClient.get('/auth/profile/'),
  updateProfile: (userData) => axiosClient.patch('/auth/profile/', userData),
  changePassword: (passwordData) => axiosClient.post('/auth/change-password/', 
    {
      old_password: passwordData.old_password,
      new_password: passwordData.new_password,
    },
    { headers: { 'Content-Type': 'application/json' } }
  ),
  forgotPassword: (email) => axiosClient.post('/auth/forgot-password/', 
    { email },
    { headers: { 'Content-Type': 'application/json' } }
  ),
  resetPassword: (data) => axiosClient.post('/auth/reset-password/', 
    {
      uid: data.uid,
      token: data.token,
      new_password: data.new_password,
    },
    { headers: { 'Content-Type': 'application/json' } }
  ),
  getDevices: () => axiosClient.get('/auth/devices/'),
  revokeDevice: (deviceId) => axiosClient.delete(`/auth/devices/${deviceId}/`),
};