// src/components/common/GenreDropdown.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import moviesApi from "../../api/moviesApi";

export default function GenreDropdown({ mobile = false }) {
  const [genres, setGenres] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const wrapperRef = useRef(null);
  const closeTimer = useRef(null);
  const navigate = useNavigate();

  // ============ FETCH GENRES ============
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const res = await moviesApi.getGenres();
        // API returns: { data: [{id, name, slug}, ...] }
        const genreData = res.data || [];
        setGenres(genreData);
      } catch (err) {
        console.error("Failed to load genres:", err);
        // Fallback: use empty array
        setGenres([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  // ============ CLOSE ON OUTSIDE CLICK (Desktop only) ============
  useEffect(() => {
    if (mobile) return; // Skip for mobile

    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobile]);

  // ============ HOVER DELAY (Desktop only) ============
  const scheduleClose = () => {
    if (mobile) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  // ============ HANDLE GENRE CLICK ============
  const handleGenreClick = (genre) => {
    setOpen(false);
    // Navigate to movies page with genre filter
    navigate(`/movies?genre=${genre.slug}`);
  };

  // ============ RENDER ============
  
  // ----- MOBILE VERSION -----
  if (mobile) {
    return (
      <div className="space-y-1">
        {/* All Movies Link */}
        <Link
          to="/movies"
          onClick={() => setOpen(false)}
          className="block text-gray-200 hover:text-white text-xl font-medium px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
        >
          <i className="bi bi-collection-play mr-3 text-red-500" />
          ភាពយន្តទាំងអស់
        </Link>

        {/* Loading State */}
        {loading ? (
          <div className="px-4 py-3 text-gray-500 text-sm flex items-center gap-2">
            <i className="bi bi-arrow-repeat animate-spin" />
            កំពុងផ្ទុក...
          </div>
        ) : genres.length === 0 ? (
          <div className="px-4 py-3 text-gray-500 text-sm">
            មិនទាន់មានប្រភេទ
          </div>
        ) : (
          // Genre List
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

  // ----- DESKTOP VERSION -----
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
      {/* Trigger Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 text-gray-200 hover:text-white text-lg md:text-xl font-medium px-4 py-2 rounded-lg transition-colors hover:bg-white/10 ${
          open ? "bg-white/10 text-white" : ""
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        ប្រភេទរឿង
        <i
          className={`bi bi-chevron-down text-sm transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-96 overflow-y-auto bg-[#141414] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
          {loading ? (
            // Loading
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              <i className="bi bi-arrow-repeat animate-spin mr-1.5" />
              កំពុងផ្ទុក...
            </div>
          ) : genres.length === 0 ? (
            // Empty
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              មិនទាន់មានប្រភេទ
            </div>
          ) : (
            <>
              {/* All Movies Link */}
              <Link
                to="/movies"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-200 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors border-b border-white/10 mb-1"
              >
                <i className="bi bi-collection-play text-red-500" />
                ភាពយន្តទាំងអស់
              </Link>

              {/* Genre List */}
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