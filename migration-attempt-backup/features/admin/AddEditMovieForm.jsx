// src/features/admin/AddEditMovieForm.jsx
// សម្រាប់បង្កើត និងកែប្រែ Movie (រួមបញ្ចូល Poster, Backdrop, Banner Settings)

import { useState, useEffect, useRef } from 'react';
import { 
  Upload, X, Film, Image, Star, Eye, 
  Calendar, Clock, Globe, Tag, Users,
  Loader, AlertCircle, CheckCircle, Info
} from 'lucide-react';
import adminApi from '../../api/adminApi';
import moviesApi from '../../api/moviesApi';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const emptyForm = {
  // Basic Info
  title: '',
  description: '',
  short_description: '',
  
  // Media
  // (files are handled separately)
  
  // Details
  release_date: '',
  country: 'កម្ពុជា',
  language: 'ភាសាខ្មែរ',
  duration: '',
  
  // Access
  access_type: 'free',
  purchase_price: '',
  
  // Video
  bunny_video_id: '',
  trailer_url: '',
  
  // Classification
  genres: [],
  categories: [],
  cast: [],
  crew: [],
  
  // Banner Settings
  is_featured: false,
  is_new_release: false,
  banner_order: 0,
  
  // Status
  is_active: true,
};

export default function AddEditMovieForm({ movie = null, onSave, onCancel }) {
  const isEditMode = Boolean(movie);
  
  // ============ STATE ============
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // File upload states
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [backdropFile, setBackdropFile] = useState(null);
  const [backdropPreview, setBackdropPreview] = useState('');
  
  // Dropdown data
  const [genresList, setGenresList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  
  // Upload progress
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // ============ INITIALIZE ============
  useEffect(() => {
    // Load genres & categories for dropdowns
    const loadDropdownData = async () => {
      try {
        const [genresRes, categoriesRes] = await Promise.all([
          moviesApi.getGenres(),
          moviesApi.getCategories(),
        ]);
        setGenresList(genresRes.data || []);
        setCategoriesList(categoriesRes.data || []);
      } catch (err) {
        console.error('Failed to load dropdown data:', err);
      }
    };
    loadDropdownData();
    
    // If editing, populate form with movie data
    if (movie) {
      setForm({
        title: movie.title || '',
        description: movie.description || '',
        short_description: movie.short_description || '',
        release_date: movie.release_date || '',
        country: movie.country || 'កម្ពុជា',
        language: movie.language || 'ភាសាខ្មែរ',
        duration: movie.duration || '',
        access_type: movie.access_type || 'free',
        purchase_price: movie.purchase_price || '',
        bunny_video_id: movie.bunny_video_id || '',
        trailer_url: movie.trailer_url || '',
        genres: movie.genres?.map(g => g.id) || [],
        categories: movie.categories?.map(c => c.id) || [],
        cast: movie.cast || [],
        crew: movie.crew || [],
        is_featured: movie.is_featured || false,
        is_new_release: movie.is_new_release || false,
        banner_order: movie.banner_order || 0,
        is_active: movie.is_active ?? true,
      });
      
      if (movie.poster) setPosterPreview(movie.poster);
      if (movie.backdrop) setBackdropPreview(movie.backdrop);
    }
  }, [movie]);

  // ============ FORM HANDLERS ============
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleMultiSelect = (e) => {
    const { name, options } = e.target;
    const selected = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    setForm(prev => ({ ...prev, [name]: selected }));
  };

  // ============ FILE HANDLERS ============
  const handleFileSelect = (file, type) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('សូមជ្រើសរើសឯកសាររូបភាព (JPG, PNG)។');
      return;
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('ឯកសារធំពេក! អតិបរមា 5MB។');
      return;
    }
    
    setError(null);
    const previewUrl = URL.createObjectURL(file);
    
    if (type === 'poster') {
      setPosterFile(file);
      setPosterPreview(previewUrl);
    } else {
      setBackdropFile(file);
      setBackdropPreview(previewUrl);
    }
  };

  const removeFile = (type) => {
    if (type === 'poster') {
      setPosterFile(null);
      setPosterPreview('');
    } else {
      setBackdropFile(null);
      setBackdropPreview('');
    }
  };

  // ============ SUBMIT ============
  // ============ SUBMIT ============
const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setSuccess(null);
  setLoading(true);
  setUploadProgress(0);

  try {
    const formData = new FormData();

    // ✅ ផ្ញើតែ fields ដែលមានតម្លៃ
    if (form.title) formData.append('title', form.title);
    if (form.description) formData.append('description', form.description);
    if (form.short_description) formData.append('short_description', form.short_description);
    if (form.release_date) formData.append('release_date', form.release_date);
    if (form.country) formData.append('country', form.country);
    if (form.language) formData.append('language', form.language);
    if (form.duration) formData.append('duration', form.duration);
    if (form.access_type) formData.append('access_type', form.access_type);
    
    // purchase_price — ផ្ញើតែពេល access_type ជា purchase
    if (form.access_type === 'purchase' && form.purchase_price) {
      formData.append('purchase_price', form.purchase_price);
    }
    
    // bunny_video_id — ផ្ញើតែពេលមានតម្លៃ
    if (form.bunny_video_id) formData.append('bunny_video_id', form.bunny_video_id);
    
    // trailer_url — ផ្ញើតែពេលមានតម្លៃ
    if (form.trailer_url) formData.append('trailer_url', form.trailer_url);

    // ✅ Genres & Categories — ផ្ញើជា individual values
    if (form.genres.length > 0) {
      form.genres.forEach(g => formData.append('genres', g));
    }
    if (form.categories.length > 0) {
      form.categories.forEach(c => formData.append('categories', c));
    }

    // ✅ Boolean fields
    formData.append('is_featured', form.is_featured ? 'true' : 'false');
    formData.append('is_new_release', form.is_new_release ? 'true' : 'false');
    formData.append('is_active', form.is_active ? 'true' : 'false');

    // ✅ Files - Poster, Backdrop
    if (posterFile) formData.append('poster', posterFile);
    if (backdropFile) formData.append('backdrop', backdropFile);

    // API call
    const config = {
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      },
    };

    const response = isEditMode
      ? await adminApi.updateMovie(movie.id, formData, config)
      : await adminApi.createMovie(formData, config);

    setSuccess(isEditMode ? 'បានរក្សាទុក!' : 'បានបង្កើតថ្មី!');
    
    if (onSave) {
      setTimeout(() => onSave(response.data), 800);
    }
  } catch (err) {
    console.error('Save failed:', err);
    const data = err.response?.data;
    console.log('Server error:', JSON.stringify(data, null, 2));
    
    if (data?.errors) {
      const messages = Object.entries(data.errors)
        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join(' | ');
      setError(messages);
    } else if (data?.detail) {
      setError(data.detail);
    } else {
      setError('មិនអាចរក្សាទុកបានទេ។');
    }
  } finally {
    setLoading(false);
  }
};

  // ============ RENDER ============
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">
            {isEditMode ? 'កែប្រែភាពយន្ត' : 'បង្កើតភាពយន្តថ្មី'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {isEditMode ? 'កែប្រែព័ត៌មានភាពយន្តដែលមានស្រាប់' : 'បំពេញព័ត៌មានដើម្បីបន្ថែមភាពយន្តថ្មី'}
          </p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-white p-2">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mx-6 mt-4 flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mx-6 mt-4 flex items-start gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
          <CheckCircle size={16} className="mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mx-6 mt-4">
          <div className="flex items-center justify-between text-sm text-slate-400 mb-1">
            <span>កំពុង Upload...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        
        {/* ============ SECTION 1: MEDIA (POSTER & BACKDROP) ============ */}
        <Section title="រូបភាពភាពយន្ត" icon={<Image size={18} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Poster Upload */}
            <ImageUploadBox
              label="Poster (រូបផ្ទាំងរឿង)"
              description="សម្រាប់បង្ហាញក្នុង Movie Card"
              aspectRatio="2/3"
              recommendedSize="600×900px"
              preview={posterPreview}
              onFileSelect={(file) => handleFileSelect(file, 'poster')}
              onRemove={() => removeFile('poster')}
            />

            {/* Backdrop Upload */}
            <ImageUploadBox
              label="Backdrop (ផ្ទៃខាងក្រោយ)"
              description="សម្រាប់ Hero Banner និងទំព័រលម្អិត"
              aspectRatio="16/9"
              recommendedSize="1600×900px"
              preview={backdropPreview}
              onFileSelect={(file) => handleFileSelect(file, 'backdrop')}
              onRemove={() => removeFile('backdrop')}
            />
          </div>
        </Section>

        {/* ============ SECTION 2: BASIC INFO ============ */}
        <Section title="ព័ត៌មានមូលដ្ឋាន" icon={<Film size={18} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label required>ចំណងជើង</Label>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="ឧ. នាគបុរី"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label required>ការពិពណ៌នា</Label>
              <TextArea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="ពិពណ៌នាអំពីភាពយន្ត..."
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label>ការពិពណ៌នាខ្លី</Label>
              <TextArea
                name="short_description"
                value={form.short_description}
                onChange={handleChange}
                rows={2}
                placeholder="ពិពណ៌នាខ្លីសម្រាប់ Movie Card..."
              />
            </div>

            <div>
              <Label required>ថ្ងៃចេញផ្សាយ</Label>
              <Input
                type="date"
                name="release_date"
                value={form.release_date}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label required>រយៈពេល (នាទី)</Label>
              <Input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="120"
                min="1"
                required
              />
            </div>

            <div>
              <Label>ប្រទេស</Label>
              <Input
                name="country"
                value={form.country}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>ភាសា</Label>
              <Input
                name="language"
                value={form.language}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <Label>ប្រភេទ (Genres)</Label>
              <select
                multiple
                name="genres"
                value={form.genres}
                onChange={handleMultiSelect}
                className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm min-h-[120px]"
              >
                {genresList.map(genre => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                សង្កត់ Ctrl (Cmd) ដើម្បីជ្រើសរើសច្រើន
              </p>
            </div>
          </div>
        </Section>

        {/* ============ SECTION 3: ACCESS & VIDEO ============ */}
        <Section title="ការចូលមើល និងវីដេអូ" icon={<Star size={18} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label required>ប្រភេទចូលមើល</Label>
              <Select
                name="access_type"
                value={form.access_type}
                onChange={handleChange}
              >
                <option value="free">🆓 ឥតគិតថ្លៃ</option>
                <option value="member">⭐ សមាជិក VIP</option>
                <option value="purchase">💰 ទិញ</option>
              </Select>
            </div>

            {form.access_type === 'purchase' && (
              <div>
                <Label required>តម្លៃ ($)</Label>
                <Input
                  type="number"
                  name="purchase_price"
                  value={form.purchase_price}
                  onChange={handleChange}
                  placeholder="2.99"
                  step="0.01"
                  min="0"
                />
              </div>
            )}

            <div>
              <Label>Bunny.net Video ID</Label>
              <Input
                name="bunny_video_id"
                value={form.bunny_video_id}
                onChange={handleChange}
                placeholder="ឧ. 12345678-1234-1234-1234-123456789abc"
              />
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Info size={12} />
                ចម្លង Video ID ពី Bunny.net Dashboard
              </p>
            </div>

            <div>
              <Label>Trailer URL</Label>
              <Input
                type="url"
                name="trailer_url"
                value={form.trailer_url}
                onChange={handleChange}
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
          </div>
        </Section>

        {/* ============ SECTION 4: BANNER SETTINGS ============ */}
        <Section 
          title="ការកំណត់ Banner និងការបង្ហាញ" 
          icon={<Eye size={18} />}
          badge="សំខាន់សម្រាប់ទំព័រដើម"
        >
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Featured Toggle */}
              <div className="flex items-center gap-3 p-4 bg-slate-800 rounded-xl">
                <div className="flex-1">
                  <label className="text-white font-medium flex items-center gap-2">
                    <Star size={16} className="text-amber-400" />
                    បង្ហាញក្នុង Banner ទំព័រដើម
                  </label>
                  <p className="text-xs text-slate-400 mt-1">
                    បង្ហាញរឿងនេះក្នុង Hero Slider នៅទំព័រដើម
                  </p>
                </div>
                <ToggleSwitch
                  name="is_featured"
                  checked={form.is_featured}
                  onChange={handleChange}
                />
              </div>

              {/* New Release Toggle */}
              <div className="flex items-center gap-3 p-4 bg-slate-800 rounded-xl">
                <div className="flex-1">
                  <label className="text-white font-medium flex items-center gap-2">
                    <Calendar size={16} className="text-blue-400" />
                    សម្គាល់ថាចេញថ្មី
                  </label>
                  <p className="text-xs text-slate-400 mt-1">
                    បង្ហាញ Badge "ថ្មី" លើ Movie Card
                  </p>
                </div>
                <ToggleSwitch
                  name="is_new_release"
                  checked={form.is_new_release}
                  onChange={handleChange}
                />
              </div>

              {/* Banner Order */}
              {form.is_featured && (
                <div className="md:col-span-2">
                  <Label>លំដាប់ក្នុង Banner</Label>
                  <Input
                    type="number"
                    name="banner_order"
                    value={form.banner_order}
                    onChange={handleChange}
                    placeholder="0 = បង្ហាញមុនគេ"
                    min="0"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    លេខតូចបង្ហាញមុន។ ទុក 0 សម្រាប់ Banner ដំបូង។
                  </p>
                </div>
              )}

              {/* Active Toggle */}
              <div className="flex items-center gap-3 p-4 bg-slate-800 rounded-xl">
                <div className="flex-1">
                  <label className="text-white font-medium flex items-center gap-2">
                    <Globe size={16} className="text-green-400" />
                    បើកដំណើរការ (Active)
                  </label>
                  <p className="text-xs text-slate-400 mt-1">
                    បើក/បិទ ការបង្ហាញរឿងនេះនៅលើ Website
                  </p>
                </div>
                <ToggleSwitch
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {form.is_featured && (
            <div className="mt-4 bg-slate-800 rounded-xl p-4 border border-amber-500/20">
              <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-3">
                <Eye size={14} />
                ការមើលជាមុន (Preview)
              </h4>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900">
                {backdropPreview ? (
                  <img 
                    src={backdropPreview} 
                    alt="Banner preview" 
                    className="w-full h-full object-cover"
                  />
                ) : posterPreview ? (
                  <img 
                    src={posterPreview} 
                    alt="Banner preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-slate-500 text-sm">មិនមានរូបភាព</p>
                  </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                
                {/* Preview Content */}
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded font-bold">HD</span>
                    {form.is_new_release && (
                      <span className="bg-red-600/80 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                        ចេញថ្មី
                      </span>
                    )}
                  </div>
                  <h3 className="text-white text-lg font-bold">
                    {form.title || 'ចំណងជើងភាពយន្ត'}
                  </h3>
                  <p className="text-gray-300 text-xs mt-1">
                    {form.short_description || 'ការពិពណ៌នាខ្លី...'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ============ ACTION BUTTONS ============ */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2.5 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition"
          >
            បោះបង់
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm rounded-lg bg-amber-500 text-slate-950 font-medium hover:bg-amber-400 disabled:opacity-60 transition"
          >
            {loading && <Loader size={14} className="animate-spin" />}
            {isEditMode ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'បង្កើតភាពយន្ត'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============ SUB-COMPONENTS ============

function Section({ title, icon, badge, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-amber-400">{icon}</span>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {badge && (
          <span className="text-xs text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function ImageUploadBox({ label, description, aspectRatio, recommendedSize, preview, onFileSelect, onRemove }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    onFileSelect(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <Label>{label}</Label>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onClick={() => inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all
          ${dragActive ? 'border-amber-400 bg-amber-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}
          ${aspectRatio === '2/3' ? 'aspect-[2/3]' : 'aspect-video'}
        `}
      >
        {preview ? (
          <>
            <img src={preview} alt={label} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white rounded-full p-1.5 transition"
            >
              <X size={14} />
            </button>
            <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm">
                ជំនួសរូបភាព
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-4">
            <Upload size={24} className="mb-2" />
            <span className="text-sm text-center">
              <span className="text-amber-400 font-medium">ចុច</span> ឬ ទាញនិងទម្លាក់
            </span>
            <span className="text-xs mt-1">{recommendedSize}</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => onFileSelect(e.target.files[0])}
          className="hidden"
        />
      </div>
      <p className="text-xs text-slate-500 mt-1">
        {description} | ណែនាំ៖ {recommendedSize} | អតិបរមា 5MB
      </p>
    </div>
  );
}

function Label({ children, required }) {
  return (
    <label className="block text-sm font-medium text-slate-300 mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}

function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 placeholder:text-slate-600 ${className}`}
    />
  );
}

function TextArea({ className = '', ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 placeholder:text-slate-600 resize-none ${className}`}
    />
  );
}

function Select({ className = '', children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 ${className}`}
    >
      {children}
    </select>
  );
}

function ToggleSwitch({ name, checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
    </label>
  );
}