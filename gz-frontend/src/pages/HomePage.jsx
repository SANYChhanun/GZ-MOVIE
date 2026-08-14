// src/pages/HomePage.jsx — Netflix Style UI (Logic unchanged)
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { moviesApi } from '../api/moviesApi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MovieCard from '../components/movie/MovieCard';

export default function HomePage() {
  const { user, isVIP } = useAuth();
  const navigate = useNavigate();

  // ============ STATE (មិនផ្លាស់ប្តូរ) ============
  const [banners, setBanners] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [freeMovies, setFreeMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bannerImageLoaded, setBannerImageLoaded] = useState(false);
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  const bannerTimerRef = useRef(null);

  // ============ FETCH ALL DATA (មិនផ្លាស់ប្តូរ) ============
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
        moviesApi.getFeatured(),
        moviesApi.getPopular(),
        moviesApi.getNewReleases(),
        moviesApi.getFree(),
        moviesApi.getGenres(),
      ]);

      if (bannersRes.status === 'fulfilled' && bannersRes.value.data?.length > 0) {
        setBanners(bannersRes.value.data);
      }

      if (featuredRes.status === 'fulfilled' && featuredRes.value.data?.results?.length > 0) {
        setFeaturedMovies(featuredRes.value.data.results);
      } else if (featuredRes.status === 'fulfilled' && featuredRes.value.data?.length > 0) {
        setFeaturedMovies(featuredRes.value.data);
      }

      if (popularRes.status === 'fulfilled' && popularRes.value.data?.results?.length > 0) {
        setTrendingMovies(popularRes.value.data.results);
      } else if (popularRes.status === 'fulfilled' && popularRes.value.data?.length > 0) {
        setTrendingMovies(popularRes.value.data);
      }

      if (newRes.status === 'fulfilled' && newRes.value.data?.results?.length > 0) {
        setNewReleases(newRes.value.data.results);
      } else if (newRes.status === 'fulfilled' && newRes.value.data?.length > 0) {
        setNewReleases(newRes.value.data);
      }

      if (freeRes.status === 'fulfilled' && freeRes.value.data?.results?.length > 0) {
        setFreeMovies(freeRes.value.data.results);
      } else if (freeRes.status === 'fulfilled' && freeRes.value.data?.length > 0) {
        setFreeMovies(freeRes.value.data);
      }

      if (genresRes.status === 'fulfilled' && genresRes.value.data?.length > 0) {
        setGenres(genresRes.value.data);
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

  // ============ AUTO-ROTATE BANNERS (មិនផ្លាស់ប្តូរ) ============
  const hasBanners = banners.length > 0;
  const bannerItems = hasBanners ? banners : featuredMovies;
  const totalSlides = bannerItems.length;

  const startBannerTimer = useCallback(() => {
    if (totalSlides <= 1 || isBannerHovered) return;
    bannerTimerRef.current = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % totalSlides);
      setBannerImageLoaded(false);
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

  // ============ HANDLERS (មិនផ្លាស់ប្តូរ) ============
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

  // ============ LOADING STATE ============
  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Header />
        <BannerSkeleton />
        <MovieRowSkeleton />
        <MovieRowSkeleton />
        <MovieRowSkeleton />
        <Footer />
      </div>
    );
  }

  // ============ ERROR STATE ============
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

      {/* ============ HERO BANNER - Netflix Style (ពណ៌ច្បាស់ស្រស់ស្អាត) ============ */}
      {bannerItems.length > 0 && (
        <section 
          className="relative h-[100vh] overflow-hidden"
          onMouseEnter={pauseBanner}
          onMouseLeave={resumeBanner}
        >
          {/* Background Image with Crossfade */}
          <div className="absolute inset-0">
            {bannerItems.map((banner, index) => {
              const isActive = index === currentBannerIndex;
              const imageUrl = banner.image || banner.backdrop || banner.poster_url || banner.poster || '/images/placeholder-banner.jpg';
              
              return (
                <div
                  key={banner.id || index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                >
                  <img
                    src={imageUrl}
                    alt={banner.title || banner.movie_title}
                    className="w-full h-full object-cover object-center saturate-[1.25] contrast-[1.08] brightness-[1.03]"
                    onLoad={() => isActive && setBannerImageLoaded(true)}
                  />
                </div>
              );
            })}
            
            {/* Netflix-style Gradient Overlays — ពណ៌ក្រាដិនច្បាស់ និងស៊ីជម្រៅជាង */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-[#141414]/50" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#141414] to-transparent" />
            {/* កម្រិតពណ៌ក្រហម Netflix សម្រាប់ជម្រៅនិងភាពរស់រវើក */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#E50914]/15 via-transparent to-transparent mix-blend-overlay" />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Banner Content */}
          <div className="relative container mx-auto px-4 md:px-16 h-full flex flex-col justify-center">
            <div className="max-w-2xl pt-20">
              <div key={currentBannerIndex} className="animate-fade-in-up">
                {/* Netflix-style Title */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight drop-shadow-2xl">
                  {currentBanner?.title || currentBanner?.movie_title || 'រឿងថ្មី'}
                </h1>

                {/* Meta Info - Netflix Style */}
                <div className="flex items-center gap-3 text-gray-300 mb-4 flex-wrap">
                  {currentBanner?.movie_rating && (
                    <span className="text-green-400 font-bold">
                      ត្រូវគ្នា {currentBanner.movie_rating}%
                    </span>
                  )}
                  {currentBanner?.movie_year && (
                    <span>{currentBanner.movie_year}</span>
                  )}
                  <span className="border border-gray-500 px-1.5 py-0.5 text-xs">HD</span>
                  {currentBanner?.access_type === 'free' && (
                    <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">ឥតគិតថ្លៃ</span>
                  )}
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
                    className="bg-white text-black font-bold py-3 px-8 rounded flex items-center gap-2 hover:bg-gray-200 transition-all"
                  >
                    <i className="bi bi-play-fill text-2xl"></i>
                    ចាក់មើល
                  </button>
                  
                  {(currentBanner?.movie_id || currentBanner?.id) && (
                    <Link
                      to={`/movies/${currentBanner?.movie_id || currentBanner?.id}`}
                      className="bg-gray-500/50 text-white font-bold py-3 px-6 rounded flex items-center gap-2 hover:bg-gray-500/70 transition-all backdrop-blur-sm"
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
            <div className="absolute bottom-24 right-8 z-20 flex items-center gap-3">
              {bannerItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentBannerIndex(i);
                    setBannerImageLoaded(false);
                    resumeBanner();
                  }}
                  className="group relative"
                  aria-label={`ស្លាយទី ${i + 1}`}
                >
                  <div className={`
                    h-1 rounded-full transition-all duration-500
                    ${i === currentBannerIndex 
                      ? 'w-12 bg-[#E50914] shadow-[0_0_8px_2px_rgba(229,9,20,0.7)]' 
                      : 'w-4 bg-gray-500 group-hover:bg-gray-300'
                    }
                  `} />
                </button>
              ))}
            </div>
          )}

          {/* Mute Button */}
          <button className="absolute bottom-24 right-4 md:right-24 z-20 w-12 h-12 border border-gray-500 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors bg-black/30 backdrop-blur-sm">
            <i className="bi bi-volume-mute text-xl"></i>
          </button>
        </section>
      )}

      {/* ============ MAIN CONTENT ============ */}
      <main className="relative z-20 -mt-32">
        <div className="space-y-12 pb-16">
          
          {/* Trending Now */}
          <MovieRow
            title="កំពុងពេញនិយម"
            movies={trendingMovies}
            loading={false}
            onWatchClick={handleWatchClick}
            linkTo="/movies?sort=popular"
          />

          {/* New Releases */}
          <MovieRow
            title="ចេញថ្មីៗ"
            movies={newReleases}
            loading={false}
            onWatchClick={handleWatchClick}
            linkTo="/movies?sort=new"
          />

          {/* Free Movies */}
          <MovieRow
            title="មើលឥតគិតថ្លៃ"
            movies={freeMovies}
            loading={false}
            onWatchClick={handleWatchClick}
            linkTo="/movies?type=free"
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
              />
            );
          })}

          {/* VIP Banner - Netflix Style */}
          {!isVIP && (
            <section className="container mx-auto px-4 md:px-16">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-gray-800 p-8 md:p-12">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#E50914]/20 rounded-full blur-3xl" />
                
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
                    className="bg-[#E50914] hover:bg-[#f6121d] text-white font-bold px-8 py-4 rounded text-lg transition-all hover:scale-105 whitespace-nowrap shadow-[0_0_20px_rgba(229,9,20,0.4)]"
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
                { icon: 'bi-collection-play', title: 'ភាពយន្តជាង ១០០០', desc: 'រីករាយជាមួយភាពយន្តខ្មែរ និងអន្តរជាតិជាច្រើន។' },
                { icon: 'bi-badge-hd', title: 'គុណភាព HD & 4K', desc: 'ទស្សនាជាមួយគុណភាពខ្ពស់រហូតដល់ 4K Ultra HD។' },
                { icon: 'bi-phone', title: 'មើលបានគ្រប់ឧបករណ៍', desc: 'មើលបាននៅលើទូរស័ព្ទ ថេប្លេត និងកុំព្យូទ័រ។' },
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

// ============ MOVIE ROW COMPONENT - Netflix Style ============
function MovieRow({ title, movies, loading, onWatchClick, linkTo }) {
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

  if (!loading && movies.length === 0) return null;

  return (
    <section className="relative group/row">
      <div className="container mx-auto px-4 md:px-16 mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white hover:text-gray-300 transition-colors cursor-pointer inline-flex items-center gap-2">
          {title}
          <span className="text-gray-500 text-lg opacity-0 group-hover/row:opacity-100 transition-opacity">
            <i className="bi bi-chevron-right"></i>
          </span>
        </h2>
      </div>

      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-30 w-12 bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all opacity-0 group-hover/row:opacity-100"
          >
            <i className="bi bi-chevron-left text-white text-3xl"></i>
          </button>
        )}

        {/* Cards */}
        {loading ? (
          <div className="container mx-auto px-4 md:px-16 flex gap-2 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48 md:w-56 lg:w-64 animate-pulse">
                <div className="aspect-video bg-[#2a2a2a] rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="container mx-auto px-4 md:px-16 flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
          >
            {movies.slice(0, 12).map((movie) => (
              <div key={movie.id} className="flex-shrink-0 w-48 md:w-56 lg:w-64 transition-transform duration-300 hover:scale-105">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-30 w-12 bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all opacity-0 group-hover/row:opacity-100"
          >
            <i className="bi bi-chevron-right text-white text-3xl"></i>
          </button>
        )}
      </div>
    </section>
  );
}

// ============ SKELETON COMPONENTS - Netflix Style ============
function BannerSkeleton() {
  return (
    <div className="relative h-[100vh] bg-[#1a1a1a] animate-pulse">
      <div className="absolute bottom-40 left-16 space-y-4">
        <div className="h-16 w-96 bg-[#2a2a2a] rounded-lg"></div>
        <div className="h-4 w-64 bg-[#2a2a2a] rounded"></div>
        <div className="h-10 w-48 bg-[#2a2a2a] rounded-lg"></div>
      </div>
    </div>
  );
}

function MovieRowSkeleton() {
  return (
    <section className="container mx-auto px-4 md:px-16">
      <div className="h-8 w-48 bg-[#2a2a2a] rounded mb-4 animate-pulse"></div>
      <div className="flex gap-2 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-48 md:w-56 lg:w-64 animate-pulse">
            <div className="aspect-video bg-[#2a2a2a] rounded"></div>
          </div>
        ))}
      </div>
    </section>
  );
}