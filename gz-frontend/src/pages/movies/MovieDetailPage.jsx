// src/pages/movies/MovieDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import moviesApi from '../../api/moviesApi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PurchaseModal from '../../components/movie/PurchaseModal';

export default function MovieDetailPage() {
  const { id } = useParams();
  const { user, isVIP } = useAuth();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const isAdminOrStaff = 
    user?.is_staff === true || 
    user?.is_superuser === true || 
    user?.role === 'ADMIN' ||
    false;

  useEffect(() => {
    const fetchMovieDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const movieRes = await moviesApi.getMovieDetail(id);
        setMovie(movieRes.data);
      } catch (err) {
        console.error('Failed to fetch movie detail:', err);
        setError('មិនអាចទាញយកទិន្នន័យបានទេ។');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetail();
      window.scrollTo(0, 0);
    }
  }, [id]);

  const handleWatch = () => {
  if (!user) {
    navigate('/login');
    return;
  }
  
  if (isAdminOrStaff) {
    setShowVideo(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  
  // ✅ ពិនិត្យ can_watch ពី backend ជាមុនសិន មិនថា access_type អ្វី
  if (movie.can_watch) {
    setShowVideo(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  
  if (movie.access_type === 'free') {
    setShowVideo(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  
  if (movie.access_type === 'member') {
    if (isVIP) {
      setShowVideo(true);
    } else {
      navigate('/pricing');
    }
    return;
  }
  
  if (movie.access_type === 'purchase') {
    // ✅ ដល់ត្រង់នេះមានន័យថា can_watch === false → ត្រូវទិញមែន
    setShowPurchaseModal(true);
    return;
  }
  
  setShowVideo(true);
};
const handlePurchaseSuccess = async () => {
  setShowPurchaseModal(false);
  try {
    // ទាញយក movie detail ម្ដងទៀត ដើម្បីទទួល video_file ដែលឥឡូវនេះមានសិទ្ធិមើល
    const movieRes = await moviesApi.getMovieDetail(id);
    setMovie(movieRes.data);
    setShowVideo(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    console.error('Failed to refresh movie after purchase:', err);
  }
};

  const renderVideoPlayer = () => {
    if (!showVideo) return null;
    
    const videoUrl = movie?.video_file || movie?.bunny_video_id;
    
    if (!videoUrl) {
      return (
        <div className="bg-[#1f1f1f] rounded-xl p-8 text-center border border-gray-800">
          <i className="bi bi-exclamation-triangle text-4xl text-yellow-500 mb-3 block"></i>
          <p className="text-gray-400">មិនមានវីដេអូសម្រាប់ភាពយន្តនេះទេ។</p>
        </div>
      );
    }

    const isBunnyUrl = videoUrl.includes('mediadelivery.net') || 
                       videoUrl.includes('iframe') ||
                       videoUrl.includes('b-cdn.net');

    return (
      <div className="bg-black rounded-xl overflow-hidden border border-gray-800">
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
          </video>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] font-khmer">
        <Header />
        <div className="flex items-center justify-center h-64 pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#141414] font-khmer">
        <Header />
        <div className="pt-32 flex flex-col items-center justify-center px-4">
          <i className="bi bi-exclamation-triangle text-6xl text-yellow-500 mb-4"></i>
          <h2 className="text-white text-xl font-bold mb-2">រកមិនឃើញ</h2>
          <p className="text-gray-400 mb-6">{error || 'ភាពយន្តនេះមិនមានទេ។'}</p>
          <Link to="/movies" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition">
            <i className="bi bi-arrow-left mr-2"></i>
            ត្រឡប់ទៅបណ្ណាល័យ
          </Link>
        </div>
      </div>
    );
  }

  const posterUrl = movie.poster_url || movie.poster || null;
  const backdropUrl = movie.backdrop_url || movie.backdrop || null;
  const title = movie.title || 'Untitled';
  const rating = movie.rating ? Number(movie.rating).toFixed(1) : null;
  const year = movie.release_date ? movie.release_date.split('-')[0] : movie.year || '';
  const genres = movie.genres || [];
  const isFree = movie.access_type === 'free';
  const isMember = movie.access_type === 'member';
  const isPurchase = movie.access_type === 'purchase';
  const purchasePrice = Number(movie.purchase_price || 0);

  return (
    <div className="min-h-screen bg-[#141414] font-khmer">
      <Header />

      {/* VIDEO PLAYER */}
      {showVideo && (
        <div className="container mx-auto px-4 pt-24 pb-6">
          {renderVideoPlayer()}
        </div>
      )}

      {/* HERO SECTION */}
      <div className="relative">
        <div className="absolute inset-0 h-[70vh] overflow-hidden">
          {backdropUrl ? (
            <img src={backdropUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-[#141414]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
        </div>

        <div className="relative pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Poster */}
              <div className="w-48 md:w-56 flex-shrink-0 mx-auto md:mx-0">
                <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
                  {posterUrl ? (
                    <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <i className="bi bi-film text-5xl text-gray-700"></i>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2">{title}</h1>

                <div className="flex items-center justify-center md:justify-start gap-3 mb-3 flex-wrap">
                  {rating && (
                    <span className="text-yellow-400 font-bold flex items-center gap-1">
                      <i className="bi bi-star-fill"></i>{rating}
                    </span>
                  )}
                  <span className="text-gray-300">{year}</span>
                  {movie.duration && <span className="text-gray-300">{movie.duration} នាទី</span>}
                  {isFree && <span className="bg-green-500 text-white text-xs px-2.5 py-0.5 rounded-full">ឥតគិតថ្លៃ</span>}
                  {isMember && <span className="bg-yellow-500 text-black text-xs px-2.5 py-0.5 rounded-full">VIP</span>}
                  {isPurchase && <span className="bg-blue-500 text-white text-xs px-2.5 py-0.5 rounded-full">ទិញមើល</span>}
                </div>

                {genres.length > 0 && (
                  <div className="flex justify-center md:justify-start gap-2 mb-6 flex-wrap">
                    {genres.map((genre, i) => (
                      <span key={i} className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-xs">
                        {typeof genre === 'string' ? genre : genre.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center md:justify-start flex-wrap">
                  {!showVideo ? (
                    <button
                      onClick={handleWatch}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all"
                    >
                      <i className="bi bi-play-fill text-xl"></i>
                      {!user ? 'ចូលគណនីដើម្បីមើល' :
                       isAdminOrStaff ? 'មើលឥឡូវនេះ' :
                       isPurchase ? `ទិញនិងមើល ($${purchasePrice.toFixed(2)})` :
                       isMember && !isVIP ? 'ជាវ VIP ដើម្បីមើល' :
                       'មើលឥឡូវនេះ'}
                    </button>
                  ) : (
                    <button onClick={() => setShowVideo(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-xl">
                      <i className="bi bi-x-lg mr-2"></i>បិទវីដេអូ
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {movie.description && (
              <section>
                <h2 className="text-xl font-bold text-white mb-3">
                  <i className="bi bi-file-text text-red-500 mr-2"></i>
                  អំពីភាពយន្ត
                </h2>
                <p className="text-gray-300 leading-relaxed">{movie.description}</p>
              </section>
            )}
          </div>

          <div>
            <div className="bg-[#1f1f1f] rounded-xl p-5 border border-gray-800">
              <h3 className="text-white font-bold mb-4">
                <i className="bi bi-info-circle text-red-500 mr-2"></i>
                ព័ត៌មាន
              </h3>
              <div className="space-y-3 text-sm">
                <InfoRow label="ប្រភេទ" value={isFree ? 'ឥតគិតថ្លៃ' : isMember ? 'VIP' : 'ទិញមើល'} />
                {year && <InfoRow label="ឆ្នាំចេញ" value={year} />}
                {movie.duration && <InfoRow label="រយៈពេល" value={`${movie.duration} នាទី`} />}
                {movie.country && <InfoRow label="ប្រទេស" value={movie.country} />}
                {movie.language && <InfoRow label="ភាសា" value={movie.language} />}
                {isPurchase && <InfoRow label="តម្លៃ" value={`$${purchasePrice.toFixed(2)}`} />}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Purchase Modal */}
      {showPurchaseModal && movie && (
        <PurchaseModal
          movie={movie}
          onClose={() => setShowPurchaseModal(false)}
          onSuccess={handlePurchaseSuccess}
        />
      )}

      <Footer />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}