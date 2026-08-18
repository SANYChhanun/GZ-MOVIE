import axiosClient from "./axiosClient";

const adminApi = {
    // ========== DASHBOARD ==========
    getDashboard: () => axiosClient.get("/admin/"),
    getUsers: () => axiosClient.get("/admin/users/"),
    getRevenue: () => axiosClient.get("/admin/revenue/"),
    getActivities: () => axiosClient.get("/admin/activities/"),

    // ========== TAXONOMY (Genres, Countries, Categories) ==========
    // ប្រើ /genres/, /countries/, /categories/ ដោយផ្ទាល់
    getGenres: () => axiosClient.get('/genres/'),
    createGenre: (data) => axiosClient.post('/genres/', data),
    updateGenre: (id, data) => axiosClient.patch(`/genres/${id}/`, data),
    deleteGenre: (id) => axiosClient.delete(`/genres/${id}/`),

    getCountries: () => axiosClient.get('/countries/'),
    createCountry: (data) => axiosClient.post('/countries/', data),
    updateCountry: (id, data) => axiosClient.patch(`/countries/${id}/`, data),
    deleteCountry: (id) => axiosClient.delete(`/countries/${id}/`),

    getCategories: () => axiosClient.get('/categories/'),
    createCategory: (data) => axiosClient.post('/categories/', data),
    updateCategory: (id, data) => axiosClient.patch(`/categories/${id}/`, data),
    deleteCategory: (id) => axiosClient.delete(`/categories/${id}/`),

    // ========== បន្ថែម SERIES TYPES ==========
    getSeriesTypes: () => axiosClient.get('/series-types/'),
    createSeriesType: (data) => axiosClient.post('/series-types/', data),
    updateSeriesType: (id, data) => axiosClient.patch(`/series-types/${id}/`, data),
    deleteSeriesType: (id) => axiosClient.delete(`/series-types/${id}/`),
    // ========== បញ្ចប់ការបន្ថែម ==========

    // ========== TAXONOMY GENERIC (សម្រាប់ TaxonomyManagementPage) ==========
    createTaxonomy: (type, data) => {
        const endpoints = {
            genres: '/genres/',
            countries: '/countries/',
            categories: '/categories/',
            series_types: '/series-types/',  // ← កែសម្រួល៖ បន្ថែម / នៅខាងចុង
        };
        return axiosClient.post(endpoints[type], data);
    },
    
    updateTaxonomy: (type, id, data) => {
        const endpoints = {
            genres: `/genres/${id}/`,
            countries: `/countries/${id}/`,
            categories: `/categories/${id}/`,
            series_types: `/series-types/${id}/`,  // ← កែសម្រួល៖ បន្ថែម / នៅខាងចុង
        };
        return axiosClient.patch(endpoints[type], data);
    },
    
    deleteTaxonomy: (type, id) => {
        const endpoints = {
            genres: `/genres/${id}/`,
            countries: `/countries/${id}/`,
            categories: `/categories/${id}/`,
            series_types: `/series-types/${id}/`,  // ← កែសម្រួល៖ បន្ថែម / នៅខាងចុង
        };
        return axiosClient.delete(endpoints[type]);
    },

    // ========== BANNERS ==========
    getBanners: () => axiosClient.get("/admin/banners/"),
    getBanner: (id) => axiosClient.get(`/admin/banners/${id}/`),
    createBanner: (formData) => axiosClient.post("/admin/banners/", formData),
    updateBanner: (id, formData) => axiosClient.patch(`/admin/banners/${id}/`, formData),
    deleteBanner: (id) => axiosClient.delete(`/admin/banners/${id}/`),

    // ========== MOVIES ==========
    getMovies: (params) => axiosClient.get("/admin/movies/", { params }),
    getMovie: (id) => axiosClient.get(`/admin/movies/${id}/`),
    createMovie: (formData, config = {}) =>
        axiosClient.post("/admin/movies/", formData, config),
    updateMovie: (id, formData, config = {}) =>
        axiosClient.patch(`/admin/movies/${id}/`, formData, config),
    deleteMovie: (id) => axiosClient.delete(`/admin/movies/${id}/`),

    // Step 1 of the direct-to-Bunny TUS upload flow
    initVideoUpload: (data) => axiosClient.post("/admin/movies/init-video-upload/", data),

    // ========== MEMBERSHIP PLANS ==========
    getMembershipPlans: () => axiosClient.get("/admin/membership-plans/"),
    createMembershipPlan: (data) => axiosClient.post("/admin/membership-plans/", data),
    updateMembershipPlan: (id, data) => axiosClient.patch(`/admin/membership-plans/${id}/`, data),
    deleteMembershipPlan: (id) => axiosClient.delete(`/admin/membership-plans/${id}/`),
    getPpvStats: () => axiosClient.get("/admin/membership-plans/ppv_stats/"),
};

export default adminApi;