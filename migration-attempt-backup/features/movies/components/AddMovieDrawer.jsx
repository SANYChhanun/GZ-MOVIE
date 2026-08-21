// src/features/admin/AddMovieDrawer.jsx â€” Full Code with All New Fields
import { useState, useEffect, useRef } from "react";
import { X, UploadCloud, Loader, AlertCircle, Video, Trash2 } from "lucide-react";
import * as tus from "tus-js-client";
import adminApi from "../../admin/adminApi";
import { inputClass } from '../../../config/constants';

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
  total_episodes: "",  // â† áž”áž“áŸ’ážáŸ‚áž˜
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

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

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
  const [seriesTypes, setSeriesTypes] = useState([]);  // â† áž”áž“áŸ’ážáŸ‚áž˜
  const [categoryIds, setCategoryIds] = useState([]);
  const [genreIds, setGenreIds] = useState([]);
  const [countryIds, setCountryIds] = useState([]);
  const [seriesTypeIds, setSeriesTypeIds] = useState([]);  // â† áž”áž“áŸ’ážáŸ‚áž˜
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
  const abortControllerRef = useRef(null);
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
        total_episodes: movie.total_episodes || "",  // â† áž”áž“áŸ’ážáŸ‚áž˜
      });
      setCategoryIds((movie.categories || []).map((c) => (typeof c === "object" ? c.id : c)));
      setGenreIds((movie.genres || []).map((g) => (typeof g === "object" ? g.id : g)));
      setCountryIds((movie.countries || []).map((c) => (typeof c === "object" ? c.id : c)));
      setSeriesTypeIds((movie.series_types || []).map((st) => (typeof st === "object" ? st.id : st)));  // â† áž”áž“áŸ’ážáŸ‚áž˜
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
          adminApi.getSeriesTypes(),  // â† áž”áž“áŸ’ážáŸ‚áž˜
        ]);
        setCategories(catRes.data?.results || catRes.data || []);
        setGenres(genRes.data?.results || genRes.data || []);
        setCountries(countryRes.data?.results || countryRes.data || []);
        setSeriesTypes(seriesTypeRes.data?.results || seriesTypeRes.data || []);  // â† áž”áž“áŸ’ážáŸ‚áž˜
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
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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

  // â† áž”áž“áŸ’ážáŸ‚áž˜ toggle function ážŸáž˜áŸ’ážšáž¶áž”áŸ‹ Series Types
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
      setFormError("Image is too large â€” please keep it under 5MB.");
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
      setFormError("Video is too large â€” please keep it under 50GB.");
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
          console.log("[bunny-upload] requesting TUS credentialsâ€¦", {
            fileName: file.name,
            fileSizeBytes: file.size,
            fileSizeGB: (file.size / 1024 / 1024 / 1024).toFixed(2),
          });

          const res = await adminApi.initVideoUpload({ title });
          const creds = res.data;
          console.log("[bunny-upload] got credentials", creds);

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
              console.log(`[bunny-upload] progress ${pct}% (${uploaded}/${total} bytes)`);
              setUploadProgress(pct);
            },
            onSuccess: () => {
              console.log("[bunny-upload] success, video_id:", creds.video_id);
              resolve(creds.video_id);
            },
          });

          tusUploadRef.current = upload;
          console.log("[bunny-upload] tus.Upload instance created");

          const previousUploads = await upload.findPreviousUploads();
          console.log("[bunny-upload] previousUploads:", previousUploads);
          if (previousUploads.length) {
            upload.resumeFromPreviousUpload(previousUploads[0]);
          }

          console.log("[bunny-upload] calling upload.start()â€¦");
          upload.start();
        } catch (err) {
          console.error("[bunny-upload] setup failed:", err);
          const detail = err?.response?.status
            ? `(${err.response.status}) ${JSON.stringify(err.response.data)}`
            : err?.message || "unknown error";
          reject(new Error(`Could not start the video upload â€” ${detail}`));
        }
      })();
    });

  const handleCancelUpload = () => {
    if (submitStage === "video") {
      tusUploadRef.current?.abort();
    } else {
      abortControllerRef.current?.abort();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[movie-save] handleSubmit fired", { isEdit, form });

    if (!isEdit && !imageFile) {
      setFormError("A cover image is required.");
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

    console.log("[movie-save] validation passed, submittingâ€¦");
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
        setFormError(
          err?.message === "AbortError" || err?.name === "AbortError"
            ? "Video upload canceled."
            : err?.message || "Video upload to Bunny failed. Please try again."
        );
        setSubmitting(false);
        setSubmitStage(null);
        return;
      }
    }

    setSubmitStage("saving");
    setUploadProgress(0);

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    if (form.short_description) fd.append("short_description", form.short_description);
    fd.append("country", form.country);
    fd.append("language", form.language);
    if (form.release_date) fd.append("release_date", form.release_date);
    fd.append("duration", form.duration);
    if (form.rating) fd.append("rating", form.rating);
    fd.append("access_type", form.access_type);
    if (form.purchase_price) fd.append("purchase_price", form.purchase_price);
    fd.append("is_featured", String(form.is_featured));
    fd.append("is_new_release", String(form.is_new_release));
    fd.append("is_active", String(form.is_active));
    
    categoryIds.forEach((id) => fd.append("categories", id));
    genreIds.forEach((id) => fd.append("genres", id));
    
    // New fields
    fd.append("content_type", form.content_type || "movie");
    fd.append("has_khmer_dub", String(form.has_khmer_dub || false));
    fd.append("has_khmer_sub", String(form.has_khmer_sub || false));
    countryIds.forEach((id) => fd.append("countries", id));
    
    // â† áž”áž“áŸ’ážáŸ‚áž˜ series_types áž“áž·áž„ total_episodes
    if (form.content_type === 'tv_show') {
      seriesTypeIds.forEach((id) => fd.append("series_types", id));
      if (form.total_episodes) {
        fd.append("total_episodes", form.total_episodes);
      }
    }
    
    if (imageFile) fd.append("poster", imageFile);
    if (backdropFile) fd.append("backdrop", backdropFile);
    
    if (finalBunnyVideoId) {
      fd.append("bunny_video_id", finalBunnyVideoId);
    } else if (videoCleared) {
      fd.append("bunny_video_id", "");
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const config = {
        signal: controller.signal,
        onUploadProgress: (evt) => {
          if (evt.total) setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      };
      console.log("[movie-save] sending", isEdit ? "PATCH" : "POST", "to /admin/movies/");
      let saveRes;
      if (isEdit) {
        saveRes = await adminApi.updateMovie(movie.id, fd, config);
      } else {
        saveRes = await adminApi.createMovie(fd, config);
      }
      console.log("[movie-save] server responded:", saveRes?.data);
      onSave();
    } catch (err) {
      console.error("[movie-save] save failed:", err);
      if (err.code === "ERR_CANCELED" || err.name === "CanceledError") {
        setFormError("Save canceled.");
      } else {
        const data = err.response?.data;
        const detail =
          data && typeof data === "object"
            ? Object.entries(data)
                .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
                .join(" Â· ")
            : null;
        setFormError(detail || "Failed to save movie. Check the data and try again.");
      }
    } finally {
      setSubmitting(false);
      setSubmitStage(null);
      abortControllerRef.current = null;
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
              hint="2:3 ratio, e.g. 800Ã—1200. Up to 5MB."
              onFileSelect={(file) => handleImageSelect(file, "poster")}
            />
            <ImageDropBox
              preview={backdropPreview}
              aspect="aspect-video"
              label="Backdrop / Banner"
              hint="16:9 ratio, e.g. 1600Ã—900. Up to 5MB."
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
              áž”áŸ’ážšáž—áŸáž‘áž˜áž¶ážáž·áž€áž¶ *
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
                ážšáž¿áž„ážŠáž»áŸ† (Movie)
              </button>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, content_type: 'tv_show' }))}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                  form.content_type === 'tv_show'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <i className="bi bi-tv mr-2"></i>
                ážšáž¿áž„áž—áž¶áž‚ (TV Show)
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

          {/* Countries (Multi-select) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              áž”áŸ’ážšáž‘áŸážŸ (áž¢áž¶áž…áž‡áŸ’ážšáž¾ážŸážšáž¾ážŸáž…áŸ’ážšáž¾áž“)
            </label>
            {taxonomyLoading ? (
              <p className="text-xs text-slate-500">Loading countriesâ€¦</p>
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

          {/* â† áž”áž“áŸ’ážáŸ‚áž˜ Series Types section ážŸáž˜áŸ’ážšáž¶áž”áŸ‹ TV Shows */}
          {form.content_type === 'tv_show' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  áž”áŸ’ážšáž—áŸáž‘ážšáž¿áž„áž—áž¶áž‚
                </label>
                {taxonomyLoading ? (
                  <p className="text-xs text-slate-500">Loading series typesâ€¦</p>
                ) : seriesTypes.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    áž˜áž·áž“áž‘áž¶áž“áŸ‹áž˜áž¶áž“áž”áŸ’ážšáž—áŸáž‘ážšáž¿áž„áž—áž¶áž‚áž‘áŸáŸ” ážŸáž¼áž˜áž”áž“áŸ’ážáŸ‚áž˜áž“áŸ…áž‘áŸ†áž–áŸážš "áž‚áŸ’ážšáž”áŸ‹áž‚áŸ’ážšáž„áž”áŸ’ážšáž—áŸáž‘ áž“áž·áž„áž”áŸ’ážšáž‘áŸážŸ"
                  </p>
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
                  áž…áŸ†áž“áž½áž“áž—áž¶áž‚ážŸážšáž»áž”
                </label>
                <input
                  type="number"
                  name="total_episodes"
                  value={form.total_episodes || ''}
                  onChange={handleChange}
                  min="0"
                  placeholder="áž§áž‘áž¶áž ážšážŽáŸáŸ– 24"
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
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-sm font-medium text-slate-300 mb-1">Access type</label>
              <select
                name="access_type"
                value={form.access_type}
                onChange={handleChange}
                className={`${inputClass} w-full`}
              >
                <option value="free">Free</option>
                <option value="member">Membership</option>
                <option value="purchase">Pay Per View</option>
              </select>
            </div>
            {form.access_type === "purchase" && (
              <div className="flex-1 min-w-[140px]">
                <label className="block text-sm font-medium text-slate-300 mb-1">Purchase price</label>
                <input
                  type="number"
                  name="purchase_price"
                  min="0"
                  step="0.01"
                  value={form.purchase_price}
                  onChange={handleChange}
                  className={`${inputClass} w-full`}
                />
              </div>
            )}
          </div>

          {/* Khmer Dub / Sub */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              áž—áž¶ážŸáž¶ áž“áž·áž„ážŸáŸ†áž¡áŸáž„
            </label>
            <div className="grid grid-cols-2 gap-3">
              <ToggleSwitch
                checked={form.has_khmer_dub}
                onChange={(v) => setForm(prev => ({ ...prev, has_khmer_dub: v }))}
                label="ážŸáŸ†áž¡áŸáž„ážáŸ’áž˜áŸ‚ážš"
                description="áž˜áž¶áž“ážŸáŸ†áž¡áŸáž„áž“áž·áž™áž¶áž™ážáŸ’áž˜áŸ‚ážš"
              />
              <ToggleSwitch
                checked={form.has_khmer_sub}
                onChange={(v) => setForm(prev => ({ ...prev, has_khmer_sub: v }))}
                label="áž¢áž€áŸ’ážŸážšážšážáŸ‹ážáŸ’áž˜áŸ‚ážš"
                description="áž˜áž¶áž“áž¢áž€áŸ’ážŸážšážšážáŸ‹áž–áž¸áž€áŸ’ážšáŸ„áž˜ážáŸ’áž˜áŸ‚ážš"
              />
            </div>
          </div>

          {/* Bunny Video ID */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Bunny Video ID <span className="text-yellow-400">(áž”áž‰áŸ’áž…áž¼áž›ážŠáŸ„áž™áž•áŸ’áž‘áž¶áž›áŸ‹)</span>
            </label>
            <input
              type="text"
              name="bunny_video_id"
              value={form.bunny_video_id || ""}
              onChange={handleChange}
              placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
              className={`${inputClass} w-full font-mono text-sm`}
            />
            <p className="text-xs text-slate-500 mt-1.5">
              áž”áž¾áž˜áž¶áž“ Video ID áž–áž¸ Bunny ážšáž½áž…áž áž¾áž™ áž¢áž¶áž…áž”áž‰áŸ’áž…áž¼áž›ážŠáŸ„áž™áž•áŸ’áž‘áž¶áž›áŸ‹
            </p>
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
                      <Video size={13} className="text-amber-400 inline mr-1" />
                      {videoFile.name} Â· {formatBytes(videoFile.size)}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={13} /> áž›áž»áž”
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
                      <span className="text-amber-400 font-medium">áž…áž»áž…</span> áž¬áž‘áž¶áž‰áž¯áž€ážŸáž¶ážšážœáž¸ážŠáŸáž¢áž¼áž˜áž€ážŠáž¶áž€áŸ‹
                    </span>
                    <span className="text-xs text-slate-600">MP4, MOV, MKV â€” áž¢ážáž·áž”ážšáž˜áž¶ 50GB</span>
                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoInputChange} />
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Display options */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">áž‡áž˜áŸ’ážšáž¾ážŸáž”áž„áŸ’áž áž¶áž‰</label>
            <div className="grid sm:grid-cols-3 gap-2">
              <ToggleSwitch
                checked={form.is_featured}
                onChange={(v) => setForm((prev) => ({ ...prev, is_featured: v }))}
                label="Banner áž‘áŸ†áž–áŸážšážŠáž¾áž˜"
              />
              <ToggleSwitch
                checked={form.is_new_release}
                onChange={(v) => setForm((prev) => ({ ...prev, is_new_release: v }))}
                label="áž…áŸáž‰ážáŸ’áž˜áž¸"
              />
              <ToggleSwitch
                checked={form.is_active}
                onChange={(v) => setForm((prev) => ({ ...prev, is_active: v }))}
                label="ážŠáŸ†ážŽáž¾ážšáž€áž¶ážš"
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Categories</label>
            {taxonomyLoading ? (
              <p className="text-xs text-slate-500">Loadingâ€¦</p>
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
              <p className="text-xs text-slate-500">Loadingâ€¦</p>
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
                <span>
                  {submitStage === "video" ? "Uploading videoâ€¦" : "Savingâ€¦"}
                </span>
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