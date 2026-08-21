// src/api/walletApi.js
import axiosClient from './axiosClient';

const walletApi = {
  // ទាញយកសមតុល្យ
  getBalance: () => {
    return axiosClient.get('/api/wallet/balance/');
  },
  
  // បញ្ចូលលុយ (Top-up)
  topUp: (amount, currency = 'USD') => {
    return axiosClient.post('/api/wallet/topup/', {
      amount,
      currency,
    });
  },
  
  // ប្រវត្តិប្រតិបត្តិការ
  getTransactions: (params = {}) => {
    return axiosClient.get('/api/wallet/transactions/', { params });
  },
  
  // ព័ត៌មានលម្អិតនៃប្រតិបត្តិការ
  getTransactionDetail: (id) => {
    return axiosClient.get(`/api/wallet/transactions/${id}/`);
  },
};

export default walletApi;