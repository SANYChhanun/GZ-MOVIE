// src/components/ui/GenreDropdown.jsx â€” With Mobile Support
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import moviesApi from '../../features/movies/moviesApi';

export default function GenreDropdown({ mobile = false }) { // â† NEW prop
  const [genres, setGenres] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const wrapperRef = useRef(null);
  const closeTimer = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await moviesApi.getGenres();
        setGenres(res.data?.results || res.data || []);
      } catch (err) {
        console.error("Failed to load genres:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Close on outside click (only for non-mobile)
  useEffect(() => {
    if (mobile) return; // â† Skip for mobile
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobile]);

  const scheduleClose = () => {
    if (mobile) return;
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const handleGenreClick = (genre) => {
    setOpen(false);
    navigate(`/movies?genre=${genre.slug}`); // â† use slug
  };

  // ===== MOBILE VERSION =====
  if (mobile) {
    return (
      <div className="space-y-1">
        <Link
          to="/movies"
          onClick={() => setOpen(false)}
          className="block text-gray-200 hover:text-white text-xl font-medium px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
        >
          <i className="bi bi-collection-play mr-3 text-red-500" />
          áž—áž¶áž–áž™áž“áŸ’ážáž‘áž¶áŸ†áž„áž¢ážŸáŸ‹
        </Link>
        {loading ? (
          <div className="px-4 py-3 text-gray-500 text-sm">
            <i className="bi bi-arrow-repeat animate-spin mr-2" />
            áž€áŸ†áž–áž»áž„áž•áŸ’áž‘áž»áž€...
          </div>
        ) : genres.length === 0 ? (
          <div className="px-4 py-3 text-gray-500 text-sm">áž˜áž·áž“áž‘áž¶áž“áŸ‹áž˜áž¶áž“áž”áŸ’ážšáž—áŸáž‘</div>
        ) : (
          genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleGenreClick(genre)}
              className="w-full text-left text-gray-300 hover:text-white text-lg font-medium px-4 py-3 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <i className="bi bi-tag text-gray-600" />
                {genre.name}
              </span>
              <i className="bi bi-chevron-right text-xs text-gray-600" />
            </button>
          ))
        )}
      </div>
    );
  }

  // ===== DESKTOP VERSION (original) =====
  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 text-gray-200 hover:text-white text-lg md:text-xl font-medium px-4 py-2 rounded-lg transition-colors hover:bg-white/10 ${
          open ? "bg-white/10 text-white" : ""
        }`}
      >
        áž”áŸ’ážšáž—áŸáž‘ážšáž¿áž„
        <i
          className={`bi bi-chevron-down text-sm transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-96 overflow-y-auto bg-[#141414] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
          {loading ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              <i className="bi bi-arrow-repeat animate-spin mr-1.5" />
              áž€áŸ†áž–áž»áž„áž•áŸ’áž‘áž»áž€...
            </div>
          ) : genres.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              áž˜áž·áž“áž‘áž¶áž“áŸ‹áž˜áž¶áž“áž”áŸ’ážšáž—áŸáž‘
            </div>
          ) : (
            <>
              <Link
                to="/movies"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-200 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors border-b border-white/10 mb-1"
              >
                <i className="bi bi-collection-play text-red-500" />
                áž—áž¶áž–áž™áž“áŸ’ážáž‘áž¶áŸ†áž„áž¢ážŸáŸ‹
              </Link>
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreClick(genre)}
                  className="w-full text-left flex items-center justify-between gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 text-sm transition-colors"
                >
                  <span>{genre.name}</span>
                  <i className="bi bi-chevron-right text-xs text-gray-600" />
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}