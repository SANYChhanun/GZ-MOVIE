// src/pages/admin/CategoryGenreManagementPage.jsx
import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader,
  AlertCircle,
  ShieldAlert,
  Tag,
  Globe,
  Folder,
  Tv,
  Search,
  Film,
} from "lucide-react";
import adminApi from "../../api/adminApi";
import { inputClass } from "../../utils/constants";

const TABS = [
  { id: "genres", label: "ប្រភេទរឿង", icon: Tag },
  { id: "series_types", label: "ប្រភេទរឿងភាគ", icon: Tv },
  { id: "countries", label: "ប្រទេស", icon: Globe },
  { id: "categories", label: "ក្រុមផ្សេងៗ", icon: Folder },
];

const HAS_FLAG = new Set(["countries", "series_types"]);

export default function CategoryGenreManagementPage() {
  const [activeTab, setActiveTab] = useState("genres");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", flag: "" });
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  // delete flow: either a normal confirm, or a "blocked" explanation
  const [deleteTarget, setDeleteTarget] = useState(null); // item pending delete confirmation
  const [blockedItem, setBlockedItem] = useState(null); // item that can't be deleted (in use)
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchItems();
    setSearchQuery("");
  }, [activeTab]);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      switch (activeTab) {
        case "genres":
          res = await adminApi.getGenres();
          break;
        case "series_types":
          res = await adminApi.getSeriesTypes();
          break;
        case "countries":
          res = await adminApi.getCountries();
          break;
        case "categories":
          res = await adminApi.getCategories();
          break;
        default:
          res = await adminApi.getCategories();
      }
      const list = res.data?.results || res.data || [];
      setItems(list);
    } catch (err) {
      console.error(`Failed to load ${activeTab}:`, err);
      setError(`មិនអាចទាញយកទិន្នន័យបានទេ។ សូមព្យាយាមម្តងទៀត។`);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(
    () =>
      items
        .filter((item) => item.name?.toLowerCase().includes(searchQuery.toLowerCase()))
        // most-used first — helps admins see what matters before they touch anything
        .sort((a, b) => (b.movies_count || 0) - (a.movies_count || 0)),
    [items, searchQuery]
  );

  const totalUsage = useMemo(
    () => items.reduce((sum, item) => sum + (item.movies_count || 0), 0),
    [items]
  );

  /* ---------------- create / edit ---------------- */

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ name: "", flag: "" });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name || "", flag: item.flag || "" });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("សូមបញ្ចូលឈ្មោះ");
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        name: formData.name.trim(),
        ...(HAS_FLAG.has(activeTab) && { flag: formData.flag || "" }),
      };

      if (editingItem) {
        await adminApi.updateTaxonomy(activeTab, editingItem.id, data);
      } else {
        await adminApi.createTaxonomy(activeTab, data);
      }

      setShowModal(false);
      fetchItems();
    } catch (err) {
      console.error("Save failed:", err);
      const msg = err?.response?.data?.name?.[0] || err?.response?.data?.detail;
      alert(msg || "រក្សាទុកមិនបានសម្រេច។ សូមព្យាយាមម្តងទៀត។");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- delete ---------------- */

  const requestDelete = (item) => {
    // Client-side guard: we already know movies_count from the list payload,
    // so we can short-circuit and explain immediately without a round trip.
    if ((item.movies_count || 0) > 0) {
      setBlockedItem(item);
    } else {
      setDeleteTarget(item);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteTaxonomy(activeTab, deleteTarget.id);
      setDeleteTarget(null);
      fetchItems();
    } catch (err) {
      console.error("Delete failed:", err);
      // Server-side guard as a safety net (e.g. a movie was tagged with this
      // item in the moment between page load and this click).
      if (err?.response?.status === 409) {
        setDeleteTarget(null);
        setBlockedItem({ ...deleteTarget, movies_count: err.response.data?.movies_count || 1 });
      } else {
        alert("លុបមិនបានសម្រេច។ សូមព្យាយាមម្តងទៀត។");
      }
    } finally {
      setDeleting(false);
    }
  };

  const activeTabMeta = TABS.find((t) => t.id === activeTab);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">គ្រប់គ្រងប្រភេទ និងប្រទេស</h1>
          <p className="text-gray-400 text-sm mt-1">
            បន្ថែម កែប្រែ ឬលុបប្រភេទរឿង ប្រភេទរឿងភាគ ប្រទេស និងក្រុមផ្សេងៗ
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          បន្ថែមថ្មី
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-800 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                active
                  ? "text-amber-400 border-amber-400"
                  : "text-gray-400 border-transparent hover:text-white"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search + summary */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`ស្វែងរក${activeTabMeta ? " " + activeTabMeta.label : ""}...`}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        {!loading && !error && (
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {items.length} ធាតុ · ប្រើប្រាស់សរុប {totalUsage} ដង
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader className="animate-spin text-slate-400" size={32} />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center justify-between gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
          <span className="flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </span>
          <button onClick={fetchItems} className="text-xs underline hover:text-red-300 shrink-0">
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      )}

      {/* Items Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const usage = item.movies_count || 0;
            const inUse = usage > 0;
            return (
              <div
                key={item.id}
                className="group bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {HAS_FLAG.has(activeTab) && item.flag && (
                      <span className="text-3xl shrink-0">{item.flag}</span>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-white font-medium truncate">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">Slug: {item.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-white"
                      title="កែប្រែ"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => requestDelete(item)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                      title={inUse ? "កំពុងប្រើប្រាស់ — មិនអាចលុបបានទេ" : "លុប"}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Usage badge — the whole point: admins see this before they
                    ever reach for the delete button */}
                <div className="mt-3 flex items-center gap-1.5">
                  <Film size={12} className={inUse ? "text-amber-400" : "text-slate-600"} />
                  <span className={`text-xs ${inUse ? "text-amber-400" : "text-slate-600"}`}>
                    {inUse ? `ប្រើប្រាស់ដោយ ${usage} រឿង` : "មិនទាន់ប្រើប្រាស់"}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <p className="text-gray-500">
                {searchQuery ? "រកមិនឃើញធាតុដែលត្រូវនឹងការស្វែងរក" : "មិនមានទិន្នន័យទេ"}
              </p>
              {!searchQuery && (
                <button
                  onClick={openCreateModal}
                  className="mt-3 inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300"
                >
                  <Plus size={14} /> បន្ថែមថ្មី
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold text-slate-100 mb-1">
              {editingItem ? "កែប្រែ" : "បន្ថែមថ្មី"}
            </h2>
            {editingItem && (editingItem.movies_count || 0) > 0 && (
              <p className="text-xs text-slate-500 mb-4">
                ការប្តូរឈ្មោះនេះនឹងបង្ហាញភ្លាមលើរឿងទាំង {editingItem.movies_count} ដែលកំពុងប្រើវា។
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">ឈ្មោះ *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  autoFocus
                  className={`${inputClass} w-full`}
                  placeholder={
                    activeTab === "genres"
                      ? "ឧទាហរណ៍៖ Action, Drama"
                      : activeTab === "series_types"
                      ? "ឧទាហរណ៍៖ រឿងភាគចិន"
                      : activeTab === "countries"
                      ? "ឧទាហរណ៍៖ ខ្មែរ, ចិន"
                      : "ឧទាហរណ៍៖ និយាយខ្មែរ"
                  }
                />
              </div>

              {HAS_FLAG.has(activeTab) && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {activeTab === "countries" ? "ទង់ជាតិ (Emoji)" : "និមិត្តសញ្ញា (Emoji)"}
                  </label>
                  <input
                    type="text"
                    value={formData.flag || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, flag: e.target.value }))}
                    className={`${inputClass} w-full`}
                    placeholder={activeTab === "countries" ? "🇰🇭 🇨🇳 🇰🇷" : "🇨🇳 🇺🇸 🇰🇷"}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-amber-500 text-slate-950 font-medium hover:bg-amber-400 disabled:opacity-60"
                >
                  {submitting && <Loader size={14} className="animate-spin" />}
                  {editingItem ? "រក្សាទុក" : "បន្ថែម"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal — only reachable when movies_count === 0 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle size={24} className="text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">បញ្ជាក់ការលុប</h2>
                <p className="text-sm text-gray-400">សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ</p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-300">
                តើអ្នកប្រាកដថាចង់លុប{" "}
                <span className="font-bold text-white">{deleteTarget.name}</span> មែនទេ?
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
              >
                បោះបង់
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-red-500 text-white font-medium hover:bg-red-400 disabled:opacity-60"
              >
                {deleting && <Loader size={14} className="animate-spin" />}
                លុបចោល
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blocked Delete Modal — shown instead, when the item is still in use */}
      {blockedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0">
                <ShieldAlert size={24} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">មិនអាចលុបបានទេ</h2>
                <p className="text-sm text-gray-400">ធាតុនេះកំពុងត្រូវបានប្រើប្រាស់</p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-300">
                <span className="font-bold text-white">{blockedItem.name}</span> កំពុងប្រើប្រាស់ដោយ{" "}
                <span className="font-bold text-amber-400">{blockedItem.movies_count}</span> រឿង។ សូមដកវាចេញពីរឿង
                ទាំងនោះជាមុនសិន (តាមរយៈទម្រង់កែប្រែរឿងនីមួយៗ) មុននឹងអាចលុបបាន។
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBlockedItem(null)}
                className="px-4 py-2 text-sm rounded-lg bg-amber-500 text-slate-950 font-medium hover:bg-amber-400"
              >
                យល់ព្រម
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}