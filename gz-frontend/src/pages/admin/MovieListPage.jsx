// src/pages/admin/MovieListPage.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Star,
  Film,
  Loader,
  RefreshCw,
  Calendar,
  Eye,
  Clapperboard,
} from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader";
import Badge, { accessTone, statusTone } from "../../components/common/Badge";
import IconBtn from "../../components/common/IconBtn";
import Table from "../../components/common/Table";
import adminApi from "../../api/adminApi";
import EpisodeManager from "../../features/admin/EpisodeManager";
import AddMovieDrawer from "../../features/admin/AddMovieDrawer";
import MovieDetailDrawer from "../../features/admin/MovieDetailDrawer";

/* ============================================================
   Shared helpers
   ============================================================ */

const accessDisplay = (type) => {
  const map = {
    free: "Free",
    member: "Membership",
    purchase: "Pay Per View",
  };
  return map[type] || type || "—";
};

const contentTypeDisplay = (type) => {
  const map = {
    movie: "រឿងដុំ",
    series: "រឿងភាគ",
    documentary: "Documentary",
    anime: "Anime",
  };
  return map[type] || type || "—";
};

const inputClass =
  "bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all";
const PAGE_SIZE = 10;

/* ============================================================
   Badge helpers (deterministic color per name)
   ============================================================ */

const CATEGORY_PALETTE = [
  "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "bg-sky-500/15 text-sky-300 border-sky-500/30",
  "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "bg-violet-500/15 text-violet-300 border-violet-500/30",
  "bg-rose-500/15 text-rose-300 border-rose-500/30",
  "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  "bg-lime-500/15 text-lime-300 border-lime-500/30",
];

const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const paletteFor = (name) => CATEGORY_PALETTE[hashString(name) % CATEGORY_PALETTE.length];

// tone="category" uses hash-based varied colors; tone="genre"/"neutral" use a single
// calm color so different taxonomy columns stay visually distinct from each other.
function CategoryBadges({ items, max = 2, tone = "category", flagKey = null }) {
  const normalized = Array.isArray(items)
    ? items
        .map((c) => (c && typeof c === "object" ? { name: c.name, flag: flagKey ? c[flagKey] : null } : { name: c }))
        .filter((c) => c.name)
    : [];

  if (normalized.length === 0) {
    return <span className="text-slate-600 text-xs">—</span>;
  }

  const shown = normalized.slice(0, max);
  const remaining = normalized.length - shown.length;

  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((c) => (
        <span
          key={c.name}
          className={`text-[11px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${
            tone === "genre"
              ? "bg-slate-700/40 text-slate-300 border-slate-600"
              : tone === "neutral"
              ? "bg-sky-500/10 text-sky-300 border-sky-500/25"
              : paletteFor(c.name)
          }`}
        >
          {c.flag && <span className="mr-1">{c.flag}</span>}
          {c.name}
        </span>
      ))}
      {remaining > 0 && (
        <span className="text-[11px] px-2 py-0.5 rounded-full border border-slate-700 text-slate-400">
          +{remaining}
        </span>
      )}
    </div>
  );
}

function MoviePosterThumb({ src, alt }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div className="w-8 h-11 rounded overflow-hidden bg-gradient-to-br from-amber-500/25 to-slate-800 flex items-center justify-center border border-slate-700 shrink-0">
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
          loading="lazy"
        />
      ) : (
        <Film size={13} className="text-amber-400" />
      )}
    </div>
  );
}

/* ============================================================
   Movie List Page
   ============================================================ */

export default function MovieListPage() {
  const [movies, setMovies] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showEpisodes, setShowEpisodes] = useState(false);
  const [managingMovie, setManagingMovie] = useState(null);

  const [query, setQuery] = useState("");
  const [accessFilter, setAccessFilter] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("");
  const [ordering, setOrdering] = useState("-release_date");
  const [page, setPage] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Add/Edit full-page form state
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  // Detail (read-only) drawer state
  const [showDetail, setShowDetail] = useState(false);
  const [viewingMovie, setViewingMovie] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, ordering };
      if (debouncedQuery.trim()) params.search = debouncedQuery.trim();
      if (accessFilter) params.access_type = accessFilter;
      if (contentTypeFilter) params.content_type = contentTypeFilter;

      const res = await adminApi.getMovies(params);
      if (res.data && Array.isArray(res.data.results)) {
        setMovies(res.data.results);
        setTotalCount(res.data.count);
      } else if (Array.isArray(res.data)) {
        setMovies(res.data);
        setTotalCount(res.data.length);
      } else {
        setMovies([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load movies. Check your connection and permissions.");
      setMovies([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, accessFilter, contentTypeFilter, ordering, page]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, accessFilter, contentTypeFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm("លុបភាពយន្តនេះ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។")) return;
    try {
      await adminApi.deleteMovie(id);
      if (movies.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchMovies();
      }
    } catch (err) {
      alert("Failed to delete movie.");
    }
  };

  const handleAddClick = () => {
    setEditingMovie(null);
    setShowForm(true);
  };

  const handleEditClick = (movie) => {
    setEditingMovie(movie);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMovie(null);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingMovie(null);
    fetchMovies();
  };

  // ---- Detail drawer handlers ----
  const handleViewClick = (movie) => {
    setViewingMovie(movie);
    setShowDetail(true);
  };

  const handleDetailClose = () => {
    setShowDetail(false);
    setViewingMovie(null);
  };

  const handleDetailEdit = (movie) => {
    setShowDetail(false);
    setViewingMovie(null);
    setEditingMovie(movie);
    setShowForm(true);
  };

  const handleDetailDelete = (id) => {
    handleDetailClose();
    handleDelete(id);
  };

  // ---- Episode manager handlers (previously referenced but missing) ----
  const handleManageEpisodes = (movie) => {
    setManagingMovie(movie);
    setShowEpisodes(true);
  };

  const handleEpisodesClose = () => {
    setShowEpisodes(false);
    setManagingMovie(null);
    // episode counts may have changed — refresh the list
    fetchMovies();
  };

  const totalPages = useMemo(() => Math.ceil(totalCount / PAGE_SIZE), [totalCount]);

  if (loading && movies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="animate-spin text-amber-500 mx-auto mb-4" size={32} />
          <p className="text-slate-400 text-sm">កំពុងផ្ទុកទិន្នន័យ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="bi bi-exclamation-triangle text-2xl text-red-400"></i>
        </div>
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchMovies}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw size={15} /> Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <SectionHeader
        title="Movies"
        subtitle={`${totalCount} titles in the catalog`}
        action={
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} /> Add Movie
          </button>
        }
      />

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies..."
            className={`${inputClass} pl-8 w-full`}
          />
        </div>
        <select value={contentTypeFilter} onChange={(e) => setContentTypeFilter(e.target.value)} className={inputClass}>
          <option value="">All Types</option>
          <option value="movie">Movie</option>
          <option value="series">Series</option>
          <option value="documentary">Documentary</option>
          <option value="anime">Anime</option>
        </select>
        <select value={accessFilter} onChange={(e) => setAccessFilter(e.target.value)} className={inputClass}>
          <option value="">All Access</option>
          <option value="free">Free</option>
          <option value="member">Membership</option>
          <option value="purchase">Pay Per View</option>
        </select>
        <select value={ordering} onChange={(e) => setOrdering(e.target.value)} className={inputClass}>
          <option value="-release_date">Latest first</option>
          <option value="release_date">Oldest first</option>
          <option value="-rating">Top rated</option>
          <option value="-view_count">Most viewed</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table
          headers={[
            "Title",
            "Type",
            "Category",
            "Genre",
            "Country",
            "Series Type",
            "Access",
            "Status",
            "Year",
            "Views",
            "Rating",
            "",
          ]}
          empty="No movies match your criteria."
          rows={movies.map((m) => [
            <div key={m.id} className="flex items-center gap-3">
              <MoviePosterThumb src={m.poster_url || m.poster} alt={m.title} />
              <div className="min-w-0">
                <div className="font-medium text-slate-100 truncate max-w-[180px]">{m.title}</div>
                {m.content_type === "series" && (
                  <div className="text-[11px] text-slate-500">
                    {m.episode_count ?? 0}/{m.total_episodes || "?"} ភាគ
                  </div>
                )}
              </div>
            </div>,
            <span key={`type-${m.id}`} className="text-xs text-slate-400 whitespace-nowrap">
              {contentTypeDisplay(m.content_type)}
            </span>,
            <CategoryBadges items={m.categories} tone="category" key={`cat-${m.id}`} />,
            <CategoryBadges items={m.genres} tone="genre" key={`gen-${m.id}`} />,
            <CategoryBadges items={m.countries} tone="neutral" flagKey="flag" key={`country-${m.id}`} />,
            <CategoryBadges items={m.series_types} tone="category" flagKey="flag" key={`st-${m.id}`} />,
            <Badge tone={accessTone[m.access_type] || accessTone.free} key={`acc-${m.id}`}>
              {accessDisplay(m.access_type)}
            </Badge>,
            <Badge tone={statusTone[m.is_active ? "Active" : "Inactive"] || statusTone.inactive} key={`stat-${m.id}`}>
              {m.is_active ? "Active" : "Inactive"}
            </Badge>,
            <span className="flex items-center gap-1 whitespace-nowrap" key={`year-${m.id}`}>
              <Calendar size={12} className="text-slate-500" />
              {m.release_date ? new Date(m.release_date).getFullYear() : "—"}
            </span>,
            <span className="flex items-center gap-1 whitespace-nowrap" key={`views-${m.id}`}>
              <Eye size={12} className="text-slate-500" />
              {m.view_count?.toLocaleString() || 0}
            </span>,
            <span className="flex items-center gap-1 whitespace-nowrap" key={`rate-${m.id}`}>
              {m.rating ? (
                <>
                  <Star size={12} className="text-amber-400" />
                  {Number(m.rating).toFixed(1)}
                </>
              ) : (
                <span className="text-slate-600">—</span>
              )}
            </span>,
            <div className="flex items-center gap-1.5" key={`act-${m.id}`}>
              <button
                onClick={() => handleViewClick(m)}
                title="មើលលម្អិត"
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
              >
                <i className="bi bi-eye-fill" style={{ fontSize: 14 }} />
              </button>
              {m.content_type === "series" && (
                <button
                  onClick={() => handleManageEpisodes(m)}
                  title="គ្រប់គ្រងភាគ"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                >
                  <Clapperboard size={14} />
                </button>
              )}
              <IconBtn icon={Pencil} title="Edit" onClick={() => handleEditClick(m)} />
              <IconBtn icon={Trash2} tone="crimson" title="Delete" onClick={() => handleDelete(m.id)} />
            </div>,
          ])}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2 items-center">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 text-sm rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 transition-colors"
          >
            <i className="bi bi-chevron-left mr-1"></i>
            Prev
          </button>
          <span className="px-3 py-1 text-sm text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 text-sm rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 transition-colors"
          >
            Next
            <i className="bi bi-chevron-right ml-1"></i>
          </button>
        </div>
      )}

      {/* Add / Edit Movie Drawer */}
      {showForm && (
        <AddMovieDrawer movie={editingMovie} onClose={handleFormCancel} onSave={handleFormSave} />
      )}

      {/* Detail (read-only) Drawer */}
      {showDetail && viewingMovie && (
        <MovieDetailDrawer
          movie={viewingMovie}
          onClose={handleDetailClose}
          onEdit={handleDetailEdit}
          onDelete={handleDetailDelete}
        />
      )}

      {showEpisodes && managingMovie && (
        <EpisodeManager movie={managingMovie} onClose={handleEpisodesClose} />
      )}
    </>
  );
}