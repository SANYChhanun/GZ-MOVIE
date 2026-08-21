// src/pages/movies/MovieDetailPage.jsx â€” Fixed Video Player
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import moviesApi from '../moviesApi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function MovieDetailPage() {
  const { id } = useParams();
  const { user, isVIP } = useAuth();
  const navigate = useNavigate();

  // ============ STATE ============
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVideo, setShowVideo] = useState(false);

  // ============ FETCH MOVIE DATA ============
  useEffect(() => {
    const fetchMovieDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const movieRes = await moviesApi.getMovie(id);
        const movieData = movieRes.data;
        setMovie(movieData);

        // Fetch episodes
        try {
          const episodesRes = await moviesApi.getEpisodes(id);
          const eps = episodesRes.data?.results || episodesRes.data || [];
          setEpisodes(eps);
        } catch {
          setEpisodes([]);
        }

        // Fetch related movies
        if (movieData.genres?.length > 0) {
          try {
            const genreIds = movieData.genres.map(g => typeof g === 'object' ? g.id : g).join(',');
            const relatedRes = await moviesApi.getMovies({ 
              genres: genreIds, 
              page_size: 6,
              exclude: id 
            });
            const related = relatedRes.data?.results || relatedRes.data || [];
            setRelatedMovies(related.filter(m => String(m.id) !== String(id)).slice(0, 6));
          } catch {
            setRelatedMovies([]);
          }
        }

      } catch (err) {
        console.error('Failed to fetch movie detail:', err);
        if (err.response?.status === 404) {
          setError('ážšáž€áž˜áž·áž“ážƒáž¾áž‰áž—áž¶áž–áž™áž“áŸ’ážáž“áŸáŸ‡áž‘áŸáŸ”');
        } else {
          setError('áž˜áž·áž“áž¢áž¶áž…áž‘áž¶áž‰áž™áž€áž‘áž·áž“áŸ’áž“áž“áŸáž™áž”áž¶áž“áž‘áŸáŸ” ážŸáž¼áž˜áž–áŸ’áž™áž¶áž™áž¶áž˜áž˜áŸ’ážáž„áž‘áŸ€ážáŸ”');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetail();
      window.scrollTo(0, 0);
    }
  }, [id]);

  // ============ HANDLERS ============
  const handleWatch = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (movie.access_type === 'member' && !isVIP) {
      navigate('/pricing');
      return;
    }
    
    setShowVideo(true);
  };

  const handleEpisodeClick = (episodeId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/watch/${id}?episode=${episodeId}`);
  };

  // ============ RENDER VIDEO PLAYER ============
// src/pages/movies/MovieDetailPage.jsx

const renderVideoPlayer = () => {
  if (!showVideo) return null;
  
  // âœ… áž”áŸ’ážšáž¾ video_embed_url áž‡áž¶áž¢áž¶áž‘áž·áž—áž¶áž–
  const videoUrl = movie?.video_embed_url || 
                   movie?.video_file || 
                   movie?.bunny_video_id;
  
  console.log('ðŸŽ¬ Video URL:', videoUrl);
  
  if (!videoUrl) {
    return (
      <div className="bg-card rounded-xl p-8 text-center border border-white/5">
        <i className="bi bi-exclamation-triangle text-4xl text-yellow-500 mb-3 block"></i>
        <p className="text-gray-400">áž˜áž·áž“áž˜áž¶áž“ážœáž¸ážŠáŸáž¢áž¼ážŸáž˜áŸ’ážšáž¶áž”áŸ‹áž—áž¶áž–áž™áž“áŸ’ážáž“áŸáŸ‡áž‘áŸáŸ”</p>
        <p className="text-gray-500 text-sm mt-2">
          Access Type: {movie?.access_type}
        </p>
      </div>
    );
  }

  const isBunnyUrl = videoUrl.includes('mediadelivery.net') || 
                     videoUrl.includes('b-cdn.net') ||
                     videoUrl.includes('bunnycdn');

  return (
    <div className="bg-black rounded-xl overflow-hidden border border-white/10">
      {isBunnyUrl ? (
        <iframe
          src={videoUrl}
          className="w-full aspect-video"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          title={movie.title}
          frameBorder="0"
        />
      ) : (
        <video
          controls
          autoPlay
          className="w-full aspect-video"
          poster={movie.poster_url || movie.poster}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

  // ============ LOADING STATE ============
  if (loading) {
    return (
      <div className="min-h-screen bg-darker font-khmer">
        <Header />
        <div className="pt-20">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  // ============ ERROR STATE ============
  if (error || !movie) {
    return (
      <div className="min-h-screen bg-darker font-khmer">
        <Header />
        <div className="pt-32 flex flex-col items-center justify-center px-4">
          <i className="bi bi-exclamation-triangle text-6xl text-yellow-500 mb-4"></i>
          <h2 className="text-white text-xl font-bold mb-2">ážšáž€áž˜áž·áž“ážƒáž¾áž‰</h2>
          <p className="text-gray-400 mb-6">{error || 'áž—áž¶áž–áž™áž“áŸ’ážáž“áŸáŸ‡áž˜áž·áž“áž˜áž¶áž“áž‘áŸáŸ”'}</p>
          <Link 
            to="/movies" 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition flex items-center gap-2"
          >
            <i className="bi bi-arrow-left"></i>
            ážáŸ’ážšáž¡áž”áŸ‹áž‘áŸ…áž”ážŽáŸ’ážŽáž¶áž›áŸáž™
          </Link>
        </div>
      </div>
    );
  }

  // ============ MAIN RENDER ============
  const posterUrl = movie.poster || null;
  const title = movie.title || 'Untitled';
  const rating = movie.rating ? Number(movie.rating).toFixed(1) : null;
  const year = movie.release_date ? movie.release_date.split('-')[0] : movie.year || '';
  const genres = movie.genres || [];
  const isFree = movie.access_type === 'free';
  const isMember = movie.access_type === 'member';

  return (
    <div className="min-h-screen bg-darker font-khmer">
      <Header />

      {/* ============ VIDEO PLAYER ============ */}
      {showVideo && (
        <div className="container mx-auto px-4 pt-24 pb-6">
          {renderVideoPlayer()}
        </div>
      )}

      {/* ============ HERO SECTION ============ */}
      <div className="relative" style={{ marginTop: showVideo ? '0' : '0' }}>
        {/* Backdrop Image */}
        <div className="absolute inset-0 h-[70vh] overflow-hidden">
          {movie.backdrop ? (
            <img
              src={movie.backdrop}
              alt={title}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-darker" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-darker via-darker/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-darker/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Poster */}
              <div className="w-48 md:w-56 flex-shrink-0 mx-auto md:mx-0">
                <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <i className="bi bi-film text-5xl text-gray-700"></i>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2">
                  {title}
                </h1>

                {/* Meta Row */}
                <div className="flex items-center justify-center md:justify-start gap-3 mb-3 flex-wrap">
                  {rating && (
                    <>
                      <span className="text-yellow-400 font-bold text-lg flex items-center gap-1">
                        <i className="bi bi-star-fill"></i>
                        {rating}
                      </span>
                      <span className="text-gray-500">â€¢</span>
                    </>
                  )}
                  <span className="text-gray-300">{year}</span>
                  {movie.duration && (
                    <>
                      <span className="text-gray-500">â€¢</span>
                      <span className="text-gray-300">{movie.duration} áž“áž¶áž‘áž¸</span>
                    </>
                  )}
                  <span className="text-gray-500">â€¢</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isFree ? 'bg-green-500' : 'bg-yellow-500 text-black'
                  }`}>
                    {isFree ? 'áž¥ážáž‚áž·ážážáŸ’áž›áŸƒ' : 'VIP'}
                  </span>
                </div>

                {/* Genres */}
                {genres.length > 0 && (
                  <div className="flex justify-center md:justify-start gap-2 mb-6 flex-wrap">
                    {genres.map((genre, i) => (
                      <Link
                        key={i}
                        to={`/movies?genre=${typeof genre === 'string' ? genre : genre.id || genre.name}`}
                        className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-xs hover:bg-red-600 hover:text-white transition-all border border-white/5"
                      >
                        {typeof genre === 'string' ? genre : genre.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center md:justify-start flex-wrap">
                  {!showVideo ? (
                    <button
                      onClick={handleWatch}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-xl"
                    >
                      <i className="bi bi-play-fill text-xl"></i>
                      {user ? 'áž˜áž¾áž›áž¥áž¡áž¼ážœáž“áŸáŸ‡' : 'áž…áž¼áž›áž‚ážŽáž“áž¸ážŠáž¾áž˜áŸ’áž”áž¸áž˜áž¾áž›'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowVideo(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all"
                    >
                      <i className="bi bi-x-lg"></i>
                      áž”áž·áž‘ážœáž¸ážŠáŸáž¢áž¼
                    </button>
                  )}
                  
                  {movie.trailer_url && (
                    <a
                      href={movie.trailer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all border border-white/10"
                    >
                      <i className="bi bi-play-btn"></i>
                      ážˆáž»ážážáŸ’áž›áž¸áŸ—
                    </a>
                  )}
                </div>

                {/* Access Info */}
                {!user && (
                  <p className="text-gray-400 text-sm mt-4">
                    <i className="bi bi-info-circle mr-1"></i>
                    ážŸáž¼áž˜{' '}
                    <Link to="/login" className="text-red-400 hover:text-red-300">
                      áž…áž¼áž›áž‚ážŽáž“áž¸
                    </Link>
                    {' '}ážŠáž¾áž˜áŸ’áž”áž¸áž˜áž¾áž›ážœáž¸ážŠáŸáž¢áž¼
                  </p>
                )}
                {user && !isFree && !isVIP && (
                  <p className="text-yellow-400 text-sm mt-4">
                    <i className="bi bi-star mr-1"></i>
                    áž—áž¶áž–áž™áž“áŸ’ážáž“áŸáŸ‡ážáŸ’ážšáž¼ážœáž€áž¶ážš VIP ážŠáž¾áž˜áŸ’áž”áž¸áž˜áž¾áž›áŸ”
                    <Link to="/pricing" className="text-red-400 hover:text-red-300 ml-1">
                      áž…áž»áŸ‡ážˆáŸ’áž˜áŸ„áŸ‡ VIP
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {movie.description && (
              <section>
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <i className="bi bi-file-text text-red-500"></i>
                  áž¢áŸ†áž–áž¸áž—áž¶áž–áž™áž“áŸ’áž
                </h2>
                <p className="text-gray-300 leading-relaxed">{movie.description}</p>
              </section>
            )}

            {/* Episodes */}
            {episodes.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <i className="bi bi-collection-play text-red-500"></i>
                  áž—áž¶áž‚áž‘áž¶áŸ†áž„áž¢ážŸáŸ‹ ({episodes.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {episodes.map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => handleEpisodeClick(ep.id)}
                      className="bg-card hover:bg-gray-700 rounded-xl p-4 text-left transition-all hover:scale-105 border border-white/5"
                    >
                      {ep.thumbnail ? (
                        <img src={ep.thumbnail} alt={ep.title} className="w-full aspect-video object-cover rounded-lg mb-3" />
                      ) : (
                        <div className="w-full aspect-video bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                          <i className="bi bi-play-circle text-2xl text-gray-500"></i>
                        </div>
                      )}
                      <p className="text-white font-bold text-sm">áž—áž¶áž‚ {ep.episode_number}</p>
                      {ep.title && <p className="text-gray-400 text-xs mt-1 truncate">{ep.title}</p>}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Movie Info Card */}
            <div className="bg-card rounded-xl p-5 border border-white/5">
              <h3 className="text-white font-bold mb-4">áž–áŸážáŸŒáž˜áž¶áž“</h3>
              <div className="space-y-3 text-sm">
                <InfoRow label="áž”áŸ’ážšáž—áŸáž‘" value={isFree ? 'áž¥ážáž‚áž·ážážáŸ’áž›áŸƒ' : 'VIP'} />
                {year && <InfoRow label="áž†áŸ’áž“áž¶áŸ†áž…áŸáž‰" value={year} />}
                {movie.duration && <InfoRow label="ážšáž™áŸˆáž–áŸáž›" value={`${movie.duration} áž“áž¶áž‘áž¸`} />}
                {movie.country && <InfoRow label="áž”áŸ’ážšáž‘áŸážŸ" value={movie.country} />}
                {movie.language && <InfoRow label="áž—áž¶ážŸáž¶" value={movie.language} />}
                {rating && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">áž–áž·áž“áŸ’áž‘áž»</span>
                    <span className="text-yellow-400 font-bold flex items-center gap-1">
                      <i className="bi bi-star-fill text-xs"></i>
                      {rating}/10
                    </span>
                  </div>
                )}
                {movie.view_count > 0 && (
                  <InfoRow label="áž…áŸ†áž“áž½áž“áž˜áž¾áž›" value={movie.view_count.toLocaleString()} />
                )}
              </div>
            </div>

            {/* Related Movies */}
            {relatedMovies.length > 0 && (
              <div>
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <i className="bi bi-grid text-red-500"></i>
                  ážšáž¿áž„áž–áž¶áž€áŸ‹áž–áŸáž“áŸ’áž’
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {relatedMovies.slice(0, 4).map((m) => (
                    <Link
                      key={m.id}
                      to={`/movies/${m.id}`}
                      className="bg-card rounded-lg overflow-hidden hover:scale-105 transition-all border border-white/5"
                    >
                      <div className="aspect-[2/3] bg-gray-800">
                        {m.poster ? (
                          <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <i className="bi bi-film text-2xl text-gray-600"></i>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-white text-xs font-bold truncate">{m.title}</p>
                        {m.rating && (
                          <p className="text-yellow-400 text-xs flex items-center gap-1 mt-0.5">
                            <i className="bi bi-star-fill text-[10px]"></i>
                            {Number(m.rating).toFixed(1)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ============ HELPER COMPONENTS ============
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[70vh] bg-gray-800" />
      <div className="container mx-auto px-4 -mt-32 relative">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-48 md:w-56 aspect-[2/3] bg-gray-700 rounded-xl mx-auto md:mx-0" />
          <div className="flex-1 space-y-4">
            <div className="h-10 w-64 bg-gray-700 rounded" />
            <div className="h-5 w-48 bg-gray-700 rounded" />
            <div className="h-5 w-32 bg-gray-700 rounded" />
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-gray-700 rounded-full" />
              <div className="h-8 w-20 bg-gray-700 rounded-full" />
            </div>
            <div className="h-12 w-40 bg-gray-700 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}