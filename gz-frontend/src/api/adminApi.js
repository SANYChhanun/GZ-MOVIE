import axiosClient from "./axiosClient";

const adminApi = {
    // ✅ all paths are relative – axiosClient will prepend /api
    getDashboard: () => axiosClient.get("/admin/"),
    getUsers: () => axiosClient.get("/admin/users/"),
    getMovies: () => axiosClient.get("/admin/movies/"),
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

    // ---------- Movies ----------
    getMovies: (params) => axiosClient.get("/admin/movies-admin/", { params }),
    getMovie: (id) => axiosClient.get(`/admin/movies-admin/${id}/`),
    createMovie: (formData, config) =>
        axiosClient.post("/admin/movies-admin/", formData, config),
    updateMovie: (id, formData, config) =>
        axiosClient.patch(`/admin/movies-admin/${id}/`, formData, config),
    deleteMovie: (id) => axiosClient.delete(`/admin/movies-admin/${id}/`),

};

export default adminApi;