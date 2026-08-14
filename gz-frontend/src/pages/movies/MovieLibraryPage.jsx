// src/pages/movies/MovieLibraryPage.jsx — Real API Data Version
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import moviesApi from '../../api/moviesApi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MovieCard from '../../components/movie/MovieCard';

export default function MovieLibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ============ STATE ============
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '-release_date');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  
  const PAGE_SIZE = 24;

  // ============ FETCH GENRES ============
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await moviesApi.getGenres();
        setGenres(res.data || []);
      } catch (err) {
        console.error('Failed to fetch genres:', err);
      }
    };
    fetchGenres();
  }, []);

  // ============ FETCH MOVIES ============
  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        page_size: PAGE_SIZE,
        ordering: sortBy,
        is_active: true,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (selectedGenre) {
        params.genre = selectedGenre;
      }

      const res = await moviesApi.getMovies(params);
      
      if (res.data?.results) {
        setMovies(res.data.results);
        setTotalCount(res.data.count || res.data.results.length);
      } else if (Array.isArray(res.data)) {
        setMovies(res.data);
        setTotalCount(res.data.length);
      } else {
        setMovies([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Failed to fetch movies:', err);
      setError('មិនអាចទាញយកទិន្នន័យបានទេ។');
      setMovies([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, search, selectedGenre]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Update URL params when filters change
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (selectedGenre) params.genre = selectedGenre;
    if (sortBy !== '-release_date') params.sort = sortBy;
    setSearchParams(params);
  }, [search, selectedGenre, sortBy, setSearchParams]);

  // ============ HANDLERS ============
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMovies();
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre === selectedGenre ? '' : genre);
    setPage(1);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedGenre('');
    setSortBy('-release_date');
    setPage(1);
  };

  // ============ RENDER ============
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasActiveFilters = search || selectedGenre || sortBy !== '-release_date';

  return (
    <div className="min-h-screen bg-darker font-khmer">
      <Header />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2">
              <i className="bi bi-collection-play text-red-500"></i>
              ភាពយន្តទាំងអស់
            </h1>
            <p className="text-gray-400">
              {loading ? (
                <span className="inline-block w-24 h-5 bg-gray-700 rounded animate-pulse"></span>
              ) : (
                <>
                  បានរកឃើញ <span className="text-white font-bold">{totalCount.toLocaleString()}</span> រឿង
                </>
              )}
            </p>
          </div>

          {/* ============ FILTERS BAR ============ */}
          <div className="bg-card rounded-xl p-4 mb-8 sticky top-20 z-30 backdrop-blur-sm bg-opacity-95 border border-white/5 shadow-lg">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ស្វែងរកភាពយន្ត..."
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none transition text-sm"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => { setSearch(''); setPage(1); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  )}
                </div>
              </form>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none text-sm"
              >
                <option value="-release_date">ថ្មីបំផុត</option>
                <option value="-view_count">ពេញនិយមបំផុត</option>
                <option value="-rating">ពិន្ទុខ្ពស់</option>
                <option value="title">ឈ្មោះ (A-Z)</option>
              </select>

              {/* View Mode Toggle */}
              <div className="hidden md:flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-md text-sm transition ${
                    viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <i className="bi bi-grid-fill"></i>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md text-sm transition ${
                    viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="List View"
                >
                  <i className="bi bi-list"></i>
                </button>
              </div>
            </div>

            {/* Genre Pills */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => handleGenreChange('')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  !selectedGenre
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <i className="bi bi-grid mr-1"></i>
                ទាំងអស់
              </button>
              {genres.map((genre) => (
                <button
                  key={genre.id || genre.name}
                  onClick={() => handleGenreChange(genre.id || genre.name)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                    selectedGenre === (genre.id || genre.name)
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {typeof genre === 'string' ? genre : genre.name}
                </button>
              ))}
            </div>

            {/* Active Filters Indicator */}
            {hasActiveFilters && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-gray-500">តម្រងសកម្ម៖</span>
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <i className="bi bi-x-circle"></i>
                  សម្អាតទាំងអស់
                </button>
              </div>
            )}
          </div>

          {/* ============ CONTENT ============ */}
          {loading ? (
            // Loading Skeleton
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
              : "space-y-3"
            }>
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[2/3] bg-gray-800 rounded-lg"></div>
                  <div className="mt-2 h-4 bg-gray-800 rounded w-3/4"></div>
                  <div className="mt-1 h-3 bg-gray-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            // Error State
            <div className="text-center py-20">
              <i className="bi bi-exclamation-triangle text-5xl text-yellow-500 mb-4 block"></i>
              <p className="text-gray-400 text-lg mb-4">{error}</p>
              <button
                onClick={fetchMovies}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition"
              >
                ព្យាយាមម្តងទៀត
              </button>
            </div>
          ) : movies.length === 0 ? (
            // Empty State
            <div className="text-center py-20">
              <i className="bi bi-film text-6xl text-gray-700 mb-4 block"></i>
              <p className="text-gray-400 text-lg mb-2">រកមិនឃើញភាពយន្តទេ</p>
              <p className="text-gray-500 text-sm mb-6">សាកល្បងផ្លាស់ប្តូរតម្រង ឬពាក្យស្វែងរក</p>
              <button
                onClick={handleClearFilters}
                className="text-red-500 hover:text-red-400 transition flex items-center gap-2 mx-auto"
              >
                <i className="bi bi-arrow-repeat"></i>
                សម្អាតតម្រង
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            // Grid View
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          ) : (
            // List View
            <>
              <div className="space-y-3">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} listView />
                ))}
              </div>
              
              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ============ PAGINATION COMPONENT ============
function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  const maxVisible = 5;
  
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-2 text-sm rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <i className="bi bi-chevron-left"></i>
      </button>
      
      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="px-3 py-2 text-sm rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition">1</button>
          {start > 2 && <span className="text-gray-500">...</span>}
        </>
      )}
      
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-2 text-sm rounded-lg transition ${
            currentPage === p
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {p}
        </button>
      ))}
      
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-gray-500">...</span>}
          <button onClick={() => onPageChange(totalPages)} className="px-3 py-2 text-sm rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition">{totalPages}</button>
        </>
      )}
      
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-2 text-sm rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  );
}