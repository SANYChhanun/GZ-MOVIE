// src/pages/admin/MovieListPage.jsx
import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Pencil, Trash2, Star, Film, Loader, RefreshCw } from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader";
import Badge, { accessTone, statusTone } from "../../components/common/Badge";
import IconBtn from "../../components/common/IconBtn";
import Table from "../../components/common/Table";
import AddMovieDrawer from "../../features/admin/AddMovieDrawer";
import adminApi from "../../api/adminApi";
import { ACCESS_TYPES, inputClass } from "../../utils/constants";

// Helper to map access_type to a display string (if your backend uses "free"/"member"/"purchase")
const accessDisplay = (type) => {
  const map = { free: "Free", member: "Membership", purchase: "Pay Per View" };
  return map[type] || type;
};

const PAGE_SIZE = 10;   // adjust as needed

export default function MovieListPage() {
  // Data state
  const [movies, setMovies] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtering & pagination state
  const [query, setQuery] = useState("");
  const [accessFilter, setAccessFilter] = useState("");
  const [ordering, setOrdering] = useState("-release_date");  // default ordering
  const [page, setPage] = useState(1);

  // Drawer state
  const [showAddMovie, setShowAddMovie] = useState(false);

  // Function to fetch movies from API
  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        ordering,
      };
      if (query.trim()) params.search = query.trim();
      if (accessFilter) params.access_type = accessFilter;   // matches your MovieFilter field

      const res = await adminApi.getMovies(params);
      // Response depends on whether pagination is active.
      // If DRF returns a paginated object: { count, results, next, previous }
      if (res.data && Array.isArray(res.data.results)) {
        setMovies(res.data.results);
        setTotalCount(res.data.count);
      } else if (Array.isArray(res.data)) {
        // Unpaginated list
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
  }, [query, accessFilter, ordering, page]);

  // Refetch when search/filter/page changes
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Reset page to 1 when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [query, accessFilter]);

  // Delete movie handler
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this movie? This action cannot be undone.")) return;
    try {
      await adminApi.deleteMovie(id);
      // Refetch list (or remove locally)
      fetchMovies();
    } catch (err) {
      alert("Failed to delete movie.");
    }
  };

  // Handler for after creating a movie – refresh list
  const handleMovieCreated = () => {
    setShowAddMovie(false);
    fetchMovies();
  };

  // Loading state
  if (loading && movies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchMovies}
          className="inline-flex items-center gap-2 bg-slate-800 text-slate-200 px-4 py-2 rounded-lg"
        >
          <RefreshCw size={15} /> Retry
        </button>
      </div>
    );
  }

  // Pagination controls (simple)
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <SectionHeader
        title="Movies"
        subtitle={`${totalCount} titles in the catalog`}
        action={
          <button
            onClick={() => setShowAddMovie(true)}
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
        <select
          value={accessFilter}
          onChange={(e) => setAccessFilter(e.target.value)}
          className={inputClass}
        >
          <option value="">All Access</option>
          <option value="free">Free</option>
          <option value="member">Membership</option>
          <option value="purchase">Pay Per View</option>
        </select>
        <select
          value={ordering}
          onChange={(e) => setOrdering(e.target.value)}
          className={inputClass}
        >
          <option value="-release_date">Latest first</option>
          <option value="release_date">Oldest first</option>
          <option value="-rating">Top rated</option>
          <option value="-view_count">Most viewed</option>
        </select>
      </div>

      {/* Table (using your existing Table component) */}
      <Table
        headers={["Title", "Category", "Access", "Status", "Year", "Views", "Rating", ""]}
        empty="No movies match your criteria."
        rows={movies.map((m) => [
          <div key={m.id} className="flex items-center gap-3">
            <div className="w-8 h-11 rounded bg-gradient-to-br from-amber-500/25 to-slate-800 flex items-center justify-center border border-slate-700 shrink-0">
              <Film size={13} className="text-amber-400" />
            </div>
            <span className="font-medium text-slate-100">{m.title}</span>
          </div>,
          // If categories is an array of objects, join names
          m.categories?.map(c => c.name).join(", ") || "—",
          <Badge tone={accessTone(m.access_type)} key={`acc-${m.id}`}>{accessDisplay(m.access_type)}</Badge>,
          <Badge tone={statusTone(m.is_active ? "Active" : "Inactive")} key={`stat-${m.id}`}>
            {m.is_active ? "Active" : "Inactive"}
          </Badge>,
          new Date(m.release_date).getFullYear(),
          m.view_count,
          <span className="flex items-center gap-1" key={`rate-${m.id}`}>
            {m.rating && (
              <>
                <Star size={12} className="text-amber-400" />
                {Number(m.rating).toFixed(1)}
              </>
            )}
          </span>,
          <div className="flex items-center gap-1.5" key={`act-${m.id}`}>
            <IconBtn icon={Pencil} title="Edit" />
            <IconBtn icon={Trash2} tone="crimson" title="Delete" onClick={() => handleDelete(m.id)} />
          </div>,
        ])}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 text-sm rounded bg-slate-800 text-slate-300 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1 text-sm text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 text-sm rounded bg-slate-800 text-slate-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Add Movie Drawer */}
      {showAddMovie && (
        <AddMovieDrawer
          onClose={() => setShowAddMovie(false)}
          onSave={handleMovieCreated}
        />
      )}
    </>
  );
}