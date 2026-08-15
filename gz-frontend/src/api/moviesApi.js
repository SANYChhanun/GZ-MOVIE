// src/api/moviesApi.js
import axiosClient from './axiosClient';

export const moviesApi = {
  // ============ MOVIES ============
  // ✅ baseURL មាន /api រួចហើយ → ប្រើតែ /movies/ ប៉ុណ្ណោះ
  getMovies: (params) => axiosClient.get('/movies/', { params }),
  getMovie: (id) => axiosClient.get(`/movies/${id}/`),
  
  // ✅ ប្រើ query params ជំនួស custom endpoints
  getPopular: () => axiosClient.get('/movies/', { 
    params: { ordering: '-view_count', is_active: true, page_size: 12 } 
  }),
  getNewReleases: () => axiosClient.get('/movies/', { 
    params: { is_new_release: true, is_active: true, ordering: '-release_date', page_size: 12 } 
  }),
  getFree: () => axiosClient.get('/movies/', { 
    params: { access_type: 'free', is_active: true, page_size: 12 } 
  }),
  getFeatured: () => axiosClient.get('/movies/', { 
    params: { is_featured: true, is_active: true, page_size: 10 } 
  }),
  
  // ✅ Genres & Categories
  getGenres: () => axiosClient.get('/movies/genres/'),
  getCategories: () => axiosClient.get('/movies/categories/'),
  
  // ============ BANNERS ============
  getBanners: () => axiosClient.get('/banners/active/'),
  
  // ============ EPISODES ============
  getEpisodes: (movieId) => axiosClient.get(`/episodes/?movie_id=${movieId}`),
  
  // ============ SEARCH ============
  searchMovies: (query) => axiosClient.get('/movies/', { params: { search: query } }),

  
};

export default moviesApi;