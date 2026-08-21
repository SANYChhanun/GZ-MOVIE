// src/api/authApi.js
import axiosClient from './axiosClient';

const authApi = {
  // ចូលប្រើប្រាស់
  login: (username, password) => {
    return axiosClient.post('/auth/login/', {
      username: username,
      password: password,
    });
  },
  
  // ចុះឈ្មោះ
  register: (userData) => {
    return axiosClient.post('/auth/register/', {
      username: userData.username || userData.email?.split('@')[0],
      email: userData.email,
      phone: userData.phone || '',
      password: userData.password,
      password_confirm: userData.password_confirm || userData.password,
    });
  },
  
  // Refresh token
  refreshToken: (refreshToken) => {
    return axiosClient.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
  },
  
  // ចាកចេញ
  logout: (refreshToken) => {
    return axiosClient.post('/auth/logout/', {
      refresh: refreshToken,
    });
  },
  
  // ទាញយកព័ត៌មាន Profile
  getProfile: () => {
    return axiosClient.get('/auth/profile/');
  },
  
  // ធ្វើបច្ចុប្បន្នភាព Profile
  updateProfile: (userData) => {
    return axiosClient.patch('/auth/profile/', userData);
  },
  
  // ផ្លាស់ប្តូរពាក្យសម្ងាត់
  changePassword: (oldPassword, newPassword) => {
    return axiosClient.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },
  
  // ភ្លេចពាក្យសម្ងាត់
  forgotPassword: (email) => {
    return axiosClient.post('/auth/forgot-password/', {
      email: email,
    });
  },
  
  // កំណត់ពាក្យសម្ងាត់ឡើងវិញ
  resetPassword: (data) => {
    return axiosClient.post('/auth/reset-password/', {
      uid: data.uid,
      token: data.token,
      new_password: data.new_password,
    });
  },
  
  // គ្រប់គ្រងឧបករណ៍
  getDevices: () => {
    return axiosClient.get('/auth/devices/');
  },
  
  revokeDevice: (deviceId) => {
    return axiosClient.delete(`/auth/devices/${deviceId}/`);
  },
};

// ✅ ប្រើតែ default export តែមួយប៉ុណ្ណោះ
export default authApi;