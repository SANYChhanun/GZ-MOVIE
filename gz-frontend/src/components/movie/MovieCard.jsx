// src/components/movie/MovieCard.jsx — Netflix Style Card (Fixed)
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function MovieCard({ movie, listView = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();

  // ============ HELPER: Get Poster URL ============
  const getPosterUrl = () => {
    if (!movie) return null;
    
    // Try multiple possible field names
  const imageUrl = movie.poster_url || movie.poster || movie.backdrop_url || movie.backdrop || '/images/placeholder.jpg';
    
    if (!imageUrl) return null;
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's a relative path, prepend the base URL
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const cleanBase = baseUrl.replace(/\/$/, '');
    const cleanPoster = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    
    return `${cleanBase}${cleanPoster}`;
  };

  // Destructure movie data with fallbacks
  const posterUrl = getPosterUrl();  // ← ប្រើ function នេះ
  const title = movie?.title || movie?.name || 'គ្មានចំណងជើង';
  const rating = movie?.rating ? Number(movie.rating).toFixed(1) : null;
  const year = movie?.release_date?.split('-')[0] || movie?.year || '';
  const duration = movie?.duration || null;
  const genres = movie?.genres || [];
  const isFree = movie?.access_type === 'free';
  const isMember = movie?.access_type === 'member';
  const isNew = movie?.is_new_release || false;
  const description = movie?.short_description || movie?.description || '';

  // Only show badge for VIP or Paid (Free is default, no badge needed)
  const showAccessBadge = !isFree;
  const accessLabel = isMember ? 'VIP' : 'ទិញ';
  const accessColor = isMember 
    ? 'bg-amber-500 text-black font-bold' 
    : 'bg-rose-500 text-white';

  // ============ LIST VIEW ============
  if (listView) {
    return (
      <Link
        to={user ? `/watch/${movie.id}` : `/movies/${movie.id}`}
        className="block group/card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`
          flex gap-4 bg-card rounded-xl overflow-hidden border border-white/5
          transition-all duration-300
          ${isHovered ? 'bg-[#2A2A2A] border-white/10 shadow-lg' : ''}
        `}>
          {/* Thumbnail */}
          <div className="w-24 md:w-32 aspect-[2/3] bg-gray-800 flex-shrink-0 relative overflow-hidden">
            {posterUrl && !imageError ? (
              <img
                src={posterUrl}
                alt={title}
                className="w-full h-full object-cover saturate-[1.15] contrast-[1.05]"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <i className="bi bi-film text-2xl text-gray-600"></i>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 py-3 pr-4">
            <h3 className="text-white font-bold text-sm">{title}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
              {rating && (
                <span className="text-yellow-400 flex items-center gap-1">
                  <i className="bi bi-star-fill text-[10px]"></i>
                  {rating}
                </span>
              )}
              {year && <span>{year}</span>}
              {duration && <span>{duration} នាទី</span>}
            </div>
            {genres.length > 0 && (
              <p className="text-gray-500 text-xs mt-1">
                {genres.map(g => typeof g === 'string' ? g : g.name).join(', ')}
              </p>
            )}
            {description && (
              <p className="text-gray-500 text-xs mt-2 line-clamp-2">{description}</p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // ============ GRID VIEW (Default) ============
  return (
    <Link
      to={user ? `/watch/${movie.id}` : `/movies/${movie.id}`}
      className="block group/card relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Container with smooth scaling */}
      <div className={`
        relative rounded-xl overflow-hidden
        transition-all duration-500 ease-out
        ${isHovered 
          ? 'scale-110 z-50 -translate-y-2 shadow-2xl shadow-black/50' 
          : 'scale-100 z-10 shadow-lg shadow-black/20'
        }
      `}>
        
        {/* Poster Container - 2:3 Aspect Ratio */}
        <div className="aspect-[2/3] relative overflow-hidden rounded-xl bg-gray-900">
          
          {/* ============ LOADING STATE ============ */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-750 to-gray-900 animate-pulse z-10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <i className="bi bi-film text-4xl text-gray-600"></i>
                  <div className="w-16 h-1 bg-gray-700 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {/* ============ ERROR STATE ============ */}
          {imageError && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center gap-3 z-10">
              <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center">
                <i className="bi bi-image text-3xl text-gray-500"></i>
              </div>
              <span className="text-xs text-gray-500 text-center px-3 line-clamp-2">{title}</span>
            </div>
          )}

          {/* ============ MAIN POSTER IMAGE ============ */}
          {!imageError && posterUrl && (
            <img
              src={posterUrl}
              alt={title}
              className={`
                absolute inset-0 w-full h-full object-cover transition-all duration-700
                saturate-[1.2] contrast-[1.06]
                ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                ${isHovered ? 'scale-110 blur-[3px] brightness-50' : 'scale-100 blur-0 brightness-100'}
              `}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
            />
          )}

          {/* ============ FALLBACK WHEN NO POSTER ============ */}
          {!posterUrl && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center gap-3 z-10">
              <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center">
                <i className="bi bi-film text-3xl text-gray-500"></i>
              </div>
              <span className="text-xs text-gray-500 text-center px-3 line-clamp-2">{title}</span>
            </div>
          )}

          {/* ============ GRADIENT OVERLAYS ============ */}
          {/* Bottom gradient - always visible for title readability */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20" />
          
          {/* Top gradient - subtle, always visible */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent z-20" />
          
          {/* Hover overlay - darker */}
          <div className={`
            absolute inset-0 bg-black/0 transition-all duration-500 z-20
            ${isHovered ? 'bg-black/20' : ''}
          `} />

          {/* ============ NEW BADGE (Top Left) ============ */}
          {isNew && (
            <div className="absolute top-2.5 left-2.5 z-30">
              <span className="bg-red-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-xl shadow-red-600/40 flex items-center gap-1">
                <i className="bi bi-lightning-fill text-[8px]"></i>ថ្មី
              </span>
            </div>
          )}

          {/* ============ ACCESS BADGE (Top Right) - Only VIP/Paid ============ */}
          {showAccessBadge && (
            <div className={`absolute top-2.5 right-2.5 text-[10px] px-2.5 py-1 rounded-full font-bold shadow-xl z-30 ${accessColor}`}>
              {accessLabel}
            </div>
          )}

          {/* ============ PLAY BUTTON (Center - Hover Only) ============ */}
          <div className={`
            absolute inset-0 z-40 flex items-center justify-center
            transition-all duration-500
            ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}
          `}>
            <div className="relative">
              {/* Pulse ring */}
              <div className="absolute inset-0 w-16 h-16 bg-red-600/30 rounded-full animate-ping"></div>
              {/* Play button */}
              <div className="relative w-14 h-14 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-600/50 border-2 border-white/20 transition-all duration-300 hover:scale-110">
                <i className="bi bi-play-fill text-2xl text-white ml-0.5"></i>
              </div>
            </div>
          </div>

          {/* ============ BOTTOM CONTENT (Title Always Visible) ============ */}
          <div className="absolute bottom-0 left-0 right-0 z-30 p-3">
            {/* Title - ALWAYS VISIBLE */}
            <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 mb-1.5">
              {title}
            </h3>

            {/* Meta Info Row - ALWAYS VISIBLE */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Rating with Star */}
              {rating && (
                <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-sm text-yellow-400 text-xs px-2 py-0.5 rounded-lg font-bold">
                  <i className="bi bi-star-fill text-[9px]"></i>
                  {rating}
                </div>
              )}
              
              {/* Year */}
              {year && (
                <span className="text-gray-400 text-xs">{year}</span>
              )}
              
              {/* Duration */}
              {duration && (
                <>
                  <span className="text-gray-600 text-xs">•</span>
                  <span className="text-gray-400 text-xs flex items-center gap-1">
                    <i className="bi bi-clock text-[10px]"></i>
                    {duration} នាទី
                  </span>
                </>
              )}
            </div>

            {/* ============ EXTENDED INFO (Hover Only) ============ */}
            <div className={`
              transition-all duration-500 overflow-hidden
              ${isHovered ? 'max-h-32 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}
            `}>
              {/* Genres */}
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {genres.slice(0, 3).map((genre, idx) => (
                    <span 
                      key={idx} 
                      className="text-[10px] text-gray-300 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/5"
                    >
                      {typeof genre === 'string' ? genre : genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              {description && (
                <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2 mb-2">
                  {description}
                </p>
              )}

              {/* Watch Now Link */}
              <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold hover:text-red-300 transition-colors group/link">
                <i className="bi bi-play-circle-fill"></i>
                <span>មើលឥឡូវនេះ</span>
                <i className="bi bi-chevron-right text-[10px] group-hover/link:translate-x-0.5 transition-transform"></i>
              </div>
            </div>
          </div>

          {/* ============ SHINE EFFECT (Hover Only) ============ */}
          <div className={`
            absolute inset-0 z-25 pointer-events-none
            transition-all duration-700
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.03] to-white/0"></div>
          </div>
        </div>
      </div>
    </Link>
  );
}