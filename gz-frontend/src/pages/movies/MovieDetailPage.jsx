// src/pages/movies/MovieDetailPage.jsx — Real API Data Version
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import moviesApi from '../../api/moviesApi';
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

  // ============ FETCH MOVIE DATA ============
  useEffect(() => {
    const fetchMovieDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // ទាញយកទិន្នន័យរឿងតាម ID
        const movieRes = await moviesApi.getMovie(id);
        const movieData = movieRes.data;
        setMovie(movieData);

        // ទាញយក Episodes (បើមាន)
        try {
          const episodesRes = await moviesApi.getEpisodes(id);
          const eps = episodesRes.data?.results || episodesRes.data || [];
          setEpisodes(eps);
        } catch {
          setEpisodes([]);
        }

        // ទាញយករឿងពាក់ព័ន្ធ (ដោយ genre ដូចគ្នា)
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
          setError('រកមិនឃើញភាពយន្តនេះទេ។');
        } else {
          setError('មិនអាចទាញយកទិន្នន័យបានទេ។ សូមព្យាយាមម្តងទៀត។');
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
    
    // ពិនិត្យការចូលមើល
    if (movie.access_type === 'member' && !isVIP) {
      navigate('/pricing');
      return;
    }
    
    navigate(`/watch/${id}`);
  };

  const handleEpisodeClick = (episodeId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/watch/${id}?episode=${episodeId}`);
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
          <h2 className="text-white text-xl font-bold mb-2">រកមិនឃើញ</h2>
          <p className="text-gray-400 mb-6">{error || 'ភាពយន្តនេះមិនមានទេ។'}</p>
          <Link 
            to="/movies" 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition flex items-center gap-2"
          >
            <i className="bi bi-arrow-left"></i>
            ត្រឡប់ទៅបណ្ណាល័យ
          </Link>
        </div>
      </div>
    );
  }

  // ============ HELPER FUNCTIONS ============
  const posterUrl = movie.poster || movie.poster_url || null;
  const backdropUrl = movie.backdrop || movie.backdrop_url || posterUrl;
  const title = movie.title || movie.name || 'Untitled';
  const rating = movie.rating ? Number(movie.rating).toFixed(1) : null;
  const year = movie.release_date ? movie.release_date.split('-')[0] : movie.year || '';
  const genres = movie.genres || [];
  const cast = movie.cast || [];
  const crew = movie.crew || [];
  const isFree = movie.access_type === 'free';
  const isMember = movie.access_type === 'member';
  const isPurchase = movie.access_type === 'purchase';

  const accessLabel = isFree ? 'ឥតគិតថ្លៃ' : isMember ? 'VIP' : 'ទិញ';
  const accessColor = isFree ? 'bg-green-500' : isMember ? 'bg-yellow-500 text-black' : 'bg-orange-500';

  // Get director from crew
  const director = crew.find(c => c.role === 'director' || c.role_display === 'Director');

  return (
    <div className="min-h-screen bg-darker font-khmer">
      <Header />

      {/* ============ HERO SECTION ============ */}
      <div className="relative">
        {/* Backdrop Image */}
        <div className="absolute inset-0 h-[70vh] overflow-hidden">
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt={title}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-darker" />
          )}
          {/* Gradient Overlays */}
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
                {/* Title */}
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
                      <span className="text-gray-500">•</span>
                    </>
                  )}
                  <span className="text-gray-300">{year}</span>
                  {movie.duration && (
                    <>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-300">{movie.duration} នាទី</span>
                    </>
                  )}
                  <span className="text-gray-500">•</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${accessColor}`}>
                    {accessLabel}
                  </span>
                </div>

                {/* Country & Language */}
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4 text-sm text-gray-400 flex-wrap">
                  {movie.country && (
                    <>
                      <span><i className="bi bi-globe mr-1"></i>{movie.country}</span>
                      <span>•</span>
                    </>
                  )}
                  {movie.language && (
                    <>
                      <span><i className="bi bi-translate mr-1"></i>{movie.language}</span>
                      <span>•</span>
                    </>
                  )}
                  <span><i className="bi bi-eye mr-1"></i>{(movie.view_count || 0).toLocaleString()} មើល</span>
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

                {/* Director */}
                {director && (
                  <p className="text-gray-400 text-sm mb-4">
                    <span className="text-gray-500">ដឹកនាំដោយ៖</span>{' '}
                    <span className="text-white">{director.name}</span>
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center md:justify-start">
                  <button
                    onClick={handleWatch}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-xl"
                  >
                    <i className="bi bi-play-fill text-xl"></i>
                    {user ? 'មើលឥឡូវនេះ' : 'ចូលគណនីដើម្បីមើល'}
                  </button>
                  
                  {movie.trailer_url && (
                    <a
                      href={movie.trailer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all border border-white/10"
                    >
                      <i className="bi bi-play-btn"></i>
                      ឈុតខ្លីៗ
                    </a>
                  )}
                </div>
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
                  អំពីភាពយន្ត
                </h2>
                <p className="text-gray-300 leading-relaxed">{movie.description}</p>
                {movie.short_description && (
                  <p className="text-gray-400 text-sm mt-2">{movie.short_description}</p>
                )}
              </section>
            )}

            {/* Episodes (for Series) */}
            {episodes.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <i className="bi bi-collection-play text-red-500"></i>
                  ភាគទាំងអស់ ({episodes.length})
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
                      <p className="text-white font-bold text-sm">ភាគ {ep.episode_number}</p>
                      {ep.title && <p className="text-gray-400 text-xs mt-1 truncate">{ep.title}</p>}
                      {ep.duration && <p className="text-gray-500 text-xs mt-1">{ep.duration} នាទី</p>}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Cast */}
            {cast.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <i className="bi bi-people-fill text-red-500"></i>
                  តារាសម្តែង
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {cast.map((actor, i) => (
                    <div key={i} className="bg-card rounded-xl p-4 text-center hover:bg-gray-700 transition-all border border-white/5">
                      {actor.photo ? (
                        <img src={actor.photo} alt={actor.name} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <i className="bi bi-person-fill text-2xl text-gray-400"></i>
                        </div>
                      )}
                      <p className="text-white text-sm font-bold">{actor.name}</p>
                      {actor.character_name && (
                        <p className="text-gray-400 text-xs mt-1">{actor.character_name}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Crew */}
            {crew.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <i className="bi bi-person-gear text-red-500"></i>
                  ក្រុមការងារ
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {crew.map((member, i) => (
                    <div key={i} className="bg-card rounded-xl p-4 border border-white/5">
                      <p className="text-white font-bold text-sm">{member.name}</p>
                      <p className="text-gray-400 text-xs mt-1">{member.role_display || member.role}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Trailer */}
            {movie.trailer_url && (
              <div className="bg-card rounded-xl overflow-hidden border border-white/5">
                <h3 className="text-white font-bold p-4 pb-2 flex items-center gap-2">
                  <i className="bi bi-play-btn text-red-500"></i>
                  ឈុតខ្លីៗ
                </h3>
                <div className="aspect-video">
                  <iframe 
                    src={movie.trailer_url} 
                    className="w-full h-full" 
                    allowFullScreen 
                    title="Trailer"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>
            )}

            {/* Movie Info Card */}
            <div className="bg-card rounded-xl p-5 border border-white/5">
              <h3 className="text-white font-bold mb-4">ព័ត៌មាន</h3>
              <div className="space-y-3 text-sm">
                <InfoRow label="ប្រភេទ" value={accessLabel} />
                {year && <InfoRow label="ឆ្នាំចេញ" value={year} />}
                {movie.duration && <InfoRow label="រយៈពេល" value={`${movie.duration} នាទី`} />}
                {movie.country && <InfoRow label="ប្រទេស" value={movie.country} />}
                {movie.language && <InfoRow label="ភាសា" value={movie.language} />}
                {rating && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">ពិន្ទុ</span>
                    <span className="text-yellow-400 font-bold flex items-center gap-1">
                      <i className="bi bi-star-fill text-xs"></i>
                      {rating}/10
                    </span>
                  </div>
                )}
                {movie.view_count > 0 && (
                  <InfoRow label="ចំនួនមើល" value={movie.view_count.toLocaleString()} />
                )}
              </div>
            </div>

            {/* Related Movies */}
            {relatedMovies.length > 0 && (
              <div>
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <i className="bi bi-grid text-red-500"></i>
                  រឿងពាក់ព័ន្ធ
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