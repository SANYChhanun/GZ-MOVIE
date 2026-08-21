// src/pages/watch/VideoPlayerPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import moviesApi from '../../api/moviesApi';

export default function VideoPlayerPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [embedUrl, setEmbedUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ ប្រើ getMovieDetail ជំនួស getMovie
        const res = await moviesApi.getMovieDetail(id);
        const data = res.data;
        setMovie(data);

        console.log('🎬 Movie data:', data);

        // ✅ ពិនិត្យប្រភពវីដេអូតាមលំដាប់
        let videoUrl = data.video_file || data.video_embed_url;
        
        if (!videoUrl && data.bunny_video_id) {
          videoUrl = `https://iframe.mediadelivery.net/embed/724838/${data.bunny_video_id}`;
        }

        // ✅ បន្ថែម autoplay
        if (videoUrl && videoUrl.includes('mediadelivery.net')) {
          const separator = videoUrl.includes('?') ? '&' : '?';
          videoUrl = `${videoUrl}${separator}autoplay=1`;
        }

        setEmbedUrl(videoUrl || '');

        if (!videoUrl) {
          console.warn('⚠️ No video found for movie:', data);
        }
      } catch (err) {
        console.error('Failed to fetch movie:', err);
        setError('មិនអាចទាញយកទិន្នន័យរឿងបានទេ។');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchMovie();
    }
  }, [id]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
      if (e.key === 'Escape') {
        setShowControls(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let timeout;
    if (embedUrl) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [embedUrl]);

  // ============ LOADING ============
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // ============ ERROR ============
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <i className="bi bi-exclamation-triangle text-6xl text-yellow-500 mb-4 block"></i>
          <p className="text-lg">{error}</p>
          <Link to={`/movies/${id}`} className="text-red-500 hover:underline mt-4 inline-block">
            <i className="bi bi-arrow-left me-2"></i>
            ត្រឡប់ទៅទំព័ររឿង
          </Link>
        </div>
      </div>
    );
  }

  // ============ NO VIDEO ============
  if (!embedUrl) {
    return (
      <div className="min-h-screen bg-black font-khmer">
        <div className="absolute top-4 left-4 z-20">
          <Link to={`/movies/${id}`} className="text-white hover:text-gray-300 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center">
            <i className="bi bi-arrow-left text-xl"></i>
          </Link>
        </div>
        <div className="flex items-center justify-center h-screen text-white">
          <div className="text-center">
            <i className="bi bi-film text-6xl text-gray-600 mb-4 block"></i>
            <p className="text-lg">មិនមានវីដេអូសម្រាប់ភាពយន្តនេះទេ</p>
            <p className="text-gray-500 text-sm mt-2">សូមពិនិត្យម្តងទៀតនៅពេលក្រោយ</p>
          </div>
        </div>
      </div>
    );
  }

  // ============ VIDEO PLAYER ============
  const isDirectVideo = embedUrl.match(/\.(mp4|mov|mkv|webm)(\?|$)/i);

  return (
    <div 
      className="min-h-screen bg-black font-khmer relative"
      onMouseMove={() => {
        setShowControls(true);
        const timeout = setTimeout(() => setShowControls(false), 3000);
        return () => clearTimeout(timeout);
      }}
    >
      {/* Back Button */}
      <div className={`absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent pt-4 pb-12 px-4 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <Link to={`/movies/${id}`} className="text-white hover:text-gray-300 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center">
          <i className="bi bi-arrow-left text-xl"></i>
        </Link>
      </div>

      {/* Top Right Controls */}
      <div className={`absolute top-4 right-4 z-30 flex items-center gap-3 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {user && (
          <div className="bg-black/50 text-white/60 text-xs px-3 py-1.5 rounded-full">
            <i className="bi bi-person me-1"></i>
            {user.username || user.email}
          </div>
        )}
        <button
          onClick={toggleFullscreen}
          className="text-white hover:text-gray-300 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center"
          title={isFullscreen ? 'ចេញពី Fullscreen (F)' : 'Fullscreen (F)'}
        >
          <i className={`bi ${isFullscreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'} text-xl`}></i>
        </button>
      </div>

      {/* Bottom Movie Title */}
      {movie?.title && (
        <div className={`absolute bottom-4 left-4 z-30 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-white text-lg font-bold drop-shadow-lg flex items-center gap-2">
            <i className="bi bi-film text-red-500"></i>
            {movie.title}
          </h1>
        </div>
      )}

      {/* Video Player */}
      {isDirectVideo ? (
        <video
          src={embedUrl}
          className="w-full h-screen object-contain bg-black"
          controls
          autoPlay
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
          playsInline
        >
          <p>កម្មវិធីរុករករបស់អ្នកមិនគាំទ្រការចាក់វីដេអូទេ។</p>
        </video>
      ) : (
        <iframe
          src={embedUrl}
          className="w-full h-screen border-0"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          title={movie?.title || 'GZ Movie Player'}
        />
      )}
    </div>
  );
}