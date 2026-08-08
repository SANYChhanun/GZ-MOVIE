// src/pages/admin/CategoryGenreManagementPage.jsx
import { useState, useEffect } from "react";
import { Plus, X, Loader, RefreshCw } from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader";
import adminApi from "../../api/adminApi"; // you already have this
import { inputClass } from "../../utils/constants";

export default function CategoryGenreManagementPage() {
  const [genres, setGenres] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form inputs
  const [newGenre, setNewGenre] = useState("");
  const [newCategory, setNewCategory] = useState("");

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [genresRes, categoriesRes] = await Promise.all([
        adminApi.getGenres(),
        adminApi.getCategories(),
      ]);
      setGenres(genresRes.data);
      setCategories(categoriesRes.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load data. Make sure you're logged in as admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add a new genre
  const handleAddGenre = async (e) => {
    e.preventDefault();
    if (!newGenre.trim()) return;
    const slug = newGenre.trim().toLowerCase().replace(/\s+/g, '-');
    try {
      const res = await adminApi.createGenre({ name: newGenre.trim(), slug });
      setGenres((prev) => [...prev, res.data]);
      setNewGenre("");
    } catch (err) {
      alert("Failed to add genre. It may already exist.");
    }
  };

  // Delete a genre
  const handleDeleteGenre = async (id) => {
    try {
      await adminApi.deleteGenre(id);
      setGenres((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      alert("Failed to delete genre.");
    }
  };

  // Add a new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    const slug = newCategory.trim().toLowerCase().replace(/\s+/g, '-');
    try {
      const res = await adminApi.createCategory({ name: newCategory.trim(), slug });
      setCategories((prev) => [...prev, res.data]);
      setNewCategory("");
    } catch (err) {
      alert("Failed to add category. It may already exist.");
    }
  };

  // Delete a category
  const handleDeleteCategory = async (id) => {
    try {
      await adminApi.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete category.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 bg-slate-800 text-slate-200 px-4 py-2 rounded-lg"
        >
          <RefreshCw size={15} /> Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <SectionHeader
        title="Categories & Genres"
        subtitle="Manage tags used to organize and filter the catalog."
      />

      {/* Genres Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-200 mb-3">Genres</h2>
        <form onSubmit={handleAddGenre} className="flex gap-2 mb-4 max-w-md">
          <input
            value={newGenre}
            onChange={(e) => setNewGenre(e.target.value)}
            placeholder="New genre name..."
            className={`${inputClass} flex-1`}
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} /> Add
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <span
              key={g.id}
              className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-sm text-slate-200"
            >
              {g.name}
              <button
                onClick={() => handleDeleteGenre(g.id)}
                className="text-slate-500 hover:text-rose-400"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-3">Categories</h2>
        <form onSubmit={handleAddCategory} className="flex gap-2 mb-4 max-w-md">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name..."
            className={`${inputClass} flex-1`}
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} /> Add
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-sm text-slate-200"
            >
              {c.name}
              <button
                onClick={() => handleDeleteCategory(c.id)}
                className="text-slate-500 hover:text-rose-400"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}