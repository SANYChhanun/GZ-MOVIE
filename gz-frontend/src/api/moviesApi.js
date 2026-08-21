// src/api/moviesApi.js
import axiosClient from './axiosClient';

const moviesApi = {
  // ទាញយកបញ្ជីរឿងទាំងអស់
  getMovies: (params = {}) => {
    return axiosClient.get('/api/movies/', { params });
  },
  
  // ✅ បន្ថែម getMovie ជា alias សម្រាប់ getMovieDetail
  getMovie: (id) => {
    return axiosClient.get(`/api/movies/${id}/`);
  },
  
  // ទាញយកព័ត៌មានរឿងលម្អិត
  getMovieDetail: (id) => {
    return axiosClient.get(`/api/movies/${id}/`);
  },
  
  // ទាញយករឿងដែលលេចធ្លោ
  getFeaturedMovies: () => {
    return axiosClient.get('/api/movies/featured/');
  },
  
  // ទាញយករឿងថ្មីៗ
  getNewReleases: () => {
    return axiosClient.get('/api/movies/new-releases/');
  },
  
  // ទាញយករឿងពេញនិយម
  getPopularMovies: () => {
    return axiosClient.get('/api/movies/popular/');
  },
  
  // ទាញយករឿងឥតគិតថ្លៃ
  getFreeMovies: () => {
    return axiosClient.get('/api/movies/free/');
  },
  
  // ទាញយក genres
  getGenres: () => {
    return axiosClient.get('/api/movies/genres/');
  },
  
  // ទាញយក categories
  getCategories: () => {
    return axiosClient.get('/api/movies/categories/');
  },
  
  // ទាញយករឿងដែលទាក់ទង
  getRelatedMovies: (movieId) => {
    return axiosClient.get('/api/movies/related/', {
      params: { movie_id: movieId }
    });
  },
  
  // ទាញយក episodes
  getEpisodes: (movieId) => {
    return axiosClient.get('/api/movies/episodes/', {
      params: { movie_id: movieId }
    });
  },
  
  // ទាញយក banners
  getBanners: () => {
    return axiosClient.get('/api/movies/banners/active/');
  },
  
  // ស្វែងរករឿង
  searchMovies: (query) => {
    return axiosClient.get('/api/movies/', {
      params: { search: query }
    });
  },

  // ========== PURCHASE / PAYMENT ==========

// ✅ ទិញរឿង — ត្រូវប្រើ endpoint purchases app មិនមែន movies app ទេ
purchaseMovie: (movieId, transactionId = '') => {
  return axiosClient.post('/api/purchases/create/', {
    movie_id: movieId,
    transaction_id: transactionId,
  });
},

// ✅ ពិនិត្យស្ថានភាព purchase
checkPurchaseStatus: (movieId) => {
  return axiosClient.get('/api/purchases/check/', {
    params: { movie_id: movieId }
  });
},

// ✅ ទាញយកបញ្ជីរឿងទាំងអស់ដែល user បានទិញ
getMyPurchases: () => {
  return axiosClient.get('/api/purchases/my-purchases/');
},
};

export default moviesApi;