// src/features/admin/AddMovieDrawer.jsx
import { useState, useEffect, useRef } from "react";
import { X, UploadCloud, Loader, AlertCircle } from "lucide-react";
import adminApi from "../../api/adminApi";
import { inputClass } from "../../utils/constants";

const emptyForm = {
  title: "",
  synopsis: "",
  release_date: "",
  duration_minutes: "",
  rating: "",
  access_type: "free",
  is_active: true,
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_BYTES = 5 * 1024 * 1024 * 1024; // 5GB

const formatBytes = (bytes) => {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let val = bytes;
  let i = 0;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i += 1;
  }
  return `${val.toFixed(1)} ${units[i]}`;
};

export default function AddMovieDrawer({ movie, onClose, onSave }) {
  const isEdit = Boolean(movie);

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [genres, setGenres] = useState([]);
  const [categoryIds, setCategoryIds] = useState([]);
  const [genreIds, setGenreIds] = useState([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);

  // Cover image
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const dragCounter = useRef(0);

  // Video file
  const [videoFile, setVideoFile] = useState(null);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState(null);
  const abortControllerRef = useRef(null);

  // Pre-fill on edit
  useEffect(() => {
    if (movie) {
      setForm({
        title: movie.title || "",
        synopsis: movie.synopsis || "",
        release_date: movie.release_date ? movie.release_date.slice(0, 10) : "",
        duration_minutes: movie.duration_minutes || "",
        rating: movie.rating || "",
        access_type: movie.access_type || "free",
        is_active: movie.is_active ?? true,
      });
      setCategoryIds((movie.categories || []).map((c) => c.id));
      setGenreIds((movie.genres || []).map((g) => g.id));
      setImagePreview(movie.poster || "");
    }
  }, [movie]);

  // Load category/genre options
  useEffect(() => {
    (async () => {
      setTaxonomyLoading(true);
      try {
        const [catRes, genRes] = await Promise.all([
          adminApi.getCategories(),
          adminApi.getGenres(),
        ]);
        setCategories(catRes.data?.results || catRes.data || []);
        setGenres(genRes.data?.results || genRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setTaxonomyLoading(false);
      }
    })();
  }, []);

  // Close on Escape (unless an upload is in flight)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [submitting, onClose]);

  // Clean up any object URL we created for the cover preview
  useEffect(() => {
    return () => {
      if (imageFile && imagePreview) URL.revokeObjectURL(imagePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleCategory = (id) => {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleGenre = (id) => {
    setGenreIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // ---- Cover image handling ----
  const handleImageSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Please choose an image file (PNG or JPG) for the cover.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setFormError("Cover image is too large — please keep it under 5MB.");
      return;
    }
    setFormError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCoverInputChange = (e) => {
    handleImageSelect(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current += 1;
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setDragActive(false);
    }
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragActive(false);
    handleImageSelect(e.dataTransfer.files?.[0]);
  };

  // ---- Video handling ----
  const handleVideoInputChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setFormError("Please choose a video file.");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setFormError("Video is too large — please keep it under 5GB.");
      return;
    }
    setFormError(null);
    setVideoFile(file);
  };

  const handleCancelUpload = () => {
    abortControllerRef.current?.abort();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEdit && !imageFile) {
      setFormError("A cover image is required.");
      return;
    }

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("synopsis", form.synopsis);
    if (form.release_date) fd.append("release_date", form.release_date);
    if (form.duration_minutes) fd.append("duration_minutes", form.duration_minutes);
    if (form.rating) fd.append("rating", form.rating);
    fd.append("access_type", form.access_type);
    fd.append("is_active", String(form.is_active));
    categoryIds.forEach((id) => fd.append("categories", id));
    genreIds.forEach((id) => fd.append("genres", id));
    if (imageFile) fd.append("poster", imageFile);
    if (videoFile) fd.append("video_file", videoFile);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setSubmitting(true);
    setFormError(null);
    setUploadProgress(0);
    try {
      const config = {
        signal: controller.signal,
        onUploadProgress: (evt) => {
          if (evt.total) setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      };
      if (isEdit) {
        await adminApi.updateMovie(movie.id, fd, config);
      } else {
        await adminApi.createMovie(fd, config);
      }
      onSave();
    } catch (err) {
      if (err.code === "ERR_CANCELED" || err.name === "CanceledError") {
        setFormError("Upload canceled.");
      } else {
        console.error("Movie save failed:", JSON.stringify(err.response?.data, null, 2) || err);
        const data = err.response?.data;
        const detail =
          data && typeof data === "object"
            ? Object.entries(data)
                .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
                .join(" · ")
            : null;
        setFormError(detail || "Failed to save movie. Check the data and try again.");
      }
    } finally {
      setSubmitting(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
      {/* backdrop */}
      <button
        aria-label="Close"
        onClick={() => !submitting && onClose()}
        className="absolute inset-0 cursor-default"
        tabIndex={-1}
      />

      <div className="relative w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-100">
            {isEdit ? "Edit Movie" : "Add Movie"}
          </h2>
          <button
            onClick={() => !submitting && onClose()}
            disabled={submitting}
            className="text-slate-400 hover:text-white disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cover image */}
          <div className="flex gap-4 items-start">
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`group relative w-28 aspect-[2/3] shrink-0 rounded-lg border-2 border-dashed overflow-hidden transition-colors ${
                dragActive ? "border-amber-400 bg-amber-500/5" : "border-slate-700 bg-slate-800/50"
              }`}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Cover preview" className="h-full w-full object-cover" />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition-colors cursor-pointer">
                    <UploadCloud
                      size={16}
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverInputChange} />
                  </label>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center gap-1 h-full px-2 text-center cursor-pointer">
                  <UploadCloud size={18} className="text-slate-500" />
                  <span className="text-[11px] text-slate-500">Upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverInputChange} />
                </label>
              )}
            </div>
            <div className="flex-1 pt-1">
              <div className="text-sm font-medium text-slate-300">
                Cover poster {!isEdit && "*"}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Portrait image, 2:3 ratio recommended (e.g. 800×1200). PNG or JPG, up to 5MB.
              </p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          {/* Synopsis */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Synopsis</label>
            <textarea
              name="synopsis"
              value={form.synopsis}
              onChange={handleChange}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Release date / duration / rating */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Release date</label>
              <input
                type="date"
                name="release_date"
                value={form.release_date}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Duration (min)</label>
              <input
                type="number"
                name="duration_minutes"
                min="0"
                value={form.duration_minutes}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Rating</label>
              <input
                type="number"
                name="rating"
                min="0"
                max="10"
                step="0.1"
                value={form.rating}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Access type / active */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-1">Access type</label>
              <select
                name="access_type"
                value={form.access_type}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="free">Free</option>
                <option value="member">Membership</option>
                <option value="purchase">Pay Per View</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="is_active" className="text-sm text-slate-300">
                Active
              </label>
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Categories</label>
            {taxonomyLoading ? (
              <p className="text-xs text-slate-500">Loading categories…</p>
            ) : categories.length === 0 ? (
              <p className="text-xs text-slate-500">No categories yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCategory(c.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      categoryIds.includes(c.id)
                        ? "bg-amber-500 text-slate-950 border-amber-500"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Genres</label>
            {taxonomyLoading ? (
              <p className="text-xs text-slate-500">Loading genres…</p>
            ) : genres.length === 0 ? (
              <p className="text-xs text-slate-500">No genres yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {genres.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGenre(g.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      genreIds.includes(g.id)
                        ? "bg-amber-500 text-slate-950 border-amber-500"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Video file */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Movie video file</label>
            {isEdit && movie?.video_filename && !videoFile && (
              <p className="text-xs text-slate-500 mb-2">Current file: {movie.video_filename}</p>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <label className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm px-3 py-2 rounded-lg cursor-pointer transition-colors">
                <UploadCloud size={14} />
                {videoFile ? "Choose different file" : "Choose file"}
                <input type="file" accept="video/*" className="hidden" onChange={handleVideoInputChange} />
              </label>
              {videoFile && (
                <span className="text-xs text-slate-400 truncate">
                  {videoFile.name} · {formatBytes(videoFile.size)}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {isEdit
                ? "Leave empty to keep the current video."
                : "Optional — you can upload the video after creating the movie."}
            </p>
          </div>

          {formError && (
            <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span className="break-words">{formError}</span>
            </div>
          )}

          {submitting && (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{videoFile ? "Uploading video & cover…" : "Saving…"}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-slate-900 pb-1">
            {submitting ? (
              <button
                type="button"
                onClick={handleCancelUpload}
                className="px-4 py-2 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel upload
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-amber-500 text-slate-950 font-medium hover:bg-amber-400 disabled:opacity-60"
            >
              {submitting && <Loader size={14} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Create Movie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}