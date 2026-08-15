// src/pages/admin/MovieListPage.jsx — កែលម្អ
import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Plus, Pencil, Trash2, Star, Film, Loader, RefreshCw, Calendar, Eye } from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader";
import Badge, { accessTone, statusTone } from "../../components/common/Badge";
import IconBtn from "../../components/common/IconBtn";
import Table from "../../components/common/Table";
import adminApi from "../../api/adminApi";
import AddMovieDrawer from "../../features/admin/AddMovieDrawer";

/* ============================================================
   Shared helpers (កែលម្អ)
   ============================================================ */

const accessDisplay = (type) => {
  const map = { 
    free: "Free", 
    member: "Membership", 
    purchase: "Pay Per View" 
  };
  return map[type] || type || "—";
};

const formatCategories = (categories) => {
  if (!Array.isArray(categories) || categories.length === 0) return "—";
  return categories
    .map((c) => (c && typeof c === "object" ? c.name : c))
    .filter(Boolean)
    .join(", ");
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString('km-KH', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const inputClass = "bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all";
const PAGE_SIZE = 10;

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
   Movie List Page (កែលម្អ)
   ============================================================ */

export default function MovieListPage() {
  const [movies, setMovies] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [accessFilter, setAccessFilter] = useState("");
  const [ordering, setOrdering] = useState("-release_date");
  const [page, setPage] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Drawer state
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

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
  }, [debouncedQuery, accessFilter, ordering, page]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, accessFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this movie? This action cannot be undone.")) return;
    try {
      await adminApi.deleteMovie(id);
      // បើទំព័រចុងក្រោយមានតែ 1 item ហើយលុបចោល ត្រូវត្រឡប់ទៅទំព័រមុន
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
      <Table
        headers={["Title", "Category", "Access", "Status", "Year", "Views", "Rating", ""]}
        empty="No movies match your criteria."
        rows={movies.map((m) => [
          <div key={m.id} className="flex items-center gap-3">
            <MoviePosterThumb src={m.poster} alt={m.title} />
            <span className="font-medium text-slate-100">{m.title}</span>
          </div>,
          formatCategories(m.categories),
          <Badge tone={accessTone[m.access_type] || accessTone.free} key={`acc-${m.id}`}>
            {accessDisplay(m.access_type)}
          </Badge>,
          <Badge tone={statusTone[m.is_active ? "Active" : "Inactive"] || statusTone.inactive} key={`stat-${m.id}`}>
            {m.is_active ? "Active" : "Inactive"}
          </Badge>,
          <span className="flex items-center gap-1" key={`year-${m.id}`}>
            <Calendar size={12} className="text-slate-500" />
            {new Date(m.release_date).getFullYear() || "—"}
          </span>,
          <span className="flex items-center gap-1" key={`views-${m.id}`}>
            <Eye size={12} className="text-slate-500" />
            {m.view_count?.toLocaleString() || 0}
          </span>,
          <span className="flex items-center gap-1" key={`rate-${m.id}`}>
            {m.rating && (
              <>
                <Star size={12} className="text-amber-400" />
                {Number(m.rating).toFixed(1)}
              </>
            )}
          </span>,
          <div className="flex items-center gap-1.5" key={`act-${m.id}`}>
            <IconBtn icon={Pencil} title="Edit" onClick={() => handleEditClick(m)} />
            <IconBtn icon={Trash2} tone="crimson" title="Delete" onClick={() => handleDelete(m.id)} />
          </div>,
        ])}
      />

      {/* Pagination - កែលម្អឱ្យស្អាតជាងមុន */}
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
        <AddMovieDrawer
          movie={editingMovie}
          onClose={handleFormCancel}
          onSave={handleFormSave}
        />
      )}
    </>
  );
}