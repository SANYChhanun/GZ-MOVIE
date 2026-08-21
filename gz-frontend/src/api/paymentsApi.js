// src/api/paymentsApi.js
import axiosClient from './axiosClient';

// NOTE: axiosClient's baseURL already includes /api (see axiosClient.js:
// `http://localhost:8000/api`). None of the paths below should start
// with /api/ -- doing so double-prefixes every request
// (/api/api/payments/...) and makes it 404 against the real backend.
const paymentsApi = {
  // ========== PAYMENT CREATION ==========

  // បង្កើតការទូទាត់ថ្មី (KHQR/Bakong)
  createPayment: (data) => {
    return axiosClient.post('/payments/create/', {
      amount: data.amount,
      currency: data.currency || 'USD',
      payment_type: data.payment_type, // 'topup' | 'membership'
      membership_plan_slug: data.membership_plan_slug || null,
    });
  },

  // ពិនិត្យស្ថានភាពការទូទាត់
  checkPaymentStatus: (referenceId) => {
    return axiosClient.get(`/payments/status/${referenceId}/`);
  },

  // ========== WALLET ==========

  // ទាញយកសមតុល្យ wallet
  getWalletBalance: () => {
    return axiosClient.get('/wallet/balance/');
  },

  // បញ្ចូលលុយទៅកាន់ wallet (Top-up)
  topUpWallet: (data) => {
    return axiosClient.post('/wallet/topup/', {
      amount: data.amount,
      currency: data.currency || 'USD',
    });
  },

  // ទាញយកប្រវត្តិប្រតិបត្តិការ wallet
  getWalletTransactions: (params = {}) => {
    return axiosClient.get('/wallet/transactions/', { params });
  },

  // ========== PAYMENT HISTORY ==========

  // ទាញយកប្រវត្តិការទូទាត់របស់អ្នកប្រើ
  getMyPayments: (params = {}) => {
    return axiosClient.get('/payments/my-payments/', { params });
  },

  // ទាញយកព័ត៌មានលម្អិតនៃការទូទាត់
  getPaymentDetail: (id) => {
    return axiosClient.get(`/payments/${id}/`);
  },

  // ========== MEMBERSHIP PAYMENT ==========

  // ទិញសមាជិកភាព VIP
  purchaseMembership: (planSlug) => {
    return axiosClient.post('/membership/subscribe/', {
      plan_slug: planSlug,
    });
  },

  // ពិនិត្យស្ថានភាពសមាជិកភាព
  getMembershipStatus: () => {
    return axiosClient.get('/membership/status/');
  },

  // ========== ADMIN PAYMENT APIs ==========

  // ទាញយកបញ្ជីការទូទាត់ទាំងអស់ (Admin) -- matches
  // PaymentAdminViewSet (a router-registered ViewSet under 'admin'),
  // so this is a LIST call: GET /payments/admin/
  getAllPayments: (params = {}) => {
    return axiosClient.get('/payments/admin/', { params });
  },

  // ទាញយកស្ថិតិសង្ខេប (Admin) -- this is the ViewSet's separate
  // @action(detail=False) 'summary' route, a DIFFERENT endpoint from
  // the list above: GET /payments/admin/summary/. Do NOT try to reach
  // it by passing params to getAllPayments().
  getPaymentSummary: () => {
    return axiosClient.get('/payments/admin/summary/');
  },

  // ទាញយក webhook logs (Admin)
  getWebhookLogs: (params = {}) => {
    return axiosClient.get('/payments/webhook-logs/', { params });
  },
};

export default paymentsApi;