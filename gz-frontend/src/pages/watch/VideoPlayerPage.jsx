// src/pages/watch/VideoPlayerPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { moviesApi } from '../../api/moviesApi';

const BUNNY_LIBRARY_ID = '724838';

export default function VideoPlayerPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [embedUrl, setEmbedUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await moviesApi.getMovie(id);
        const data = res.data;
        setMovie(data);

        // ✅ ពិនិត្យប្រភពវីដេអូតាមលំដាប់
        if (data.bunny_video_id) {
          // Bunny.net Stream Embed
          setEmbedUrl(`https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${data.bunny_video_id}`);
        } else if (data.video_file) {
          // URL វីដេអូ (Bunny.net CDN URL)
          setEmbedUrl(data.video_file);
        } else if (data.video_upload) {
          // ✅ Video Upload ផ្ទាល់
          // បើជា relative path បន្ថែម base URL
          const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
          const videoUrl = data.video_upload.startsWith('http') 
            ? data.video_upload 
            : `${baseUrl}${data.video_upload}`;
          setEmbedUrl(videoUrl);
        }
      } catch (err) {
        console.error('Failed to fetch movie:', err);
        setError('មិនអាចទាញយកទិន្នន័យរឿងបានទេ។');
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

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
  const isDirectVideo = embedUrl.match(/\.(mp4|mov|mkv|webm)(\?|$)/i) || 
                        (!embedUrl.includes('mediadelivery.net') && !embedUrl.includes('youtube'));

  return (
    <div className="min-h-screen bg-black font-khmer">
      {/* Back Button */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent pt-4 pb-12 px-4">
        <Link to={`/movies/${id}`} className="text-white hover:text-gray-300 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center">
          <i className="bi bi-arrow-left text-xl"></i>
        </Link>
      </div>

      {/* Watermark */}
      {user && (
        <div className="absolute top-4 right-4 bg-black/50 text-white/20 text-xs px-2 py-1 rounded z-20">
          {user.username || user.email}
        </div>
      )}

      {/* Movie Title */}
      {movie?.title && (
        <div className="absolute bottom-4 left-4 z-20">
          <h1 className="text-white text-lg font-bold drop-shadow-lg">{movie.title}</h1>
        </div>
      )}

      {/* ✅ Video Player */}
      {isDirectVideo ? (
        // Direct video file - use HTML5 video player
        <video
          src={embedUrl}
          className="w-full h-screen object-contain bg-black"
          controls
          autoPlay
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
        >
          <p>កម្មវិធីរុករករបស់អ្នកមិនគាំទ្រការចាក់វីដេអូទេ។</p>
        </video>
      ) : (
        // Bunny.net Stream or external embed
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