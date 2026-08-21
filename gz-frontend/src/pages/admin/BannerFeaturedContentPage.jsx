// src/pages/admin/BannerFeaturedContentPage.jsx — hero & promo strip banners.
import { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader,
  RefreshCw,
  UploadCloud,
  AlertCircle,
  Film,
  Link2,
} from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader";
import Badge from "../../components/common/Badge";
import IconBtn from "../../components/common/IconBtn";
import adminApi from "../../api/adminApi";
import { inputClass } from "../../utils/constants";

// NOTE ON link_type/movie/external_url (was a single free-text `link` field):
// HeroBannerCreateUpdateSerializer does NOT accept a raw `link` string at all --
// `link` is computed server-side in Movie.save()/HeroBanner.save() from either
// `movie` (an FK, chosen from a dropdown here) or `external_url`. This guarantees a
// "movie" banner always resolves to /watch/<movie.id> and an admin can never
// accidentally type in a raw video URL. See HeroBanner.save() in models.py and
// HeroBannerCreateUpdateSerializer.validate() in serializers.py.

const emptyForm = {
  title: "",
  subtitle: "",
  link_type: "movie", // 'movie' | 'external' | 'none'
  movie: "",
  external_url: "",
  order: 0,
  is_active: true,
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export default function BannerFeaturedContentPage() {
  const [banners, setBanners] = useState([]);
  const [movies, setMovies] = useState([]); // for the "pick a movie" dropdown
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null); // null = create mode
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Text/toggle fields (image is handled separately as a real file)
  const [form, setForm] = useState(emptyForm);

  // Image upload state
  const [imageFile, setImageFile] = useState(null); // File object, only set when user picks/drops a new one
  const [imagePreview, setImagePreview] = useState(""); // object URL (new file) or existing banner.image URL
  const [dragActive, setDragActive] = useState(false);
  const dragCounter = useRef(0);

  // Fetch banners
// ក្នុង BannerFeaturedContentPage.jsx - ជំនួស fetchBanners function
const fetchBanners = async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await adminApi.getBanners();
    console.log('Banners API response:', res.data);
    
    // ✅ កែឱ្យដោះស្រាយទិន្នន័យគ្រប់ទម្រង់
    const data = res.data;
    if (Array.isArray(data)) {
      setBanners(data);
    } else if (data?.results && Array.isArray(data.results)) {
      setBanners(data.results);
    } else if (data?.data && Array.isArray(data.data)) {
      setBanners(data.data);
    } else {
      console.warn('Unexpected banners data format:', data);
      setBanners([]);
    }
  } catch (err) {
    console.error('Error fetching banners:', err);
    setError("Failed to load banners. Check admin permissions.");
    setBanners([]); // ✅ កំណត់ជា array ទទេ ដើម្បីកុំឱ្យ error
  } finally {
    setLoading(false);
  }
};

  // Fetch movies for the picker (used only when link_type === 'movie')
  const fetchMovies = async () => {
    setMoviesLoading(true);
    try {
      const res = await adminApi.getMovies({ page_size: 500 });
      const list = Array.isArray(res.data?.results) ? res.data.results : (Array.isArray(res.data) ? res.data : []);
      setMovies(list);
    } catch (err) {
      console.error("Failed to load movies for banner picker:", err);
    } finally {
      setMoviesLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchMovies();
  }, []);

  // Revoke any object URL we created when the modal closes/unmounts
  useEffect(() => {
    return () => {
      if (imageFile && imagePreview) URL.revokeObjectURL(imagePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagePreview]);

  // Open modal for create/edit
  const openCreateModal = () => {
    setEditingBanner(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview("");
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      link_type: banner.link_type || "movie",
      movie: banner.movie_id ?? "",
      external_url: banner.external_url || "",
      order: banner.order,
      is_active: banner.is_active,
    });
    setImageFile(null);
    setImagePreview(banner.image || "");
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setImageFile(null);
    setImagePreview("");
    setFormError(null);
  };

  // Handle text/checkbox input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Validate + stage a picked/dropped image file
  const handleImageSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Please choose an image file (PNG or JPG).");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setFormError("Image is too large — please keep it under 5MB.");
      return;
    }
    setFormError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileInputChange = (e) => {
    handleImageSelect(e.target.files?.[0]);
    e.target.value = ""; // allow re-selecting the same file later
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

  // Revert a staged replacement back to the original image (edit mode only)
  const clearStagedImage = () => {
    if (imageFile && imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(editingBanner?.image || "");
  };

  // Submit (create or update) — sends multipart/form-data so the image file reaches Django's ImageField
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingBanner && !imageFile) {
      setFormError("A banner image is required.");
      return;
    }
    if (form.link_type === "movie" && !form.movie) {
      setFormError("Please pick a movie for this banner to link to.");
      return;
    }
    if (form.link_type === "external" && !form.external_url.trim()) {
      setFormError("Please provide an external URL.");
      return;
    }

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("subtitle", form.subtitle);
    fd.append("link_type", form.link_type);
    if (form.link_type === "movie") fd.append("movie", form.movie);
    if (form.link_type === "external") fd.append("external_url", form.external_url);
    fd.append("order", String(form.order));
    fd.append("is_active", String(form.is_active));
    if (imageFile) fd.append("image", imageFile);

    setSubmitting(true);
    setFormError(null);
    try {
      if (editingBanner) {
        const res = await adminApi.updateBanner(editingBanner.id, fd);
        setBanners((prev) =>
          prev.map((b) => (b.id === editingBanner.id ? res.data : b))
        );
      } else {
        const res = await adminApi.createBanner(fd);
        setBanners((prev) => [...prev, res.data]);
      }
      closeModal();
    } catch (err) {
      const data = err.response?.data;
      console.error("Banner save failed:", JSON.stringify(data, null, 2) || err);
      const detail =
        data && typeof data === "object"
          ? Object.entries(data)
              .map(([field, msgs]) =>
                `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`
              )
              .join(" · ")
          : null;
      setFormError(detail || "Failed to save banner. Check the data and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      await adminApi.deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert("Failed to delete banner.");
    }
  };

  // Render
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
          onClick={fetchBanners}
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
        title="Banners & Featured Content"
        subtitle="Manage the hero banners and promotional strips shown on the landing page."
        action={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} /> New Banner
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="group relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900"
          >
            {banner.image ? (
              <img
                src={banner.image}
                alt={banner.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-amber-500/20 via-slate-800 to-slate-900 flex items-center justify-center">
                <ImageIcon size={22} className="text-amber-400/70" />
              </div>
            )}

            {/* readability gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

            {/* top-left: order + status */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
              <span className="text-[11px] font-mono bg-slate-950/70 text-slate-300 px-1.5 py-0.5 rounded">
                #{banner.order}
              </span>
              <Badge tone={banner.is_active ? "jade" : "muted"}>
                {banner.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>

            {/* top-right: actions, revealed on hover */}
            <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <IconBtn
                icon={Pencil}
                title="Edit"
                onClick={() => openEditModal(banner)}
              />
              <IconBtn
                icon={Trash2}
                tone="crimson"
                title="Remove"
                onClick={() => handleDelete(banner.id)}
              />
            </div>

            {/* bottom: title/subtitle/link */}
            <div className="absolute bottom-0 left-0 right-0 p-3.5">
              <div className="text-sm font-semibold text-slate-50 truncate">
                {banner.title}
              </div>
              {banner.subtitle && (
                <div className="text-xs text-slate-300/80 truncate mt-0.5">
                  {banner.subtitle}
                </div>
              )}
              <div className="text-[11px] text-slate-500 truncate mt-1 flex items-center gap-1">
                {banner.link_type === "movie" ? (
                  <>
                    <Film size={11} className="shrink-0" />
                    {banner.movie_title || "(no movie selected)"}
                  </>
                ) : banner.link_type === "external" ? (
                  <>
                    <Link2 size={11} className="shrink-0" />
                    {banner.external_url}
                  </>
                ) : (
                  "No link"
                )}
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center gap-3 py-16 text-center border border-dashed border-slate-800 rounded-xl">
            <ImageIcon size={26} className="text-slate-600" />
            <div>
              <p className="text-slate-400 text-sm">No banners yet.</p>
              <p className="text-slate-600 text-xs mt-0.5">
                Add one to feature it on the landing page.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors mt-1"
            >
              <Plus size={15} /> New Banner
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold text-slate-100 mb-4">
              {editingBanner ? "Edit Banner" : "New Banner"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Banner image {!editingBanner && "*"}
                </label>

                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`relative rounded-lg border-2 border-dashed overflow-hidden transition-colors ${
                    dragActive
                      ? "border-amber-400 bg-amber-500/5"
                      : "border-slate-700 bg-slate-800/50"
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative aspect-video">
                      <img
                        src={imagePreview}
                        alt="Banner preview"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 hover:bg-black/50 transition-colors">
                        <label className="opacity-0 hover:opacity-100 [div:hover>&]:opacity-100 transition-opacity cursor-pointer inline-flex items-center gap-1.5 bg-slate-950/85 text-slate-100 text-xs font-medium px-3 py-1.5 rounded-lg">
                          <UploadCloud size={14} /> Replace
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileInputChange}
                          />
                        </label>
                      </div>
                      {imageFile && (
                        <button
                          type="button"
                          onClick={clearStagedImage}
                          title="Undo — keep current image"
                          className="absolute top-2 right-2 bg-slate-950/80 text-slate-300 hover:text-white rounded-full p-1"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-1.5 aspect-video px-4 text-center cursor-pointer">
                      <UploadCloud size={22} className="text-slate-500" />
                      <span className="text-sm text-slate-400">
                        <span className="text-amber-400 font-medium">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </span>
                      <span className="text-xs text-slate-600">
                        PNG or JPG, up to 5MB · Recommended 1600×900
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileInputChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Subtitle
                </label>
                <textarea
                  name="subtitle"
                  value={form.subtitle}
                  onChange={handleChange}
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Link target: this drives what clicking the banner actually does.
                  "Movie" is the normal case — the banner always resolves to the
                  movie's own /watch/<id> detail page, never a raw video URL. */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Links to
                </label>
                <div className="flex gap-2 mb-3">
                  {[
                    { value: "movie", label: "A movie", icon: Film },
                    { value: "external", label: "External URL", icon: Link2 },
                    { value: "none", label: "No link", icon: X },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, link_type: value }))}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        form.link_type === value
                          ? "bg-amber-500/15 border-amber-500 text-amber-400"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Icon size={14} /> {label}
                    </button>
                  ))}
                </div>

                {form.link_type === "movie" && (
                  <div>
                    <select
                      name="movie"
                      value={form.movie}
                      onChange={handleChange}
                      className={`${inputClass} w-full`}
                    >
                      <option value="">
                        {moviesLoading ? "Loading movies…" : "Select a movie…"}
                      </option>
                      {movies.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      The banner will link to this movie's page (/watch/{form.movie || "…"}).
                    </p>
                  </div>
                )}

                {form.link_type === "external" && (
                  <input
                    type="url"
                    name="external_url"
                    value={form.external_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    className={`${inputClass} w-full`}
                  />
                )}
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={form.order}
                    onChange={handleChange}
                    className={inputClass}
                  />
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

              {formError && (
                <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-4 py-2 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-amber-500 text-slate-950 font-medium hover:bg-amber-400 disabled:opacity-60"
                >
                  {submitting && <Loader size={14} className="animate-spin" />}
                  {editingBanner ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}