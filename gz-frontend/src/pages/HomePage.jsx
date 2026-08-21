// src/pages/HomePage.jsx — Netflix Style UI (កែលម្អឱ្យកាន់តែស្អាត)
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import moviesApi from '../api/moviesApi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MovieCard from '../components/movie/MovieCard';

export default function HomePage() {
  const { user } = useAuth();
  const isVIP = user?.is_vip || false;  // ✅ ទាញយកពី user object
  const navigate = useNavigate();

  // ============ STATE (រក្សាទុកដដែល + បន្ថែមថ្មី) ============
  const [banners, setBanners] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [freeMovies, setFreeMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  const [bannerTransition, setBannerTransition] = useState(false);
  const bannerTimerRef = useRef(null);

  // ============ FETCH ALL DATA (រក្សាទុកដដែល) ============
// ក្នុង HomePage.jsx កែ fetchAllData function

const fetchAllData = useCallback(async () => {
  setLoading(true);
  setError(null);
  
  try {
    const [
      bannersRes,
      featuredRes,
      popularRes,
      newRes,
      freeRes,
      genresRes,
    ] = await Promise.allSettled([
      moviesApi.getBanners(),
      moviesApi.getFeaturedMovies(),  // ✅ កែឈ្មោះ method
      moviesApi.getPopularMovies(),   // ✅ កែឈ្មោះ method
      moviesApi.getNewReleases(),     // ✅ កែឈ្មោះ method
      moviesApi.getFreeMovies(),      // ✅ កែឈ្មោះ method
      moviesApi.getGenres(),          // ✅ កែឈ្មោះ method
    ]);

    // កែការទាញយកទិន្នន័យ - ដោយសារ custom actions ប្រគល់ជា array ផ្ទាល់
    if (bannersRes.status === 'fulfilled') {
      setBanners(bannersRes.value.data || []);
    }

    if (featuredRes.status === 'fulfilled') {
      setFeaturedMovies(featuredRes.value.data || []);
    }

    if (popularRes.status === 'fulfilled') {
      const data = popularRes.value.data;
      // ពិនិត្យថាជា array ឬមាន results
      setTrendingMovies(Array.isArray(data) ? data : (data?.results || []));
    }

    if (newRes.status === 'fulfilled') {
      const data = newRes.value.data;
      const newMovies = Array.isArray(data) ? data : (data?.results || []);
      
      // តម្រៀបតាមថ្ងៃបន្ថែមថ្មី
      const sortedNew = [...newMovies].sort((a, b) => {
        const dateA = new Date(a.created_at || a.release_date || 0);
        const dateB = new Date(b.created_at || b.release_date || 0);
        return dateB - dateA;
      });
      setNewReleases(sortedNew);
    }

    if (freeRes.status === 'fulfilled') {
      const data = freeRes.value.data;
      setFreeMovies(Array.isArray(data) ? data : (data?.results || []));
    }

    if (genresRes.status === 'fulfilled') {
      setGenres(genresRes.value.data || []);
    }

  } catch (err) {
    console.error('Failed to load homepage data:', err);
    setError('មិនអាចទាញយកទិន្នន័យបានទេ។ សូមព្យាយាមម្តងទៀត។');
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ============ AUTO-ROTATE BANNERS (កែលម្អឱ្យរលូនជាងមុន) ============
  const hasBanners = banners.length > 0;
  const bannerItems = hasBanners ? banners : featuredMovies;
  const totalSlides = bannerItems.length;

  const startBannerTimer = useCallback(() => {
    if (totalSlides <= 1 || isBannerHovered) return;
    bannerTimerRef.current = setInterval(() => {
      setBannerTransition(true);
      setTimeout(() => {
        setCurrentBannerIndex(prev => (prev + 1) % totalSlides);
        setBannerTransition(false);
      }, 500);
    }, 6000);
  }, [totalSlides, isBannerHovered]);

  useEffect(() => {
    startBannerTimer();
    return () => {
      if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    };
  }, [startBannerTimer]);

  const pauseBanner = () => {
    setIsBannerHovered(true);
    if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
  };

  const resumeBanner = () => {
    setIsBannerHovered(false);
    startBannerTimer();
  };

  // ============ HANDLERS (រក្សាទុកដដែល) ============
  const handleBannerClick = (banner) => {
    if (banner.link_type === 'movie' && banner.movie_id) {
      navigate(`/watch/${banner.movie_id}`);
    } else if (banner.link_type === 'external' && banner.external_url) {
      window.open(banner.external_url, '_blank', 'noopener,noreferrer');
    } else if (banner.movie_id) {
      navigate(`/watch/${banner.movie_id}`);
    }
  };

  const handleWatchClick = (movieId) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/watch/${movieId}`);
    }
  };

  const currentBanner = bannerItems[currentBannerIndex];

  // ============ LOADING STATE (កែលម្អ skeleton ឱ្យស្អាតជាងមុន) ============
  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Header />
        <BannerSkeleton />
        <div className="relative z-20 -mt-32 space-y-12 pb-16">
          <MovieRowSkeleton />
          <MovieRowSkeleton />
          <MovieRowSkeleton />
        </div>
        <Footer />
      </div>
    );
  }

  // ============ ERROR STATE (រក្សាទុកដដែល) ============
  if (error && banners.length === 0 && trendingMovies.length === 0) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-[#2a2a2a] rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="bi bi-exclamation-triangle text-4xl text-yellow-500"></i>
          </div>
          <p className="text-gray-400 mt-4 text-lg">{error}</p>
          <button
            onClick={fetchAllData}
            className="mt-4 bg-white text-black font-bold px-8 py-3 rounded-lg hover:bg-gray-200 transition"
          >
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      </div>
    );
  }

  // ============ RENDER ============
  return (
    <div className="min-h-screen bg-[#141414]">
      <Header />

      {/* ============ HERO BANNER - Netflix Style កែលម្អឱ្យស្អាតភ្លឺ ============ */}
      {bannerItems.length > 0 && (
        <section 
          className="relative h-[95vh] md:h-[100vh] overflow-hidden"
          onMouseEnter={pauseBanner}
          onMouseLeave={resumeBanner}
        >
          {/* Background Image with Smooth Crossfade */}
          <div className="absolute inset-0">
                {bannerItems.map((banner, index) => {
              const isActive = index === currentBannerIndex;
              
              // ✅ កែលំដាប់នៃការពិនិត្យ image URL ឱ្យត្រឹមត្រូវ
              const imageUrl = 
                banner.image_url ||      // ✅ ពិនិត្យ image_url មុនគេ
                banner.image ||           // បន្ទាប់មក image
                banner.backdrop_url ||    // បន្ទាប់មក backdrop_url
                banner.backdrop ||        // បន្ទាប់មក backdrop
                banner.poster_url ||      // បន្ទាប់មក poster_url
                banner.movie_poster ||    // បន្ទាប់មក movie_poster
                '/images/placeholder-banner.jpg';  // Fallback ចុងក្រោយ
              
              // ✅ កែការបង្កើត full URL បើជា relative path
              const getFullImageUrl = (url) => {
                if (!url) return '/images/placeholder-banner.jpg';
                
                // បើជា full URL រួចហើយ ត្រឡប់វាចេញ
                if (url.startsWith('http://') || url.startsWith('https://')) {
                  return url;
                }
                
                // បើជា data URI
                if (url.startsWith('data:')) {
                  return url;
                }
                
                // បើជា relative path បន្ថែម base URL
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                const cleanBase = baseUrl.replace(/\/$/, '');
                const cleanPath = url.startsWith('/') ? url : `/${url}`;
                
                return `${cleanBase}${cleanPath}`;
              };
              
              const finalImageUrl = getFullImageUrl(imageUrl);
              
              return (
                <div
                  key={banner.id || index}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                    isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  }`}
                >
                  <img
                    src={finalImageUrl}  // ✅ ប្រើ finalImageUrl ជំនួស imageUrl
                    alt={banner.title || banner.movie_title}
                    className="w-full h-full object-cover object-center"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              );
            })}
            
            {/* Netflix-style Gradient Overlays - កែលម្អឱ្យស្អាតជាងមុន */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-[#141414]/40" />
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#141414] to-transparent" />
            {/* ស្រទាប់ vignette សម្រាប់ភាពស៊ីជម្រៅ */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)]" />
          </div>

          {/* Banner Content */}
          <div className="relative container mx-auto px-4 md:px-16 h-full flex flex-col justify-center">
            <div className="max-w-2xl pt-20">
              <div key={currentBannerIndex} className="animate-fade-in-up">
                {/* Movie Status Badge */}
                {currentBanner?.access_type === 'free' && (
                  <div className="inline-flex items-center gap-2 bg-green-600/90 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    <i className="bi bi-star-fill"></i> ឥតគិតថ្លៃ
                  </div>
                )}
                
                {/* Netflix-style Title with Gradient */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight drop-shadow-2xl">
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {currentBanner?.title || currentBanner?.movie_title || 'រឿងថ្មី'}
                  </span>
                </h1>

                {/* Meta Info - Netflix Style */}
                <div className="flex items-center gap-3 text-gray-300 mb-4 flex-wrap">
                  {currentBanner?.movie_rating && (
                    <span className="text-green-400 font-bold flex items-center gap-1">
                      <i className="bi bi-hand-thumbs-up-fill"></i>
                      {currentBanner.movie_rating}%
                    </span>
                  )}
                  {currentBanner?.movie_year && (
                    <span>{currentBanner.movie_year}</span>
                  )}
                  {currentBanner?.duration && (
                    <span>{currentBanner.duration} នាទី</span>
                  )}
                  <span className="border border-gray-500 px-1.5 py-0.5 text-xs font-bold">HD</span>
                  <span className="border border-gray-500 px-1.5 py-0.5 text-xs font-bold">4K</span>
                </div>

                {/* Description */}
                {currentBanner?.description && (
                  <p className="text-gray-200 text-base md:text-lg mb-6 line-clamp-3 max-w-xl drop-shadow-lg">
                    {currentBanner.description}
                  </p>
                )}

                {/* Action Buttons - Netflix Style */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const movieId = currentBanner?.movie_id || currentBanner?.id;
                      if (movieId) handleWatchClick(movieId);
                      else handleBannerClick(currentBanner);
                    }}
                    className="bg-white text-black font-bold py-3 px-8 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-all hover:scale-105"
                  >
                    <i className="bi bi-play-fill text-2xl"></i>
                    ចាក់មើល
                  </button>
                  
                  {(currentBanner?.movie_id || currentBanner?.id) && (
                    <Link
                      to={`/movies/${currentBanner?.movie_id || currentBanner?.id}`}
                      className="bg-gray-600/50 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 hover:bg-gray-600/70 transition-all backdrop-blur-sm"
                    >
                      <i className="bi bi-info-circle text-xl"></i>
                      ព័ត៌មានបន្ថែម
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Dots - Netflix Style */}
          {totalSlides > 1 && (
            <div className="absolute bottom-24 right-8 z-20 flex items-center gap-2">
              {bannerItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setBannerTransition(true);
                    setTimeout(() => {
                      setCurrentBannerIndex(i);
                      setBannerTransition(false);
                    }, 300);
                    resumeBanner();
                  }}
                  className="group relative"
                  aria-label={`ស្លាយទី ${i + 1}`}
                >
                  <div className={`
                    h-1.5 rounded-full transition-all duration-500
                    ${i === currentBannerIndex 
                      ? 'w-12 bg-[#E50914] shadow-[0_0_10px_2px_rgba(229,9,20,0.8)]' 
                      : 'w-6 bg-gray-600 group-hover:bg-gray-400'
                    }
                  `} />
                </button>
              ))}
            </div>
          )}

          {/* Sound Indicator - Decorative */}
          <div className="absolute bottom-24 right-4 md:right-24 z-20 w-12 h-12 border border-gray-500 rounded-full flex items-center justify-center text-gray-400 bg-black/30 backdrop-blur-sm">
            <i className="bi bi-volume-up text-xl"></i>
          </div>
        </section>
      )}

      {/* ============ MAIN CONTENT ============ */}
      <main className="relative z-20 -mt-32">
        <div className="space-y-12 pb-16">
          
          {/* សំខាន់៖ បង្ហាញ Movie ថ្មីនៅលើគេបំផុត */}
          <MovieRow
            title="ចេញថ្មីៗ"
            subtitle="រឿងថ្មីៗដែលទើបតែបន្ថែម"
            movies={newReleases}
            loading={false}
            onWatchClick={handleWatchClick}
            linkTo="/movies?sort=new"
            icon="bi-stars"
            highlightNew={true}
          />

          {/* Trending Now */}
          <MovieRow
            title="កំពុងពេញនិយម"
            subtitle="រឿងដែលមនុស្សកំពុងមើលច្រើនជាងគេ"
            movies={trendingMovies}
            loading={false}
            onWatchClick={handleWatchClick}
            linkTo="/movies?sort=popular"
            icon="bi-fire"
          />

          {/* Free Movies */}
          <MovieRow
            title="មើលឥតគិតថ្លៃ"
            subtitle="រីករាយដោយមិនចាំបាច់ចំណាយ"
            movies={freeMovies}
            loading={false}
            onWatchClick={handleWatchClick}
            linkTo="/movies?type=free"
            icon="bi-gift"
          />

          {/* Genre Rows */}
          {genres.slice(0, 3).map((genre) => {
            const genreMovies = trendingMovies.filter(
              m => m.genres?.some(g => 
                (typeof g === 'string' ? g : g.id) === (typeof genre === 'string' ? genre : genre.id) ||
                (typeof g === 'string' ? g : g.name) === (typeof genre === 'string' ? genre : genre.name)
              )
            );
            
            if (genreMovies.length === 0) return null;
            
            return (
              <MovieRow
                key={genre.id || genre.name}
                title={typeof genre === 'string' ? genre : genre.name}
                movies={genreMovies}
                loading={false}
                onWatchClick={handleWatchClick}
                linkTo={`/movies?genre=${genre.id || genre.name}`}
                icon="bi-collection"
              />
            );
          })}

          {/* VIP Banner - Netflix Style */}
          {!isVIP && (
            <section className="container mx-auto px-4 md:px-16">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-gray-800 p-8 md:p-12">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#E50914]/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E50914]/10 rounded-full blur-3xl" />
                
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                      ភាពយន្ត កម្មវិធីទូរទស្សន៍ និងច្រើនទៀត គ្មានដែនកំណត់
                    </h2>
                    <p className="text-gray-400 text-lg">
                      មើលបានគ្រប់ទីកន្លែង។ លុបចោលពេលណាក៏បាន។
                    </p>
                  </div>
                  <Link 
                    to="/pricing" 
                    className="bg-[#E50914] hover:bg-[#f6121d] text-white font-bold px-8 py-4 rounded-lg text-lg transition-all hover:scale-105 whitespace-nowrap shadow-[0_0_30px_rgba(229,9,20,0.5)]"
                  >
                    ទទួលបាន VIP
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Why Choose Us - Netflix Style */}
          <section className="container mx-auto px-4 md:px-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                ហេតុអ្វីជ្រើសរើស <span className="text-[#E50914]">GZ Movie</span>
              </h2>
              <p className="text-gray-400">វេទិកាភាពយន្តខ្មែរដ៏ល្អបំផុត</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[
                { icon: 'bi-collection-play-fill', title: 'ភាពយន្តជាង ១០០០', desc: 'រីករាយជាមួយភាពយន្តខ្មែរ និងអន្តរជាតិជាច្រើន។' },
                { icon: 'bi-badge-hd-fill', title: 'គុណភាព HD & 4K', desc: 'ទស្សនាជាមួយគុណភាពខ្ពស់រហូតដល់ 4K Ultra HD។' },
                { icon: 'bi-phone-fill', title: 'មើលបានគ្រប់ឧបករណ៍', desc: 'មើលបាននៅលើទូរស័ព្ទ ថេប្លេត និងកុំព្យូទ័រ។' },
              ].map((item, i) => (
                <div key={i} className="group bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-xl p-6 md:p-8 transition-all duration-300 hover:scale-105 border border-transparent hover:border-gray-700">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-[#E50914]/10 group-hover:bg-[#E50914]/20 rounded-xl flex items-center justify-center mb-4 md:mb-6 transition-all">
                    <i className={`bi ${item.icon} text-2xl md:text-3xl text-[#E50914]`}></i>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ============ MOVIE ROW COMPONENT - Netflix Style កែលម្អ ============
function MovieRow({ title, subtitle, movies, loading, onWatchClick, linkTo, icon, highlightNew }) {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [movies]);

  if (!loading && movies.length === 0) return null;

  return (
    <section className="relative group/row">
      <div className="container mx-auto px-4 md:px-16 mb-4">
        <Link to={linkTo} className="inline-flex items-center gap-2 group/title">
          <h2 className="text-xl md:text-2xl font-bold text-white group-hover/title:text-gray-300 transition-colors cursor-pointer">
            <i className={`bi ${icon} text-[#E50914] mr-2`}></i>
            {title}
          </h2>
          <span className="text-gray-500 text-lg opacity-0 group-hover/row:opacity-100 transition-opacity">
            <i className="bi bi-chevron-right"></i>
          </span>
        </Link>
        {subtitle && (
          <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        )}
      </div>

      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && !loading && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-30 w-12 bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all opacity-0 group-hover/row:opacity-100"
            aria-label="Scroll left"
          >
            <i className="bi bi-chevron-left text-white text-3xl"></i>
          </button>
        )}

        {/* Cards */}
        {loading ? (
          <div className="container mx-auto px-4 md:px-16 flex gap-2 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48 md:w-56 lg:w-64 animate-pulse">
                <div className="aspect-video bg-[#2a2a2a] rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="container mx-auto px-4 md:px-16 flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
          >
            {movies.slice(0, 12).map((movie, index) => (
              <div 
                key={movie.id} 
                className="flex-shrink-0 w-48 md:w-56 lg:w-64 transition-transform duration-300 hover:scale-105 relative"
              >
                {highlightNew && index < 3 && (
                  <div className="absolute top-2 left-2 z-10 bg-[#E50914] text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <i className="bi bi-stars"></i> ថ្មី
                  </div>
                )}
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}

        {/* Right Arrow */}
        {showRightArrow && !loading && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-30 w-12 bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all opacity-0 group-hover/row:opacity-100"
            aria-label="Scroll right"
          >
            <i className="bi bi-chevron-right text-white text-3xl"></i>
          </button>
        )}
      </div>
    </section>
  );
}

// ============ SKELETON COMPONENTS - Netflix Style កែលម្អ ============
function BannerSkeleton() {
  return (
    <div className="relative h-[95vh] md:h-[100vh] bg-gradient-to-b from-[#1a1a1a] to-[#141414] animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent" />
      <div className="absolute bottom-40 left-4 md:left-16 space-y-4">
        <div className="h-4 w-24 bg-[#E50914]/20 rounded-full"></div>
        <div className="h-16 w-96 bg-[#2a2a2a] rounded-lg"></div>
        <div className="h-4 w-64 bg-[#2a2a2a] rounded"></div>
        <div className="h-4 w-48 bg-[#2a2a2a] rounded"></div>
        <div className="h-10 w-48 bg-[#2a2a2a] rounded-lg"></div>
      </div>
    </div>
  );
}

function MovieRowSkeleton() {
  return (
    <section className="container mx-auto px-4 md:px-16">
      <div className="h-8 w-48 bg-[#2a2a2a] rounded mb-4 animate-pulse"></div>
      <div className="h-4 w-32 bg-[#2a2a2a] rounded mb-4 animate-pulse"></div>
      <div className="flex gap-2 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-48 md:w-56 lg:w-64 animate-pulse">
            <div className="aspect-video bg-[#2a2a2a] rounded-lg"></div>
          </div>
        ))}
      </div>
    </section>
  );
}