// src/api/membershipApi.js
import axiosClient from './axiosClient';

const membershipApi = {
  // ទាញយកគម្រោងសមាជិកភាពទាំងអស់
  getPlans: () => {
    return axiosClient.get('/api/membership/plans/');
  },
  
  // ទាញយកព័ត៌មានលម្អិតនៃគម្រោង
  getPlanDetail: (id) => {
    return axiosClient.get(`/api/membership/plans/${id}/`);
  },
  
  // ជាវសមាជិកភាព
  subscribe: (planSlug) => {
    return axiosClient.post('/api/membership/subscribe/', {
      plan_slug: planSlug,
    });
  },
  
  // ពិនិត្យស្ថានភាពសមាជិកភាព
  getStatus: () => {
    return axiosClient.get('/api/membership/status/');
  },
  
  // បន្តសមាជិកភាព
  renew: () => {
    return axiosClient.post('/api/membership/renew/');
  },
  
  // លុបសមាជិកភាព
  cancel: () => {
    return axiosClient.post('/api/membership/cancel/');
  },
};

export default membershipApi;