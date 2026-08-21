// src/features/admin/AddMovieDrawer.jsx — Full Code (Fixed)
import { useState, useEffect, useRef } from "react";
import { X, UploadCloud, Loader, AlertCircle, Video, Trash2 } from "lucide-react";
import * as tus from "tus-js-client";
import adminApi from "../../api/adminApi";
import { inputClass } from "../../utils/constants";

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  short_description: "",
  country: "",
  language: "",
  release_date: "",
  duration: "",
  rating: "",
  access_type: "free",
  purchase_price: "",
  is_featured: false,
  is_new_release: false,
  is_active: true,
  content_type: "movie",
  countries: [],
  has_khmer_dub: false,
  has_khmer_sub: false,
  bunny_video_id: "",
  total_episodes: "",
  trailer_url: "", 
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024 * 1024;

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

function ImageDropBox({ preview, aspect, label, hint, onFileSelect }) {
  const [dragActive, setDragActive] = useState(false);
  const dragCounter = useRef(0);

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
    onFileSelect(e.dataTransfer.files?.[0]);
  };
  const handleInputChange = (e) => {
    onFileSelect(e.target.files?.[0]);
    e.target.value = "";
  };

  return (
    <div className="flex-1 min-w-[160px]">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`group relative w-full ${aspect} rounded-lg border-2 border-dashed overflow-hidden transition-colors ${
          dragActive ? "border-amber-400 bg-amber-500/5" : "border-slate-700 bg-slate-800/50"
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt={`${label} preview`} className="h-full w-full object-cover" />
            <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition-colors cursor-pointer">
              <UploadCloud size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              <input type="file" accept="image/*" className="hidden" onChange={handleInputChange} />
            </label>
          </>
        ) : (
          <label className="flex flex-col items-center justify-center gap-1 h-full px-2 text-center cursor-pointer">
            <UploadCloud size={18} className="text-slate-500" />
            <span className="text-[11px] text-slate-500">Upload</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleInputChange} />
          </label>
        )}
      </div>
      <div className="text-xs font-medium text-slate-300 mt-1.5">{label}</div>
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <label
      className={`flex items-center justify-between gap-4 py-3 px-4 rounded-xl border cursor-pointer transition-colors ${
        checked ? "bg-amber-500/10 border-amber-500/40" : "bg-slate-800/60 border-slate-700 hover:border-slate-600"
      }`}
      onClick={(e) => {
        e.preventDefault();
        onChange(!checked);
      }}
    >
      <div>
        <div className="text-sm font-medium text-slate-200">{label}</div>
        {description && <div className="text-xs text-slate-500 mt-0.5">{description}</div>}
      </div>
      <span
        role="switch"
        aria-checked={checked}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${checked ? "bg-amber-500" : "bg-slate-700"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </label>
  );
}

export default function AddMovieDrawer({ movie, onClose, onSave }) {
  const isEdit = Boolean(movie);

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [seriesTypes, setSeriesTypes] = useState([]);
  const [categoryIds, setCategoryIds] = useState([]);
  const [genreIds, setGenreIds] = useState([]);
  const [countryIds, setCountryIds] = useState([]);
  const [seriesTypeIds, setSeriesTypeIds] = useState([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [backdropFile, setBackdropFile] = useState(null);
  const [backdropPreview, setBackdropPreview] = useState("");

  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [bunnyVideoId, setBunnyVideoId] = useState(null);
  const [videoCleared, setVideoCleared] = useState(false);
  const originalBunnyVideoIdRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState(null);
  const tusUploadRef = useRef(null);

  useEffect(() => {
    if (movie) {
      setForm({
        title: movie.title || "",
        slug: movie.slug || "",
        description: movie.description || "",
        short_description: movie.short_description || "",
        country: movie.country || "",
        language: movie.language || "",
        release_date: movie.release_date ? movie.release_date.slice(0, 10) : "",
        duration: movie.duration || "",
        rating: movie.rating || "",
        access_type: movie.access_type || "free",
        purchase_price: movie.purchase_price || "",
        is_featured: movie.is_featured || false,
        is_new_release: movie.is_new_release || false,
        is_active: movie.is_active ?? true,
        content_type: movie.content_type || "movie",
        has_khmer_dub: movie.has_khmer_dub || false,
        has_khmer_sub: movie.has_khmer_sub || false,
        bunny_video_id: movie.bunny_video_id || "",
        total_episodes: movie.total_episodes || "",
        trailer_url: movie.trailer_url || "",  
      });
      setCategoryIds((movie.categories || []).map((c) => (typeof c === "object" ? c.id : c)));
      setGenreIds((movie.genres || []).map((g) => (typeof g === "object" ? g.id : g)));
      setCountryIds((movie.countries || []).map((c) => (typeof c === "object" ? c.id : c)));
      setSeriesTypeIds((movie.series_types || []).map((st) => (typeof st === "object" ? st.id : st)));
      setImagePreview(movie.poster || "");
      setBackdropPreview(movie.backdrop || "");
      setBunnyVideoId(movie.bunny_video_id || null);
      originalBunnyVideoIdRef.current = movie.bunny_video_id || null;
    }
  }, [movie]);

  useEffect(() => {
    (async () => {
      setTaxonomyLoading(true);
      try {
        const [catRes, genRes, countryRes, seriesTypeRes] = await Promise.all([
          adminApi.getCategories(),
          adminApi.getGenres(),
          adminApi.getCountries(),
          adminApi.getSeriesTypes(),
        ]);
        setCategories(catRes.data?.results || catRes.data || []);
        setGenres(genRes.data?.results || genRes.data || []);
        setCountries(countryRes.data?.results || countryRes.data || []);
        setSeriesTypes(seriesTypeRes.data?.results || seriesTypeRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setTaxonomyLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [submitting, onClose]);

  useEffect(() => {
    return () => {
      if (imageFile && imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    return () => {
      if (backdropFile && backdropPreview) URL.revokeObjectURL(backdropPreview);
    };
  }, [backdropPreview]);

  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [videoPreview]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setForm((prev) => {
      const updated = { 
        ...prev, 
        [name]: type === "checkbox" ? checked : value 
      };
      
      if (name === 'access_type' && value !== 'purchase') {
        updated.purchase_price = '';
      }
      
      return updated;
    });
  };

  const handleTitleChange = (e) => {
    setForm((prev) => ({ ...prev, title: e.target.value }));
  };

  const toggleCategory = (id) => {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleGenre = (id) => {
    setGenreIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleCountry = (id) => {
    setCountryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSeriesType = (id) => {
    setSeriesTypeIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleImageSelect = (file, type) => {
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
    const url = URL.createObjectURL(file);
    if (type === "poster") {
      setImageFile(file);
      setImagePreview(url);
    } else {
      setBackdropFile(file);
      setBackdropPreview(url);
    }
  };

  const handleVideoInputChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setFormError("Please choose a video file.");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setFormError("Video is too large — please keep it under 50GB.");
      return;
    }
    setFormError(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setVideoCleared(false);
    setBunnyVideoId(null);
  };

  const handleVideoDrop = (e) => {
    e.preventDefault();
    handleVideoInputChange({ target: { files: e.dataTransfer.files, value: "" } });
  };

  const handleRemoveVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    if (videoFile) {
      setVideoFile(null);
      setVideoPreview("");
      setBunnyVideoId(originalBunnyVideoIdRef.current);
      setVideoCleared(false);
    } else {
      setVideoFile(null);
      setVideoPreview("");
      setBunnyVideoId(null);
      setVideoCleared(true);
    }
  };

  const uploadVideoDirectToBunny = (file, title) =>
    new Promise((resolve, reject) => {
      (async () => {
        try {
          console.log("[bunny-upload] requesting TUS credentials…");

          const res = await adminApi.initVideoUpload({ title });
          const creds = res.data;

          const upload = new tus.Upload(file, {
            endpoint: creds.endpoint,
            retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
            headers: {
              AuthorizationSignature: creds.signature,
              AuthorizationExpire: creds.expiration_time,
              VideoId: creds.video_id,
              LibraryId: creds.library_id,
            },
            metadata: { filetype: file.type, title: file.name },
            chunkSize: 50 * 1024 * 1024,
            onError: (err) => {
              console.error("[bunny-upload] tus onError", err);
              reject(err);
            },
            onProgress: (uploaded, total) => {
              const pct = Math.round((uploaded / total) * 100);
              setUploadProgress(pct);
            },
            onSuccess: () => {
              console.log("[bunny-upload] success, video_id:", creds.video_id);
              resolve(creds.video_id);
            },
          });

          tusUploadRef.current = upload;

          const previousUploads = await upload.findPreviousUploads();
          if (previousUploads.length) {
            upload.resumeFromPreviousUpload(previousUploads[0]);
          }

          upload.start();
        } catch (err) {
          console.error("[bunny-upload] setup failed:", err);
          const detail = err?.response?.status
            ? `(${err.response.status}) ${JSON.stringify(err.response.data)}`
            : err?.message || "unknown error";
          reject(new Error(`Could not start the video upload — ${detail}`));
        }
      })();
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("[movie-save] handleSubmit fired", { isEdit });

    // ============ VALIDATION ============
    if (!isEdit && !imageFile) {
      setFormError("A cover image is required.");
      return;
    }
    
    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    
    if (!form.description.trim()) {
      setFormError("Description is required.");
      return;
    }
    
    if (!form.country.trim() || !form.language.trim()) {
      setFormError("Country and language are required.");
      return;
    }
    
    if (!form.duration) {
      setFormError("Duration is required.");
      return;
    }
    
    if (!form.release_date) {
      setFormError("Release date is required.");
      return;
    }
    
    if (form.access_type === 'purchase') {
      if (!form.purchase_price || Number(form.purchase_price) <= 0) {
        setFormError("Purchase price is required and must be greater than 0 for Pay Per View.");
        return;
      }
    }

    console.log("[movie-save] validation passed, submitting…");
    setSubmitting(true);
    setFormError(null);
    setUploadProgress(0);

    let finalBunnyVideoId = form.bunny_video_id?.trim() || bunnyVideoId;

    if (videoFile && !finalBunnyVideoId) {
      setSubmitStage("video");
      try {
        finalBunnyVideoId = await uploadVideoDirectToBunny(videoFile, form.title || "Untitled");
        setBunnyVideoId(finalBunnyVideoId);
        setForm(prev => ({ ...prev, bunny_video_id: finalBunnyVideoId }));
      } catch (err) {
        setFormError(err?.message || "Video upload to Bunny failed. Please try again.");
        setSubmitting(false);
        setSubmitStage(null);
        return;
      }
    }

    setSubmitStage("saving");
    setUploadProgress(0);

    const fd = new FormData();
    
    // ============ BASIC FIELDS ============
    fd.append("title", form.title);
    fd.append("description", form.description);
    if (form.short_description) fd.append("short_description", form.short_description);
    if (form.trailer_url) fd.append("trailer_url", form.trailer_url); 
    fd.append("country", form.country);
    fd.append("language", form.language);
    if (form.release_date) fd.append("release_date", form.release_date);
    fd.append("duration", form.duration);
    if (form.rating) fd.append("rating", form.rating);
    
    // ============ ACCESS TYPE ============
    fd.append("access_type", form.access_type || "free");
    if (form.access_type === 'purchase') {
      fd.append("purchase_price", form.purchase_price);
    }
    
    // ============ FLAGS ============
    fd.append("is_featured", String(form.is_featured || false));
    fd.append("is_new_release", String(form.is_new_release || false));
    fd.append("is_active", String(form.is_active ?? true));
    
    // ============ M2M FIELDS ============
    categoryIds.forEach((id) => fd.append("categories", id));
    genreIds.forEach((id) => fd.append("genres", id));
    countryIds.forEach((id) => fd.append("countries", id));
    
    // ============ CONTENT TYPE ============
    fd.append("content_type", form.content_type || "movie");
    fd.append("has_khmer_dub", String(form.has_khmer_dub || false));
    fd.append("has_khmer_sub", String(form.has_khmer_sub || false));
    
    // ============ SERIES FIELDS ============
    // ✅ ក្រោយ
    if (form.content_type === 'series') {
      seriesTypeIds.forEach((id) => fd.append("series_types", id));
      if (form.total_episodes) {
        fd.append("total_episodes", form.total_episodes);
      }
    }
    
    // ============ FILES ============
    if (imageFile) fd.append("poster", imageFile);
    if (backdropFile) fd.append("backdrop", backdropFile);
    
    // ============ VIDEO ============
    if (finalBunnyVideoId) {
      fd.append("bunny_video_id", finalBunnyVideoId);
    } else if (videoCleared) {
      fd.append("bunny_video_id", "");
    }

    try {
      console.log("[movie-save] sending", isEdit ? "PATCH" : "POST", "to /api/admin/movies/");
      
      let saveRes;
      if (isEdit) {
        // ✅ សម្រាប់ edit
        saveRes = await adminApi.updateMovie(movie.id, fd);
      } else {
        // ✅ សម្រាប់ create
        saveRes = await adminApi.createMovie(fd);
      }
      
      console.log("[movie-save] server responded:", saveRes?.data);
      onSave();
      
    } catch (err) {
      console.error("[movie-save] save failed:", err);
      
      const data = err.response?.data;
      const detail =
        data && typeof data === "object"
          ? Object.entries(data)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
              .join(" · ")
          : null;
      
      setFormError(detail || "Failed to save movie. Check the data and try again.");
      
    } finally {
      setSubmitting(false);
      setSubmitStage(null);
      tusUploadRef.current = null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm py-8 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl my-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">{isEdit ? "Edit Movie" : "Add Movie"}</h2>
            <p className="text-sm text-slate-400 mt-1">
              {isEdit ? "Update this title's details" : "Fill in the details to add a new title"}
            </p>
          </div>
          <button
            onClick={() => !submitting && onClose()}
            disabled={submitting}
            className="text-slate-400 hover:text-white disabled:opacity-40 p-2"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Cover poster + Backdrop */}
          <div className="flex gap-4 flex-wrap sm:flex-nowrap">
            <ImageDropBox
              preview={imagePreview}
              aspect="aspect-[2/3]"
              label={`Cover poster ${!isEdit ? "*" : ""}`}
              hint="2:3 ratio, e.g. 800×1200. Up to 5MB."
              onFileSelect={(file) => handleImageSelect(file, "poster")}
            />
            <ImageDropBox
              preview={backdropPreview}
              aspect="aspect-video"
              label="Backdrop / Banner"
              hint="16:9 ratio, e.g. 1600×900. Up to 5MB."
              onFileSelect={(file) => handleImageSelect(file, "backdrop")}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleTitleChange}
              required
              className={`${inputClass} w-full`}
            />
          </div>

          {/* Content Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              ប្រភេទមាតិកា *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, content_type: 'movie' }))}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                  form.content_type === 'movie'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <i className="bi bi-film mr-2"></i>
                រឿងដុំ (Movie)
              </button>
              // ✅ ក្រោយ
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, content_type: 'series' }))}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                  form.content_type === 'series'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <i className="bi bi-tv mr-2"></i>
                រឿងភាគ (Series)
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              required
              className={`${inputClass} w-full resize-none`}
            />
          </div>

          {/* Short description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Short description</label>
            <input
              type="text"
              name="short_description"
              value={form.short_description}
              onChange={handleChange}
              placeholder="One-line teaser shown in listing cards"
              className={`${inputClass} w-full`}
            />
          </div>
          {/* ✅ Trailer URL — បន្ថែមថ្មី */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Trailer URL</label>
            <input
              type="url"
              name="trailer_url"
              value={form.trailer_url}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=..."
              className={`${inputClass} w-full`}
            />
            <p className="text-[11px] text-slate-500 mt-1">YouTube ឬវីដេអូ trailer link (ស្រេចចិត្ត)</p>
          </div>

          {/* Country / Language */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Country *</label>
              <input
                type="text"
                name="country"
                value={form.country}
                onChange={handleChange}
                required
                placeholder="e.g. Cambodia"
                className={`${inputClass} w-full`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Language *</label>
              <input
                type="text"
                name="language"
                value={form.language}
                onChange={handleChange}
                required
                placeholder="e.g. Khmer"
                className={`${inputClass} w-full`}
              />
            </div>
          </div>

          {/* Countries Multi-select */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              ប្រទេស (អាចជ្រើសរើសច្រើន)
            </label>
            {taxonomyLoading ? (
              <p className="text-xs text-slate-500">Loading countries…</p>
            ) : countries.length === 0 ? (
              <p className="text-xs text-slate-500">No countries yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {countries.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCountry(c.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      countryIds.includes(c.id)
                        ? "bg-amber-500 text-slate-950 border-amber-500"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    {c.flag && <span className="mr-1">{c.flag}</span>}
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Series Types for TV Show */}
          {form.content_type === 'series' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  ប្រភេទរឿងភាគ
                </label>
                {taxonomyLoading ? (
                  <p className="text-xs text-slate-500">Loading series types…</p>
                ) : seriesTypes.length === 0 ? (
                  <p className="text-xs text-slate-500">មិនទាន់មានប្រភេទរឿងភាគទេ</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {seriesTypes.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => toggleSeriesType(st.id)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          seriesTypeIds.includes(st.id)
                            ? "bg-amber-500 text-slate-950 border-amber-500"
                            : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        {st.flag && <span className="mr-1">{st.flag}</span>}
                        {st.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  ចំនួនភាគសរុប
                </label>
                <input
                  type="number"
                  name="total_episodes"
                  value={form.total_episodes || ''}
                  onChange={handleChange}
                  min="0"
                  placeholder="ឧទាហរណ៍៖ 24"
                  className={`${inputClass} w-full`}
                />
              </div>
            </>
          )}

          {/* Release date / duration / rating */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Release date *</label>
              <input
                type="date"
                name="release_date"
                value={form.release_date}
                required
                onChange={handleChange}
                className={`${inputClass} w-full`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Duration (min) *</label>
              <input
                type="number"
                name="duration"
                min="0"
                value={form.duration}
                onChange={handleChange}
                required
                className={`${inputClass} w-full`}
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
                className={`${inputClass} w-full`}
              />
            </div>
          </div>

          {/* Access type */}
          <div className="space-y-3">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  ប្រភេទចូលប្រើ *
                </label>
                <select
                  name="access_type"
                  value={form.access_type}
                  onChange={handleChange}
                  className={`${inputClass} w-full`}
                >
                  <option value="free">ឥតគិតថ្លៃ (Free)</option>
                  <option value="member">សមាជិក VIP (Member)</option>
                  <option value="purchase">ទិញមើល (Pay Per View)</option>
                </select>
              </div>
              
              {form.access_type === "purchase" && (
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    តម្លៃទិញ *
                  </label>
                  <input
                    type="number"
                    name="purchase_price"
                    min="0"
                    step="0.01"
                    value={form.purchase_price}
                    onChange={handleChange}
                    placeholder="ឧទាហរណ៍៖ 2.99"
                    required
                    className={`${inputClass} w-full`}
                  />
                </div>
              )}
            </div>
            
            {form.access_type === "free" && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm text-green-400">
                អ្នកប្រើទាំងអស់អាចមើលបានដោយមិនចាំបាច់ចូលគណនី
              </div>
            )}
            
            {form.access_type === "member" && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-400">
                មានតែសមាជិក VIP ប៉ុណ្ណោះដែលអាចមើលបាន
              </div>
            )}
            
            {form.access_type === "purchase" && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-400">
                អ្នកប្រើត្រូវទិញមុនពេលមើល។ ចូលប្រើបាន 30 ថ្ងៃ
              </div>
            )}
          </div>

          {/* Khmer Dub / Sub */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              ភាសា និងសំឡេង
            </label>
            <div className="grid grid-cols-2 gap-3">
              <ToggleSwitch
                checked={form.has_khmer_dub}
                onChange={(v) => setForm(prev => ({ ...prev, has_khmer_dub: v }))}
                label="សំឡេងខ្មែរ"
                description="មានសំឡេងនិយាយខ្មែរ"
              />
              <ToggleSwitch
                checked={form.has_khmer_sub}
                onChange={(v) => setForm(prev => ({ ...prev, has_khmer_sub: v }))}
                label="អក្សររត់ខ្មែរ"
                description="មានអក្សររត់ពីក្រោមខ្មែរ"
              />
            </div>
          </div>

          {/* Bunny Video ID */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Bunny Video ID <span className="text-yellow-400">(បញ្ចូលដោយផ្ទាល់)</span>
            </label>
            <input
              type="text"
              name="bunny_video_id"
              value={form.bunny_video_id || ""}
              onChange={handleChange}
              placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
              className={`${inputClass} w-full font-mono text-sm`}
            />
          </div>

          {/* Video file upload */}
          {!form.bunny_video_id && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Movie video file</label>
              {videoFile && videoPreview ? (
                <div className="rounded-xl overflow-hidden border border-slate-700 bg-black">
                  <video src={videoPreview} controls className="w-full max-h-72 bg-black" />
                  <div className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-800/80">
                    <span className="text-xs text-slate-300 truncate">
                      {videoFile.name} · {formatBytes(videoFile.size)}
                    </span>
                    <button type="button" onClick={handleRemoveVideo} className="text-xs text-red-400 hover:text-red-300">
                      លុប
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleVideoDrop}
                  className="relative rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 hover:border-slate-600 transition-colors"
                >
                  <label className="flex flex-col items-center justify-center gap-1.5 py-8 px-4 text-center cursor-pointer">
                    <UploadCloud size={22} className="text-slate-500" />
                    <span className="text-sm text-slate-400">
                      <span className="text-amber-400 font-medium">ចុច</span> ឬទាញឯកសារវីដេអូមកដាក់
                    </span>
                    <span className="text-xs text-slate-600">MP4, MOV, MKV — អតិបរមា 50GB</span>
                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoInputChange} />
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Display options */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">ជម្រើសបង្ហាញ</label>
            <div className="grid sm:grid-cols-3 gap-2">
              <ToggleSwitch
                checked={form.is_featured}
                onChange={(v) => setForm((prev) => ({ ...prev, is_featured: v }))}
                label="Banner ទំព័រដើម"
              />
              <ToggleSwitch
                checked={form.is_new_release}
                onChange={(v) => setForm((prev) => ({ ...prev, is_new_release: v }))}
                label="ចេញថ្មី"
              />
              <ToggleSwitch
                checked={form.is_active}
                onChange={(v) => setForm((prev) => ({ ...prev, is_active: v }))}
                label="ដំណើរការ"
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Categories</label>
            {taxonomyLoading ? (
              <p className="text-xs text-slate-500">Loading…</p>
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
              <p className="text-xs text-slate-500">Loading…</p>
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

          {formError && (
            <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span className="break-words">{formError}</span>
            </div>
          )}

          {submitting && (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{submitStage === "video" ? "Uploading video…" : "Saving…"}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 text-sm rounded-lg bg-amber-500 text-slate-950 font-medium hover:bg-amber-400 disabled:opacity-60"
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