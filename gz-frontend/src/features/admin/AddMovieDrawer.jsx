// src/pages/admin/AddMoviePage.jsx
//
// Full-screen replacement for AddMovieDrawer.jsx.
// Same data model, same submit logic (Bunny TUS upload, FormData build),
// reorganized into a left-hand step navigator so users fill the form in a
// clear, logical order instead of scrolling one long modal.
//
// Usage (drop-in): render this instead of <AddMovieDrawer /> — e.g. as a
// route ("/admin/movies/new", "/admin/movies/:id/edit") or as a full-screen
// overlay from MovieListPage. It keeps the same props (`movie`, `onClose`,
// `onSave`) so wiring it up is a one-line swap.

import { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowLeft,
  UploadCloud,
  Loader,
  AlertCircle,
  CheckCircle2,
  Circle,
  Trash2,
  Film,
  Image as ImageIcon,
  Tags,
  Settings2,
  Video,
} from "lucide-react";
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

/* ============================================================
   Step definitions — order = the order users fill the form in
   ============================================================ */

const STEPS = [
  { id: "basic", label: "ព័ត៌មានមូលដ្ឋាន", sublabel: "Title & description", icon: Film },
  { id: "media", label: "រូបភាព & Trailer", sublabel: "Poster, backdrop, trailer", icon: ImageIcon },
  { id: "classify", label: "ចំណាត់ថ្នាក់", sublabel: "Genres, categories, countries", icon: Tags },
  { id: "access", label: "សិទ្ធិចូលមើល", sublabel: "Access type & display options", icon: Settings2 },
  { id: "video", label: "វីដេអូ", sublabel: "Upload or link the video", icon: Video },
];

/* ============================================================
   Small shared building blocks
   ============================================================ */

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
    <div className="flex-1 min-w-[200px]">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`group relative w-full ${aspect} rounded-xl border-2 border-dashed overflow-hidden transition-colors ${
          dragActive ? "border-amber-400 bg-amber-500/5" : "border-slate-700 bg-slate-800/50"
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt={`${label} preview`} className="h-full w-full object-cover" />
            <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition-colors cursor-pointer">
              <UploadCloud size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              <input type="file" accept="image/*" className="hidden" onChange={handleInputChange} />
            </label>
          </>
        ) : (
          <label className="flex flex-col items-center justify-center gap-1.5 h-full px-2 text-center cursor-pointer">
            <UploadCloud size={22} className="text-slate-500" />
            <span className="text-xs text-slate-500">ចុចដើម្បីបញ្ចូលរូបភាព</span>
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

function PillMultiSelect({ items, selectedIds, onToggle, emptyLabel, loading, renderExtra }) {
  if (loading) return <p className="text-xs text-slate-500">កំពុងផ្ទុក…</p>;
  if (!items.length) return <p className="text-xs text-slate-500">{emptyLabel}</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => {
        const active = selectedIds.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              active
                ? "bg-amber-500 text-slate-950 border-amber-500 font-medium"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600"
            }`}
          >
            {renderExtra ? renderExtra(item) : null}
            {item.name}
          </button>
        );
      })}
    </div>
  );
}

function FormSection({ id, title, description, children }) {
  return (
    <section id={`section-${id}`} className="scroll-mt-24 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/* ============================================================
   Main page
   ============================================================ */

export default function AddMoviePage({ movie, onClose, onSave }) {
  const isEdit = Boolean(movie);
  const [activeStep, setActiveStep] = useState("basic");

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

  /* ---------- load existing movie into form (edit mode) ---------- */
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

  /* ---------- load taxonomy lists ---------- */
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

  /* ---------- confirm-before-leaving on Escape ---------- */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !submitting) handleLeave();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitting]);

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

  const handleLeave = () => {
    onClose();
  };

  /* ---------- generic field handlers ---------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: type === "checkbox" ? checked : value };
      if (name === "access_type" && value !== "purchase") {
        updated.purchase_price = "";
      }
      return updated;
    });
  };
  const handleTitleChange = (e) => setForm((prev) => ({ ...prev, title: e.target.value }));

  const toggleCategory = (id) =>
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleGenre = (id) =>
    setGenreIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleCountry = (id) =>
    setCountryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleSeriesType = (id) =>
    setSeriesTypeIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  /* ---------- images ---------- */
  const handleImageSelect = (file, type) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("សូមជ្រើសរើសឯកសាររូបភាព (PNG ឬ JPG)។");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setFormError("រូបភាពធំពេក — សូមរក្សាទុកក្រោម 5MB។");
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

  /* ---------- video ---------- */
  const handleVideoInputChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setFormError("សូមជ្រើសរើសឯកសារវីដេអូ។");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setFormError("វីដេអូធំពេក — សូមរក្សាទុកក្រោម 50GB។");
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
            onError: (err) => reject(err),
            onProgress: (uploaded, total) => setUploadProgress(Math.round((uploaded / total) * 100)),
            onSuccess: () => resolve(creds.video_id),
          });

          tusUploadRef.current = upload;

          const previousUploads = await upload.findPreviousUploads();
          if (previousUploads.length) upload.resumeFromPreviousUpload(previousUploads[0]);

          upload.start();
        } catch (err) {
          const detail = err?.response?.status
            ? `(${err.response.status}) ${JSON.stringify(err.response.data)}`
            : err?.message || "unknown error";
          reject(new Error(`មិនអាចចាប់ផ្តើមផ្ទុកវីដេអូបានទេ — ${detail}`));
        }
      })();
    });

  /* ---------- per-step validation, for the sidebar status dots ---------- */
  const stepIssues = useMemo(() => {
    const issues = { basic: [], media: [], classify: [], access: [], video: [] };
    if (!form.title.trim()) issues.basic.push("ចំណងជើងត្រូវការ");
    if (!form.description.trim()) issues.basic.push("ការពិពណ៌នាត្រូវការ");
    if (!form.country.trim() || !form.language.trim()) issues.basic.push("ប្រទេស/ភាសាត្រូវការ");
    if (!form.duration) issues.basic.push("រយៈពេលត្រូវការ");
    if (!form.release_date) issues.basic.push("កាលបរិច្ឆេទចេញផ្សាយត្រូវការ");
    if (!isEdit && !imageFile) issues.media.push("Poster ត្រូវការ");
    if (form.access_type === "purchase" && (!form.purchase_price || Number(form.purchase_price) <= 0)) {
      issues.access.push("តម្លៃទិញត្រូវការ");
    }
    return issues;
  }, [form, imageFile, isEdit]);

  const scrollToStep = (id) => {
    setActiveStep(id);
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ---------- submit (identical logic to the original drawer) ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEdit && !imageFile) {
      setFormError("Poster គម្របត្រូវការ។");
      scrollToStep("media");
      return;
    }
    if (!form.title.trim()) {
      setFormError("ចំណងជើងត្រូវការ។");
      scrollToStep("basic");
      return;
    }
    if (!form.description.trim()) {
      setFormError("ការពិពណ៌នាត្រូវការ។");
      scrollToStep("basic");
      return;
    }
    if (!form.country.trim() || !form.language.trim()) {
      setFormError("ប្រទេស និងភាសាត្រូវការ។");
      scrollToStep("basic");
      return;
    }
    if (!form.duration) {
      setFormError("រយៈពេលត្រូវការ។");
      scrollToStep("basic");
      return;
    }
    if (!form.release_date) {
      setFormError("កាលបរិច្ឆេទចេញផ្សាយត្រូវការ។");
      scrollToStep("basic");
      return;
    }
    if (form.access_type === "purchase") {
      if (!form.purchase_price || Number(form.purchase_price) <= 0) {
        setFormError("តម្លៃទិញត្រូវការ ហើយត្រូវធំជាង 0 សម្រាប់ Pay Per View។");
        scrollToStep("access");
        return;
      }
    }

    setSubmitting(true);
    setFormError(null);
    setUploadProgress(0);

    let finalBunnyVideoId = form.bunny_video_id?.trim() || bunnyVideoId;

    if (videoFile && !finalBunnyVideoId) {
      setSubmitStage("video");
      try {
        finalBunnyVideoId = await uploadVideoDirectToBunny(videoFile, form.title || "Untitled");
        setBunnyVideoId(finalBunnyVideoId);
        setForm((prev) => ({ ...prev, bunny_video_id: finalBunnyVideoId }));
      } catch (err) {
        setFormError(err?.message || "ការផ្ទុកវីដេអូទៅ Bunny បរាជ័យ។ សូមព្យាយាមម្តងទៀត។");
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
    if (form.trailer_url) fd.append("trailer_url", form.trailer_url);
    fd.append("country", form.country);
    fd.append("language", form.language);
    if (form.release_date) fd.append("release_date", form.release_date);
    fd.append("duration", form.duration);
    if (form.rating) fd.append("rating", form.rating);

    fd.append("access_type", form.access_type || "free");
    if (form.access_type === "purchase") fd.append("purchase_price", form.purchase_price);

    fd.append("is_featured", String(form.is_featured || false));
    fd.append("is_new_release", String(form.is_new_release || false));
    fd.append("is_active", String(form.is_active ?? true));

    categoryIds.forEach((id) => fd.append("categories", id));
    genreIds.forEach((id) => fd.append("genres", id));
    countryIds.forEach((id) => fd.append("countries", id));

    fd.append("content_type", form.content_type || "movie");
    fd.append("has_khmer_dub", String(form.has_khmer_dub || false));
    fd.append("has_khmer_sub", String(form.has_khmer_sub || false));

    if (form.content_type === "series") {
      seriesTypeIds.forEach((id) => fd.append("series_types", id));
      if (form.total_episodes) fd.append("total_episodes", form.total_episodes);
    }

    if (imageFile) fd.append("poster", imageFile);
    if (backdropFile) fd.append("backdrop", backdropFile);

    if (finalBunnyVideoId) {
      fd.append("bunny_video_id", finalBunnyVideoId);
    } else if (videoCleared) {
      fd.append("bunny_video_id", "");
    }

    try {
      if (isEdit) {
        await adminApi.updateMovie(movie.id, fd);
      } else {
        await adminApi.createMovie(fd);
      }
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
      setFormError(detail || "រក្សាទុកមិនបានសម្រេច។ សូមពិនិត្យទិន្នន័យ ហើយព្យាយាមម្តងទៀត។");
    } finally {
      setSubmitting(false);
      setSubmitStage(null);
      tusUploadRef.current = null;
    }
  };

  /* ============================================================
     Render
     ============================================================ */
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      {/* Top bar */}
      <header className="shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handleLeave}
            disabled={submitting}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors shrink-0"
            title="ត្រឡប់ក្រោយ"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-white truncate">
              {isEdit ? `កែប្រែ — ${movie.title}` : "បន្ថែមរឿងថ្មី"}
            </h1>
            <p className="text-xs text-slate-500 truncate">
              {isEdit ? "កែប្រែព័ត៌មានលម្អិតរបស់ចំណងជើងនេះ" : "បំពេញព័ត៌មានតាមជំហានខាងឆ្វេង"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleLeave}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            បោះបង់
          </button>
          <button
            type="submit"
            form="movie-form"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-sm rounded-lg bg-amber-500 text-slate-950 font-medium hover:bg-amber-400 disabled:opacity-60 transition-colors"
          >
            {submitting && <Loader size={14} className="animate-spin" />}
            {isEdit ? "រក្សាទុកការកែប្រែ" : "បង្កើតរឿង"}
          </button>
        </div>
      </header>

      {/* Body: sidebar steps + scrollable form */}
      <div className="flex-1 min-h-0 flex">
        {/* Sidebar */}
        <nav className="hidden md:flex w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900/40 p-4 gap-1 overflow-y-auto">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const issues = stepIssues[step.id] || [];
            const isActive = activeStep === step.id;
            const isSeriesOnly = step.id === "video" ? false : false;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => scrollToStep(step.id)}
                className={`flex items-start gap-3 text-left px-3 py-2.5 rounded-xl border transition-colors ${
                  isActive
                    ? "bg-amber-500/10 border-amber-500/40"
                    : "border-transparent hover:bg-slate-800/60"
                }`}
              >
                <span
                  className={`mt-0.5 flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${
                    isActive ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  <Icon size={14} />
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-medium ${isActive ? "text-amber-300" : "text-slate-200"}`}>
                    {step.label}
                  </span>
                  <span className="block text-[11px] text-slate-500">{step.sublabel}</span>
                  {issues.length > 0 && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-red-400">
                      <AlertCircle size={11} /> {issues.length} ចំណុចត្រូវបំពេញ
                    </span>
                  )}
                  {issues.length === 0 && step.id !== "video" && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-emerald-500/80">
                      <CheckCircle2 size={11} /> ត្រៀមរួចរាល់
                    </span>
                  )}
                </span>
              </button>
            );
          })}

          <div className="mt-auto pt-4 border-t border-slate-800 text-[11px] text-slate-600 px-1">
            {form.content_type === "series" ? "ប្រភេទ៖ រឿងភាគ (Series)" : "ប្រភេទ៖ រឿងដុំ (Movie)"}
          </div>
        </nav>

        {/* Mobile step tabs */}
        <div className="md:hidden shrink-0 border-b border-slate-800 bg-slate-900/40 overflow-x-auto">
          <div className="flex gap-1 p-2 min-w-max">
            {STEPS.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => scrollToStep(step.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeStep === step.id
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable form area */}
        <main className="flex-1 overflow-y-auto">
          <form id="movie-form" onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-14">
            {/* ================= STEP 1: BASIC INFO ================= */}
            <FormSection
              id="basic"
              title="ព័ត៌មានមូលដ្ឋាន"
              description="ចំណងជើង ការពិពណ៌នា និងព័ត៌មានទូទៅរបស់ចំណងជើងនេះ"
            >
              {/* Content type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">ប្រភេទមាតិកា *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, content_type: "movie" }))}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                      form.content_type === "movie"
                        ? "bg-amber-500/10 border-amber-500 text-amber-400"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <Film size={15} className="inline mr-2 -mt-0.5" />
                    រឿងដុំ (Movie)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, content_type: "series" }))}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                      form.content_type === "series"
                        ? "bg-amber-500/10 border-amber-500 text-amber-400"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <Video size={15} className="inline mr-2 -mt-0.5" />
                    រឿងភាគ (Series)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">ចំណងជើង *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleTitleChange}
                  required
                  className={`${inputClass} w-full`}
                  placeholder="ឧទាហរណ៍៖ រឿងភាគ Empresses in the Palace"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">ការពិពណ៌នា *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  className={`${inputClass} w-full resize-none`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">ការពិពណ៌នាខ្លី</label>
                <input
                  type="text"
                  name="short_description"
                  value={form.short_description}
                  onChange={handleChange}
                  placeholder="ប្រយោគខ្លីមួយបង្ហាញនៅលើកាតបញ្ជី"
                  className={`${inputClass} w-full`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">ប្រទេស (Text) *</label>
                  <input
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    required
                    placeholder="ឧទាហរណ៍៖ Cambodia"
                    className={`${inputClass} w-full`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">ភាសា *</label>
                  <input
                    type="text"
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                    required
                    placeholder="ឧទាហរណ៍៖ Khmer"
                    className={`${inputClass} w-full`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">កាលបរិច្ឆេទចេញផ្សាយ *</label>
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
                  <label className="block text-sm font-medium text-slate-300 mb-1">រយៈពេល (នាទី) *</label>
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
                  <label className="block text-sm font-medium text-slate-300 mb-1">ការវាយតម្លៃ</label>
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

              {form.content_type === "series" && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">ចំនួនភាគសរុប</label>
                  <input
                    type="number"
                    name="total_episodes"
                    value={form.total_episodes || ""}
                    onChange={handleChange}
                    min="0"
                    placeholder="ឧទាហរណ៍៖ 24"
                    className={`${inputClass} w-full max-w-xs`}
                  />
                </div>
              )}
            </FormSection>

            {/* ================= STEP 2: MEDIA ================= */}
            <FormSection
              id="media"
              title="រូបភាព & Trailer"
              description="Poster និង Backdrop លេចឡើងលើទំព័រកាតាឡុក, Trailer ជា​ស្រេចចិត្ត"
            >
              <div className="flex gap-4 flex-wrap sm:flex-nowrap">
                <ImageDropBox
                  preview={imagePreview}
                  aspect="aspect-[2/3]"
                  label={`Cover poster ${!isEdit ? "*" : ""}`}
                  hint="សមាមាត្រ 2:3, ឧ. 800×1200។ អតិបរមា 5MB។"
                  onFileSelect={(file) => handleImageSelect(file, "poster")}
                />
                <ImageDropBox
                  preview={backdropPreview}
                  aspect="aspect-video"
                  label="Backdrop / Banner"
                  hint="សមាមាត្រ 16:9, ឧ. 1600×900។ អតិបរមា 5MB។"
                  onFileSelect={(file) => handleImageSelect(file, "backdrop")}
                />
              </div>

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
            </FormSection>

            {/* ================= STEP 3: CLASSIFICATION ================= */}
            <FormSection
              id="classify"
              title="ចំណាត់ថ្នាក់"
              description="ជួយអ្នកប្រើស្វែងរក និងច្រោះមាតិកាបានត្រឹមត្រូវ"
            >
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Categories</label>
                <PillMultiSelect
                  items={categories}
                  selectedIds={categoryIds}
                  onToggle={toggleCategory}
                  loading={taxonomyLoading}
                  emptyLabel="មិនទាន់មាន category ទេ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Genres</label>
                <PillMultiSelect
                  items={genres}
                  selectedIds={genreIds}
                  onToggle={toggleGenre}
                  loading={taxonomyLoading}
                  emptyLabel="មិនទាន់មាន genre ទេ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  ប្រទេស (អាចជ្រើសរើសច្រើន)
                </label>
                <PillMultiSelect
                  items={countries}
                  selectedIds={countryIds}
                  onToggle={toggleCountry}
                  loading={taxonomyLoading}
                  emptyLabel="មិនទាន់មានប្រទេសទេ"
                  renderExtra={(c) => c.flag && <span className="mr-1">{c.flag}</span>}
                />
              </div>

              {form.content_type === "series" && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">ប្រភេទរឿងភាគ</label>
                  <PillMultiSelect
                    items={seriesTypes}
                    selectedIds={seriesTypeIds}
                    onToggle={toggleSeriesType}
                    loading={taxonomyLoading}
                    emptyLabel="មិនទាន់មានប្រភេទរឿងភាគទេ"
                    renderExtra={(st) => st.flag && <span className="mr-1">{st.flag}</span>}
                  />
                </div>
              )}
            </FormSection>

            {/* ================= STEP 4: ACCESS & DISPLAY ================= */}
            <FormSection
              id="access"
              title="សិទ្ធិចូលមើល & ជម្រើសបង្ហាញ"
              description="កំណត់ថាអ្នកណាអាចមើលបាន និងកន្លែងបង្ហាញលើគេហទំព័រ"
            >
              <div className="space-y-3">
                <div className="flex gap-4 flex-wrap">
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-sm font-medium text-slate-300 mb-1">ប្រភេទចូលប្រើ *</label>
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
                    <div className="flex-1 min-w-[160px]">
                      <label className="block text-sm font-medium text-slate-300 mb-1">តម្លៃទិញ *</label>
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

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">ភាសា និងសំឡេង</label>
                <div className="grid sm:grid-cols-2 gap-3">
                  <ToggleSwitch
                    checked={form.has_khmer_dub}
                    onChange={(v) => setForm((prev) => ({ ...prev, has_khmer_dub: v }))}
                    label="សំឡេងខ្មែរ"
                    description="មានសំឡេងនិយាយខ្មែរ"
                  />
                  <ToggleSwitch
                    checked={form.has_khmer_sub}
                    onChange={(v) => setForm((prev) => ({ ...prev, has_khmer_sub: v }))}
                    label="អក្សររត់ខ្មែរ"
                    description="មានអក្សររត់ពីក្រោមខ្មែរ"
                  />
                </div>
              </div>

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
            </FormSection>

            {/* ================= STEP 5: VIDEO ================= */}
            <FormSection
              id="video"
              title="វីដេអូ"
              description="ភ្ជាប់ Bunny Video ID ដោយផ្ទាល់ ឬបញ្ចូលឯកសារវីដេអូ"
            >
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

              {!form.bunny_video_id && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">ឯកសារវីដេអូ</label>
                  {videoFile && videoPreview ? (
                    <div className="rounded-xl overflow-hidden border border-slate-700 bg-black">
                      <video src={videoPreview} controls className="w-full max-h-72 bg-black" />
                      <div className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-800/80">
                        <span className="text-xs text-slate-300 truncate">
                          {videoFile.name} · {formatBytes(videoFile.size)}
                        </span>
                        <button
                          type="button"
                          onClick={handleRemoveVideo}
                          className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={12} /> លុប
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleVideoDrop}
                      className="relative rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 hover:border-slate-600 transition-colors"
                    >
                      <label className="flex flex-col items-center justify-center gap-1.5 py-10 px-4 text-center cursor-pointer">
                        <UploadCloud size={24} className="text-slate-500" />
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
            </FormSection>

            {/* Error + progress + bottom submit (mirrors top bar, useful after long scroll) */}
            {formError && (
              <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span className="break-words">{formError}</span>
              </div>
            )}

            {submitting && (
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>{submitStage === "video" ? "កំពុងផ្ទុកវីដេអូ…" : "កំពុងរក្សាទុក…"}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 pb-10">
              <button
                type="button"
                onClick={handleLeave}
                disabled={submitting}
                className="px-4 py-2 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 text-sm rounded-lg bg-amber-500 text-slate-950 font-medium hover:bg-amber-400 disabled:opacity-60"
              >
                {submitting && <Loader size={14} className="animate-spin" />}
                {isEdit ? "រក្សាទុកការកែប្រែ" : "បង្កើតរឿង"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}