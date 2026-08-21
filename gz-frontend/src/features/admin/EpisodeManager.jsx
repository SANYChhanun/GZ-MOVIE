// src/features/admin/EpisodeManager.jsx
import { useState, useEffect, useRef } from "react";
import * as tus from "tus-js-client";
import { X, Plus, Pencil, Trash2, Loader, AlertCircle, UploadCloud, PlayCircle } from "lucide-react";
import adminApi from "../../api/adminApi";
import { inputClass } from "../../utils/constants";

const emptyEpisodeForm = {
  title: "",
  episode_number: "",
  description: "",
  duration: "",
  is_active: true,
  bunny_video_id: "",
};

const MAX_VIDEO_BYTES = 50 * 1024 * 1024 * 1024;

export default function EpisodeManager({ movie, onClose }) {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // inline add/edit form state
  const [showForm, setShowForm] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState(null);
  const [form, setForm] = useState(emptyEpisodeForm);

  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [bunnyVideoId, setBunnyVideoId] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState(null);
  const tusUploadRef = useRef(null);

  const fetchEpisodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getEpisodesAdmin(movie.id);
      const list = res.data?.results || res.data || [];
      setEpisodes(list.sort((a, b) => a.episode_number - b.episode_number));
    } catch (err) {
      console.error(err);
      setError("Failed to load episodes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie.id]);

  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [videoPreview]);

  const resetForm = () => {
    setForm(emptyEpisodeForm);
    setVideoFile(null);
    setVideoPreview("");
    setBunnyVideoId(null);
    setFormError(null);
    setEditingEpisode(null);
  };

  const handleAddClick = () => {
    resetForm();
    // ✅ auto-suggest next episode number
    const nextNumber = episodes.length > 0
      ? Math.max(...episodes.map((e) => e.episode_number)) + 1
      : 1;
    setForm((prev) => ({ ...prev, episode_number: nextNumber }));
    setShowForm(true);
  };

  const handleEditClick = (ep) => {
    setEditingEpisode(ep);
    setForm({
      title: ep.title || "",
      episode_number: ep.episode_number || "",
      description: ep.description || "",
      duration: ep.duration || "",
      is_active: ep.is_active ?? true,
      bunny_video_id: ep.bunny_video_id || "",
    });
    setBunnyVideoId(ep.bunny_video_id || null);
    setVideoFile(null);
    setVideoPreview("");
    setFormError(null);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleVideoInputChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setFormError("សូមជ្រើសរើសឯកសារវីដេអូ");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setFormError("វីដេអូធំពេក — អតិបរមា 50GB");
      return;
    }
    setFormError(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setBunnyVideoId(null);
  };

  const handleRemoveVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview("");
    setBunnyVideoId(editingEpisode?.bunny_video_id || null);
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
            onProgress: (uploaded, total) => {
              setUploadProgress(Math.round((uploaded / total) * 100));
            },
            onSuccess: () => resolve(creds.video_id),
          });

          tusUploadRef.current = upload;

          const previousUploads = await upload.findPreviousUploads();
          if (previousUploads.length) {
            upload.resumeFromPreviousUpload(previousUploads[0]);
          }

          upload.start();
        } catch (err) {
          const detail = err?.response?.status
            ? `(${err.response.status}) ${JSON.stringify(err.response.data)}`
            : err?.message || "unknown error";
          reject(new Error(`មិនអាចចាប់ផ្ដើម upload — ${detail}`));
        }
      })();
    });

  const handleCancelUpload = () => {
    tusUploadRef.current?.abort();
    tusUploadRef.current = null;
    setSubmitting(false);
    setSubmitStage(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setFormError("ចំណងជើងភាគត្រូវការ");
      return;
    }
    if (!form.episode_number) {
      setFormError("លេខភាគត្រូវការ");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setUploadProgress(0);

    let finalBunnyVideoId = bunnyVideoId;

    if (videoFile && !finalBunnyVideoId) {
      setSubmitStage("video");
      try {
        finalBunnyVideoId = await uploadVideoDirectToBunny(
          videoFile,
          `${movie.title} - EP${form.episode_number}`
        );
      } catch (err) {
        setFormError(err?.message || "Video upload failed.");
        setSubmitting(false);
        setSubmitStage(null);
        return;
      }
    }

    setSubmitStage("saving");

    const payload = {
      movie: movie.id,
      title: form.title,
      episode_number: Number(form.episode_number),
      description: form.description || "",
      duration: form.duration || null,
      is_active: form.is_active,
    };
    if (finalBunnyVideoId) payload.bunny_video_id = finalBunnyVideoId;

    try {
      if (editingEpisode) {
        await adminApi.updateEpisode(editingEpisode.id, payload);
      } else {
        await adminApi.createEpisode(payload);
      }
      setShowForm(false);
      resetForm();
      fetchEpisodes();
    } catch (err) {
      const data = err.response?.data;
      const detail =
        data && typeof data === "object"
          ? Object.entries(data)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
              .join(" · ")
          : null;
      setFormError(detail || "រក្សាទុកភាគមិនជោគជ័យ");
    } finally {
      setSubmitting(false);
      setSubmitStage(null);
      tusUploadRef.current = null;
    }
  };

  const handleDeleteEpisode = async (ep) => {
    if (!window.confirm(`លុបភាគទី ${ep.episode_number} "${ep.title}"?`)) return;
    try {
      await adminApi.deleteEpisode(ep.id);
      fetchEpisodes();
    } catch (err) {
      alert("លុបភាគមិនជោគជ័យ");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm py-8 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl my-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">គ្រប់គ្រងភាគ</h2>
            <p className="text-sm text-slate-400 mt-1">{movie.title}</p>
          </div>
          <button
            onClick={() => !submitting && onClose()}
            disabled={submitting}
            className="text-slate-400 hover:text-white disabled:opacity-40 p-2"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Add button */}
          {!showForm && (
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
            >
              <Plus size={15} /> បន្ថែមភាគថ្មី
            </button>
          )}

          {/* Add/Edit episode form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800/40 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">
                  {editingEpisode ? `កែសម្រួលភាគទី ${editingEpisode.episode_number}` : "ភាគថ្មី"}
                </h3>
                <button type="button" onClick={handleFormCancel} disabled={submitting} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">លេខភាគ *</label>
                  <input
                    type="number"
                    name="episode_number"
                    min="1"
                    value={form.episode_number}
                    onChange={handleChange}
                    required
                    className={`${inputClass} w-full`}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">ចំណងជើងភាគ *</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className={`${inputClass} w-full`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">ការពិពណ៌នា</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                  className={`${inputClass} w-full resize-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">រយៈពេល (នាទី)</label>
                <input
                  type="number"
                  name="duration"
                  min="0"
                  value={form.duration}
                  onChange={handleChange}
                  className={`${inputClass} w-full`}
                />
              </div>

              {/* Video upload */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">វីដេអូភាគ</label>
                {videoFile && videoPreview ? (
                  <div className="rounded-xl overflow-hidden border border-slate-700 bg-black">
                    <video src={videoPreview} controls className="w-full max-h-56 bg-black" />
                    <div className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-800/80">
                      <span className="text-xs text-slate-300 truncate">{videoFile.name}</span>
                      <button type="button" onClick={handleRemoveVideo} className="text-xs text-red-400 hover:text-red-300">
                        លុប
                      </button>
                    </div>
                  </div>
                ) : bunnyVideoId ? (
                  <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2">
                    <PlayCircle size={16} className="text-emerald-400" />
                    <span className="text-xs text-slate-300 flex-1 truncate">មានវីដេអូរួចហើយ (ID: {bunnyVideoId.slice(0, 8)}...)</span>
                    <button type="button" onClick={handleRemoveVideo} className="text-xs text-red-400 hover:text-red-300">
                      ដូរ
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-1.5 py-6 px-4 text-center border-2 border-dashed border-slate-700 bg-slate-800/50 hover:border-slate-600 rounded-xl cursor-pointer transition-colors">
                    <UploadCloud size={18} className="text-slate-500" />
                    <span className="text-xs text-slate-400">
                      <span className="text-amber-400 font-medium">ចុច</span> ដើម្បីជ្រើសរើសវីដេអូ
                    </span>
                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoInputChange} />
                  </label>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="rounded"
                  />
                  ដំណើរការ (Active)
                </label>
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
                    <span>{submitStage === "video" ? "កំពុងបញ្ចូលវីដេអូ…" : "កំពុងរក្សាទុក…"}</span>
                    {submitStage === "video" && <span>{uploadProgress}%</span>}
                  </div>
                  {submitStage === "video" && (
                    <>
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-amber-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <button
                        type="button"
                        onClick={handleCancelUpload}
                        className="mt-2 text-xs text-red-400 hover:text-red-300"
                      >
                        បោះបង់ upload
                      </button>
                    </>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={handleFormCancel}
                  disabled={submitting}
                  className="px-4 py-2 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-sm rounded-lg bg-amber-500 text-slate-950 font-medium hover:bg-amber-400 disabled:opacity-60"
                >
                  {submitting && <Loader size={14} className="animate-spin" />}
                  {editingEpisode ? "រក្សាទុក" : "បន្ថែម"}
                </button>
              </div>
            </form>
          )}

          {/* Episode list */}
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader className="animate-spin text-amber-500" size={24} />
            </div>
          ) : error ? (
            <p className="text-red-400 text-sm text-center py-6">{error}</p>
          ) : episodes.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">មិនទាន់មានភាគទេ</p>
          ) : (
            <div className="space-y-2">
              {episodes.map((ep) => (
                <div
                  key={ep.id}
                  className="flex items-center gap-3 bg-slate-800/40 border border-slate-700 rounded-xl p-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                    {ep.episode_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-100 truncate">{ep.title}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      {ep.duration ? `${ep.duration} នាទី` : "—"}
                      {!ep.is_active && <span className="text-red-400">• Inactive</span>}
                      {!ep.bunny_video_id && <span className="text-yellow-400">• គ្មានវីដេអូ</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEditClick(ep)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteEpisode(ep)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}