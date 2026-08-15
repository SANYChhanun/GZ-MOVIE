import axiosClient from "./axiosClient";

const adminApi = {
    getDashboard: () => axiosClient.get("/admin/"),
    getUsers: () => axiosClient.get("/admin/users/"),
    getRevenue: () => axiosClient.get("/admin/revenue/"),
    getActivities: () => axiosClient.get("/admin/activities/"),

    getGenres: () => axiosClient.get('/admin/genres/'),
    createGenre: (data) => axiosClient.post('/admin/genres/', data),
    deleteGenre: (id) => axiosClient.delete(`/admin/genres/${id}/`),

    getCategories: () => axiosClient.get('/admin/categories/'),
    createCategory: (data) => axiosClient.post('/admin/categories/', data),
    deleteCategory: (id) => axiosClient.delete(`/admin/categories/${id}/`),
    

    // ===== Banners & Promotions =====
    getBanners: () => axiosClient.get("/admin/banners/"),
    getBanner: (id) => axiosClient.get(`/admin/banners/${id}/`),
    createBanner: (formData) => axiosClient.post("/admin/banners/", formData),
    updateBanner: (id, formData) => axiosClient.patch(`/admin/banners/${id}/`, formData),
    deleteBanner: (id) => axiosClient.delete(`/admin/banners/${id}/`),

   // src/api/adminApi.js

// ========== MOVIES ==========
getMovies: (params) => axiosClient.get("/admin/movies/", { params }),
getMovie: (id) => axiosClient.get(`/admin/movies/${id}/`),
createMovie: (formData, config = {}) =>
    axiosClient.post("/admin/movies/", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        ...config,
    }),
updateMovie: (id, formData, config = {}) =>
    axiosClient.patch(`/admin/movies/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        ...config,
    }),
deleteMovie: (id) => axiosClient.delete(`/admin/movies/${id}/`),

// Step 1 of the direct-to-Bunny TUS upload flow — gets signed
// credentials, no file bytes sent here.
initVideoUpload: (data) => axiosClient.post("/admin/movies/init-video-upload/", data),

    // ========== Membership Plans ==========
    getMembershipPlans: () => axiosClient.get("/admin/membership-plans/"),
    createMembershipPlan: (data) => axiosClient.post("/admin/membership-plans/", data),
    updateMembershipPlan: (id, data) => axiosClient.patch(`/admin/membership-plans/${id}/`, data),
    deleteMembershipPlan: (id) => axiosClient.delete(`/admin/membership-plans/${id}/`),
    getPpvStats: () => axiosClient.get("/admin/membership-plans/ppv_stats/"),
};

export default adminApi;