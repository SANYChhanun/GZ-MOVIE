// src/api/purchasesApi.js
import axiosClient from './axiosClient';

const purchasesApi = {
  // ✅ កែពី /purchases/check/ ទៅ /api/purchases/check/
  checkAccess: (movieId) => {
    return axiosClient.get('/api/purchases/check/', {
      params: { movie_id: movieId }
    });
  },
  
  purchaseMovie: (movieId) => {
    return axiosClient.post('/api/purchases/create/', {
      movie_id: movieId,
    });
  },
  
  getMyPurchases: (params = {}) => {
    return axiosClient.get('/api/purchases/', { params });
  },
  
  getPurchaseDetail: (id) => {
    return axiosClient.get(`/api/purchases/${id}/`);
  },
};

export default purchasesApi;