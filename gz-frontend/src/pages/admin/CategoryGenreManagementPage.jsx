// src/pages/admin/CategoryGenreManagementPage.jsx
import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader,
  AlertCircle,
  CheckCircle,
  Tag,
  Globe,
  Folder,
  Tv,
  Search,
} from "lucide-react";
import adminApi from "../../api/adminApi";
import { inputClass } from "../../utils/constants";

export default function CategoryGenreManagementPage() {
  const [activeTab, setActiveTab] = useState('genres'); // 'genres' | 'series_types' | 'countries' | 'categories'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', flag: '' });
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const tabs = [
    { id: 'genres', label: 'ប្រភេទរឿង', icon: Tag },
    { id: 'series_types', label: 'ប្រភេទរឿងភាគ', icon: Tv },
    { id: 'countries', label: 'ប្រទេស', icon: Globe },
    { id: 'categories', label: 'ក្រុមផ្សេងៗ', icon: Folder },
  ];

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      
      // ប្រើ switch ដើម្បីងាយស្រួលក្នុងការគ្រប់គ្រង tabs ច្រើន
      switch (activeTab) {
        case 'genres':
          res = await adminApi.getGenres();
          break;
        case 'series_types':
          res = await adminApi.getSeriesTypes();
          break;
        case 'countries':
          res = await adminApi.getCountries();
          break;
        case 'categories':
          res = await adminApi.getCategories();
          break;
        default:
          res = await adminApi.getCategories();
      }
      
      const list = res.data?.results || res.data || [];
      setItems(list);
    } catch (err) {
      console.error(`Failed to load ${activeTab}:`, err);
      setError(`មិនអាចទាញយកទិន្នន័យ ${activeTab} បានទេ`);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  );

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ name: '', flag: '' });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      flag: item.flag || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('សូមបញ្ចូលឈ្មោះ');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        name: formData.name.trim(),
        // បន្ថែម flag សម្រាប់ countries និង series_types
        ...((activeTab === 'countries' || activeTab === 'series_types') && { 
          flag: formData.flag || '' 
        }),
      };

      if (editingItem) {
        await adminApi.updateTaxonomy(activeTab, editingItem.id, data);
      } else {
        await adminApi.createTaxonomy(activeTab, data);
      }
      
      setShowModal(false);
      fetchItems();
    } catch (err) {
      console.error('Save failed:', err);
      alert('រក្សាទុកមិនបានសម្រេច។ សូមព្យាយាមម្តងទៀត។');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await adminApi.deleteTaxonomy(activeTab, deleteConfirm.id);
      setDeleteConfirm(null);
      fetchItems();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('លុបមិនបានសម្រេច។ សូមព្យាយាមម្តងទៀត។');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-amber-400 border-amber-400'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ស្វែងរក..."
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader className="animate-spin text-slate-400" size={32} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Items Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* បង្ហាញ flag សម្រាប់ countries និង series_types */}
                  {(activeTab === 'countries' || activeTab === 'series_types') && item.flag && (
                    <span className="text-3xl">{item.flag}</span>
                  )}
                  <div>
                    <h3 className="text-white font-medium">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Slug: {item.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-white"
                    title="កែប្រែ"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(item)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                    title="លុប"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <p className="text-gray-500">មិនមានទិន្នន័យទេ</p>
              <button
                onClick={openCreateModal}
                className="mt-3 inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300"
              >
                <Plus size={14} /> បន្ថែមថ្មី
              </button>
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
            <h2 className="text-lg font-semibold text-slate-100 mb-4">
              {editingItem ? 'កែប្រែ' : 'បន្ថែមថ្មី'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  ឈ្មោះ *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className={`${inputClass} w-full`}
                  placeholder={
                    activeTab === 'genres' ? 'ឧទាហរណ៍៖ Action, Drama' :
                    activeTab === 'series_types' ? 'ឧទាហរណ៍៖ រឿងភាគចិន' :
                    activeTab === 'countries' ? 'ឧទាហរណ៍៖ ខ្មែរ, ចិន' :
                    'ឧទាហរណ៍៖ និយាយខ្មែរ'
                  }
                />
              </div>

              {/* បង្ហាញ flag field សម្រាប់ countries និង series_types */}
              {(activeTab === 'countries' || activeTab === 'series_types') && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {activeTab === 'countries' ? 'ទង់ជាតិ (Emoji)' : 'និមិត្តសញ្ញា (Emoji)'}
                  </label>
                  <input
                    type="text"
                    value={formData.flag || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, flag: e.target.value }))}
                    className={`${inputClass} w-full`}
                    placeholder={activeTab === 'countries' ? '🇰🇭 🇨🇳 🇰🇷' : '🇨🇳 🇺🇸 🇰🇷'}
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
                  {editingItem ? 'រក្សាទុក' : 'បន្ថែម'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertCircle size={24} className="text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">បញ្ជាក់ការលុប</h2>
                <p className="text-sm text-gray-400">សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ</p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-300">
                តើអ្នកប្រាកដថាចង់លុប{' '}
                <span className="font-bold text-white">{deleteConfirm.name}</span> មែនទេ?
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                បោះបង់
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white font-medium hover:bg-red-400"
              >
                លុបចោល
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}