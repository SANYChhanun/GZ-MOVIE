// src/features/admin/AddMovieDrawer.jsx
import { useState, useEffect, useRef } from "react";
import { X, UploadCloud, Loader, AlertCircle, Video, Trash2 } from "lucide-react";
import * as tus from "tus-js-client";
import adminApi from "../../api/adminApi";
import { inputClass } from "../../utils/constants";

// NOTE ON video upload:
// The video file is uploaded DIRECTLY from this browser to Bunny Stream
// using the TUS resumable protocol -- it never passes through our own
// server. Flow:
//   1. adminApi.initVideoUpload({ title }) asks Django to create a video
//      slot on Bunny and hand back short-lived signed TUS credentials
//      (no file bytes sent here).
//   2. tus-js-client uploads the actual file straight to Bunny using
//      those credentials, in resumable chunks -- if the connection
//      drops mid-upload, it resumes from the last chunk instead of
//      restarting from zero. TUS is a two-step protocol (POST to create
//      the upload resource + get a Location, then PATCH chunks to that
//      Location) -- tus-js-client implements this correctly.
//
//      ⚠️ DO NOT replace this with a hand-rolled XHR/fetch PATCH call.
//      That has been tried twice in this project and failed both times:
//        - Skipping the creation POST and PATCHing straight to the TUS
//          endpoint => Bunny returns 400 "Invalid file id" (no upload
//          resource was ever created for that id).
//        - Sending the whole file in a single PATCH also throws away
//          the entire point of using TUS: chunked, resumable upload.
//      If tus-js-client is missing from node_modules, run
//      `npm install tus-js-client` -- don't reimplement the protocol
//      by hand.
//   3. Once that finishes we have a Bunny `video_id` (guid). We send
//      that as `bunny_video_id` in the normal create/update request
//      alongside the rest of the movie's fields -- MovieAdminSerializer
//      just derives the playable embed URL from it, no upload happens
//      server-side at all.
// This matters most for large files (multi-GB): the old approach routed
// the whole file through Django first, which meant huge request bodies,
// long-blocked workers, and a failed upload meaning starting over from
// byte zero.

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
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024 * 1024; // 50GB per movie

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

// Generic drag/drop image box used for both poster and backdrop below.
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
              <UploadCloud
                size={16}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
              />
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

// Styled toggle switch used for the featured/new-release/active flags below.
function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <label
      className={`flex items-center justify-between gap-4 py-3 px-4 rounded-xl border cursor-pointer transition-colors ${
        checked
          ? "bg-amber-500/10 border-amber-500/40"
          : "bg-slate-800/60 border-slate-700 hover:border-slate-600"
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
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-amber-500" : "bg-slate-700"
        }`}
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
  const [slugTouched, setSlugTouched] = useState(false);
  const [categories, setCategories] = useState([]);
  const [genres, setGenres] = useState([]);
  const [categoryIds, setCategoryIds] = useState([]);
  const [genreIds, setGenreIds] = useState([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);

  // Cover image (poster)
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Backdrop image (banner / hero background)
  const [backdropFile, setBackdropFile] = useState(null);
  const [backdropPreview, setBackdropPreview] = useState("");

  // Video file — picked locally, then uploaded direct-to-Bunny via TUS
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [bunnyVideoId, setBunnyVideoId] = useState(null);
  // Tracks whether the admin explicitly removed the movie's existing video
  // (edit mode, no new file picked) — sent to the backend as a clear signal.
  const [videoCleared, setVideoCleared] = useState(false);
  // Remembers the movie's original bunny_video_id on load, so if the admin
  // picks a new file then changes their mind and removes it, we can restore
  // the original assignment instead of leaving the movie with no video.
  const originalBunnyVideoIdRef = useRef(null);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  // "video" while the TUS upload to Bunny is running, "saving" while the
  // metadata request to our own API is running. Drives both the
  // progress label and what "cancel" should abort.
  const [submitStage, setSubmitStage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState(null);
  const abortControllerRef = useRef(null);
  const tusUploadRef = useRef(null);

  // Pre-fill on edit
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
      });
      setSlugTouched(true); // don't overwrite an existing slug automatically
      setCategoryIds((movie.categories || []).map((c) => (typeof c === "object" ? c.id : c)));
      setGenreIds((movie.genres || []).map((g) => (typeof g === "object" ? g.id : g)));
      setImagePreview(movie.poster || "");
      setBackdropPreview(movie.backdrop || "");
      setBunnyVideoId(movie.bunny_video_id || null);
      originalBunnyVideoIdRef.current = movie.bunny_video_id || null;
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

  // Clean up any object URLs we created for previews
  useEffect(() => {
    return () => {
      if (imageFile && imagePreview) URL.revokeObjectURL(imagePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagePreview]);

  useEffect(() => {
    return () => {
      if (backdropFile && backdropPreview) URL.revokeObjectURL(backdropPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backdropPreview]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // Auto-derive slug from title until the admin edits slug by hand
  const handleTitleChange = (e) => {
    const title = e.target.value;
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugTouched ? prev.slug : slugify(title),
    }));
  };

  const handleSlugChange = (e) => {
    setSlugTouched(true);
    setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
  };

  const toggleCategory = (id) => {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleGenre = (id) => {
    setGenreIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // ---- Cover / backdrop image handling ----
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
      setFormError("Video is too large — please keep it under 50GB.");
      return;
    }
    setFormError(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setVideoCleared(false);
    // A newly picked file invalidates any previously uploaded id for
    // this session (relevant on edit, where bunnyVideoId may have been
    // pre-filled from the existing movie).
    setBunnyVideoId(null);
  };

  const handleVideoDrop = (e) => {
    e.preventDefault();
    handleVideoInputChange({ target: { files: e.dataTransfer.files, value: "" } });
  };

  // "Remove" button next to the video preview.
  //  - If a newly picked local file is showing: undo the pick and go back to
  //    whatever video the movie already had (if editing), instead of
  //    leaving it with no video at all.
  //  - If the movie's already-uploaded video is showing (no new file
  //    picked): mark it for removal so saving detaches the video entirely.
  const handleRemoveVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    if (videoFile) {
      // Undo the pending pick — restore the original video, if any.
      setVideoFile(null);
      setVideoPreview("");
      setBunnyVideoId(originalBunnyVideoIdRef.current);
      setVideoCleared(false);
    } else {
      // Detach the existing video from this movie.
      setVideoFile(null);
      setVideoPreview("");
      setBunnyVideoId(null);
      setVideoCleared(true);
    }
  };

  // Clean up the video preview blob URL on unmount.
  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoPreview]);

  // Uploads `file` straight to Bunny Stream via TUS (resumable, chunked),
  // using tus-js-client -- which correctly implements the two-step TUS
  // protocol (POST to create the upload resource, THEN PATCH chunks to
  // the Location it returns) -- rather than a hand-rolled single PATCH.
  //
  // ⚠️ DO NOT replace this with a hand-rolled XHR/fetch PATCH call.
  // That has been tried twice now and failed both times:
  //   - Skipping the creation POST and PATCHing straight to the TUS
  //     endpoint => Bunny returns 400 "Invalid file id" (no upload
  //     resource was ever created for that id).
  //   - Sending the whole file in a single PATCH also throws away the
  //     entire point of using TUS: chunked, resumable upload.
  // tus-js-client handles all of this correctly. If it's missing from
  // node_modules, run `npm install tus-js-client` -- don't reimplement
  // the protocol by hand.
  const uploadVideoDirectToBunny = (file, title) =>
    new Promise((resolve, reject) => {
      (async () => {
        try {
          console.log("[bunny-upload] requesting TUS credentials…", {
            fileName: file.name,
            fileSizeBytes: file.size,
            fileSizeGB: (file.size / 1024 / 1024 / 1024).toFixed(2),
          });

          const res = await adminApi.initVideoUpload({ title });
          const creds = res.data;
          console.log("[bunny-upload] got credentials", creds);
          console.log("[bunny-upload] endpoint:", creds.endpoint);

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
            chunkSize: 50 * 1024 * 1024, // 50MB per chunk
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
          console.log("[bunny-upload] tus.Upload instance created, checking for resumable uploads…");

          // Resume a previous interrupted upload of this same file if one
          // exists, instead of starting over from byte zero.
          const previousUploads = await upload.findPreviousUploads();
          console.log("[bunny-upload] previousUploads:", previousUploads);
          if (previousUploads.length) {
            upload.resumeFromPreviousUpload(previousUploads[0]);
          }

          console.log("[bunny-upload] calling upload.start()…");
          upload.start();
        } catch (err) {
          console.error("[bunny-upload] setup failed:", err);
          console.error("status:", err?.response?.status, "data:", err?.response?.data);
          const detail = err?.response?.status
            ? `(${err.response.status}) ${
                typeof err.response.data === "string"
                  ? err.response.data
                  : JSON.stringify(err.response.data)
              }`
            : err?.message || "unknown error";
          reject(new Error(`Could not start the video upload — ${detail}`));
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
    console.log("[movie-save] handleSubmit fired", { isEdit, form, imageFile, backdropFile, videoFile });

    if (!isEdit && !imageFile) {
      console.log("[movie-save] blocked: cover image required");
      setFormError("A cover image is required.");
      return;
    }
    if (!form.slug.trim()) {
      console.log("[movie-save] blocked: slug required");
      setFormError("Slug is required (derived from title, or set it manually).");
      return;
    }
    if (!form.description.trim()) {
      console.log("[movie-save] blocked: description required");
      setFormError("Description is required.");
      return;
    }
    if (!form.country.trim() || !form.language.trim()) {
      console.log("[movie-save] blocked: country/language required");
      setFormError("Country and language are required.");
      return;
    }
    if (!form.duration) {
      console.log("[movie-save] blocked: duration required");
      setFormError("Duration is required.");
      return;
    }
    if (!form.release_date) {
      console.log("[movie-save] blocked: release date required");
      setFormError("Release date is required.");
      return;
    }

    console.log("[movie-save] validation passed, submitting…");
    setSubmitting(true);
    setFormError(null);
    setUploadProgress(0);

    // Step 1 (only if a new video file was picked): upload it straight
    // to Bunny via TUS, direct from this browser. This can take a while
    // for large files, but never touches our own server or its request
    // size / timeout limits.
    let finalBunnyVideoId = bunnyVideoId;
    if (videoFile) {
      setSubmitStage("video");
      try {
        finalBunnyVideoId = await uploadVideoDirectToBunny(videoFile, form.title || "Untitled");
        setBunnyVideoId(finalBunnyVideoId);
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

    // Step 2: save the rest of the movie's fields, including the Bunny
    // video id from step 1 (or the pre-existing one on edit, or none at
    // all if this movie has no video yet).
    setSubmitStage("saving");
    setUploadProgress(0);

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("slug", form.slug);
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
    if (imageFile) fd.append("poster", imageFile);
    if (backdropFile) fd.append("backdrop", backdropFile);
    if (finalBunnyVideoId) {
      // Either the direct-to-Bunny upload in Step 1 just succeeded, or
      // this is an edit where the movie already had a video and nothing
      // changed about it.
      fd.append("bunny_video_id", finalBunnyVideoId);
    } else if (videoCleared) {
      // Explicit empty string, distinct from simply not sending the field —
      // tells the backend "detach the video" rather than "leave it alone".
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
      console.log("[movie-save] sending", isEdit ? "PATCH" : "POST", "to /admin/movies/", Object.fromEntries(fd.entries()));
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
      console.error("[movie-save] response status/data:", err?.response?.status, err?.response?.data);
      if (err.code === "ERR_CANCELED" || err.name === "CanceledError") {
        setFormError("Save canceled.");
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
          {/* Cover poster + Backdrop / banner image */}
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
              hint="16:9 ratio, e.g. 1600×900. Used for the home banner. Up to 5MB."
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

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Slug *</label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleSlugChange}
              required
              placeholder="auto-generated-from-title"
              className={`${inputClass} w-full`}
            />
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

          {/* Access type / purchase price / active */}
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

          {/* Display options — featured banner / new release / active */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">ជម្រើសបង្ហាញ</label>
            <div className="grid sm:grid-cols-3 gap-2">
              <ToggleSwitch
                checked={form.is_featured}
                onChange={(v) => setForm((prev) => ({ ...prev, is_featured: v }))}
                label="Banner ទំព័រដើម"
                description="បង្ហាញក្នុង Banner"
              />
              <ToggleSwitch
                checked={form.is_new_release}
                onChange={(v) => setForm((prev) => ({ ...prev, is_new_release: v }))}
                label="ចេញថ្មី"
                description="សម្គាល់ថាចេញថ្មី"
              />
              <ToggleSwitch
                checked={form.is_active}
                onChange={(v) => setForm((prev) => ({ ...prev, is_active: v }))}
                label="ដំណើរការ"
                description="បើកបង្ហាញដល់អ្នកប្រើប្រាស់"
              />
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
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Movie video file</label>

            {videoFile && videoPreview ? (
              // A new file was just picked locally — preview it directly.
              <div className="rounded-xl overflow-hidden border border-slate-700 bg-black">
                <video src={videoPreview} controls className="w-full max-h-72 bg-black" />
                <div className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-800/80 flex-wrap">
                  <span className="text-xs text-slate-300 truncate flex items-center gap-1.5 min-w-0">
                    <Video size={13} className="text-amber-400 shrink-0" />
                    <span className="truncate">{videoFile.name}</span>
                    <span className="text-slate-500 shrink-0">· {formatBytes(videoFile.size)}</span>
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <label className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer">
                      ប្តូរ
                      <input type="file" accept="video/*" className="hidden" onChange={handleVideoInputChange} />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={13} /> លុប
                    </button>
                  </div>
                </div>
              </div>
            ) : isEdit && movie?.video_file && !videoCleared ? (
              // Editing a movie that already has a video, and nothing new
              // has been picked or cleared — show the existing video.
              <div className="rounded-xl overflow-hidden border border-slate-700 bg-black">
                <iframe
                  src={movie.video_file}
                  className="w-full aspect-video"
                  allow="autoplay; fullscreen"
                  title="Current video"
                />
                <div className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-800/80 flex-wrap">
                  <span className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Video size={13} className="text-amber-400 shrink-0" />
                    វីដេអូបច្ចុប្បន្ន
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <label className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer">
                      ជំនួសដោយឯកសារថ្មី
                      <input type="file" accept="video/*" className="hidden" onChange={handleVideoInputChange} />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={13} /> លុប
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Nothing selected yet — drag & drop zone.
              <div
                onDragEnter={(e) => e.preventDefault()}
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
                  {videoCleared && (
                    <span className="text-xs text-amber-500 mt-1">វីដេអូចាស់នឹងត្រូវលុបចេញពេលអ្នករក្សាទុក</span>
                  )}
                  <input type="file" accept="video/*" className="hidden" onChange={handleVideoInputChange} />
                </label>
              </div>
            )}

            <p className="text-xs text-slate-600 mt-1.5">
              {isEdit
                ? "ទុកទទេ ដើម្បីរក្សាទុកវីដេអូបច្ចុប្បន្ន។ Upload ដោយផ្ទាល់ទៅ Bunny Stream ពេលអ្នករក្សាទុក — អតិបរមា 50GB, resumable បើ connection ដាច់។"
                : "ស្រេចចិត្ត — Upload ដោយផ្ទាល់ទៅ Bunny Stream ពេលអ្នករក្សាទុក។ អតិបរមា 50GB, resumable បើ connection ដាច់។"}
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
                <span>
                  {submitStage === "video"
                    ? "Uploading video to Bunny Stream…"
                    : videoFile
                    ? "Video uploaded — saving movie details…"
                    : "Saving…"}
                </span>
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

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 sticky bottom-0 bg-slate-900 pb-1 -mx-6 px-6">
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