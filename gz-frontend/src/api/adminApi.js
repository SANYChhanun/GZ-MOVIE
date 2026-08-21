// src/api/adminApi.js
import axiosClient from "./axiosClient";

const adminApi = {
  // ========== DASHBOARD ==========
  getDashboardStats: () => axiosClient.get("/api/dashboard/stats/"),
  getUsers: () => axiosClient.get("/auth/admin/users/"),
  getRevenue: () => axiosClient.get("/api/dashboard/revenue/"),
  getActivities: () => axiosClient.get("/api/dashboard/activities/"),

  // ========== EPISODES ADMIN ==========
  getEpisodesAdmin: (movieId) => axiosClient.get("/api/admin/episodes/", { params: { movie: movieId } }),
  createEpisode: (data) => axiosClient.post("/api/admin/episodes/", data),
  updateEpisode: (id, data) => axiosClient.patch(`/api/admin/episodes/${id}/`, data),
  deleteEpisode: (id) => axiosClient.delete(`/api/admin/episodes/${id}/`),
  // ✅ initVideoUpload មានស្រាប់រួចហើយ — ប្រើសម្រាប់ episode video ដូចគ្នា

  // ========== TAXONOMY ==========
  getGenres: () => axiosClient.get('/api/genres/'),
  createGenre: (data) => axiosClient.post('/api/genres/', data),
  updateGenre: (id, data) => axiosClient.patch(`/api/genres/${id}/`, data),
  deleteGenre: (id) => axiosClient.delete(`/api/genres/${id}/`),

  getCountries: () => axiosClient.get('/api/countries/'),
  createCountry: (data) => axiosClient.post('/api/countries/', data),
  updateCountry: (id, data) => axiosClient.patch(`/api/countries/${id}/`, data),
  deleteCountry: (id) => axiosClient.delete(`/api/countries/${id}/`),

  getCategories: () => axiosClient.get('/api/categories/'),
  createCategory: (data) => axiosClient.post('/api/categories/', data),
  updateCategory: (id, data) => axiosClient.patch(`/api/categories/${id}/`, data),
  deleteCategory: (id) => axiosClient.delete(`/api/categories/${id}/`),

  getSeriesTypes: () => axiosClient.get('/api/series-types/'),
  createSeriesType: (data) => axiosClient.post('/api/series-types/', data),
  updateSeriesType: (id, data) => axiosClient.patch(`/api/series-types/${id}/`, data),
  deleteSeriesType: (id) => axiosClient.delete(`/api/series-types/${id}/`),

  // ========== BANNERS ==========
  getBanners: () => axiosClient.get("/api/movies/banners/"),
  createBanner: (formData) => axiosClient.post("/api/movies/banners/", formData),
  updateBanner: (id, formData) => axiosClient.patch(`/api/movies/banners/${id}/`, formData),
  deleteBanner: (id) => axiosClient.delete(`/api/movies/banners/${id}/`),

  // ========== MOVIES ADMIN ==========
  // ✅ កំណែសាមញ្ញបំផុត - មិនមាន config parameter
  getMovies: (params) => axiosClient.get("/api/admin/movies/", { params }),
  getMovie: (id) => axiosClient.get(`/api/admin/movies/${id}/`),
  createMovie: (formData) => axiosClient.post("/api/admin/movies/", formData),
  updateMovie: (id, formData) => axiosClient.patch(`/api/admin/movies/${id}/`, formData),
  deleteMovie: (id) => axiosClient.delete(`/api/admin/movies/${id}/`),
  initVideoUpload: (data) => axiosClient.post("/api/admin/movies/init-video-upload/", data),

  // ========== MEMBERSHIP PLANS ==========
  getMembershipPlans: () => axiosClient.get("/api/membership/plans/"),
  createMembershipPlan: (data) => axiosClient.post("/api/membership/plans/", data),
  updateMembershipPlan: (id, data) => axiosClient.patch(`/api/membership/plans/${id}/`, data),
  deleteMembershipPlan: (id) => axiosClient.delete(`/api/membership/plans/${id}/`),
  getPpvStats: () => axiosClient.get("/api/purchases/stats/"),

  // ========== PAYMENTS ADMIN ==========
  getPayments: (params) => axiosClient.get("/api/payments/admin/", { params }),
  getPaymentSummary: () => axiosClient.get("/api/payments/admin/summary/"),
  getWebhookLogs: (params) => axiosClient.get("/api/payments/webhook-logs/", { params }),

  // ========== GENERIC TAXONOMY (ប្រើដោយ CategoryGenreManagementPage) ==========

  createTaxonomy(type, data) {
    const map = {
      genres: this.createGenre,
      countries: this.createCountry,
      categories: this.createCategory,
      series_types: this.createSeriesType,
    };
    if (!map[type]) throw new Error(`Unknown taxonomy type: ${type}`);
    return map[type](data);
  },
  updateTaxonomy(type, id, data) {
    const map = {
      genres: this.updateGenre,
      countries: this.updateCountry,
      categories: this.updateCategory,
      series_types: this.updateSeriesType,
    };
    if (!map[type]) throw new Error(`Unknown taxonomy type: ${type}`);
    return map[type](id, data);
  },
  deleteTaxonomy(type, id) {
    const map = {
      genres: this.deleteGenre,
      countries: this.deleteCountry,
      categories: this.deleteCategory,
      series_types: this.deleteSeriesType,
    };
    if (!map[type]) throw new Error(`Unknown taxonomy type: ${type}`);
    return map[type](id);
  },
}


export default adminApi;