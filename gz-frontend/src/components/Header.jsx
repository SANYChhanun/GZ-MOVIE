// src/components/Header.jsx — Netflix Style Header with Dynamic Series Types
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axiosClient from '../api/axiosClient';
import {
  Search,
  ChevronDown,
  Bell,
  User,
  Settings,
  LogOut,
  Film,
  Tv,
  Globe,
  Tag,
  Crown,
  Shield,
  Menu,
  X,
} from 'lucide-react';

export default function Header() {
  const { user, isAdmin, isVIP, logout } = useAuth();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'movies' | 'series' | 'genres' | 'countries' | 'user'
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const headerRef = useRef(null); // ★ FIX: wraps the WHOLE header (left nav + right user menu)
  const searchInputRef = useRef(null);

  // ===== Dynamic taxonomy data (fetched from API) =====
  const [seriesTypes, setSeriesTypes] = useState([]);
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [seriesRes, genreRes, countryRes] = await Promise.allSettled([
          axiosClient.get('/api/series-types/'),
          axiosClient.get('/api/genres/'),
          axiosClient.get('/api/countries/'),
          ]);
        if (!mounted) return;

        if (seriesRes.status === 'fulfilled') {
          const data = seriesRes.value.data;
          setSeriesTypes(data?.results || data || []);
        } else {
          console.error('Failed to load series types:', seriesRes.reason);
        }

        if (genreRes.status === 'fulfilled') {
          const data = genreRes.value.data;
          setGenres(data?.results || data || []);
        } else {
          console.error('Failed to load genres:', genreRes.reason);
        }

        if (countryRes.status === 'fulfilled') {
          const data = countryRes.value.data;
          setCountries(data?.results || data || []);
        } else {
          console.error('Failed to load countries:', countryRes.reason);
        }
      } finally {
        if (mounted) setTaxonomyLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu and dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setShowSearch(false);
  }, [navigate]);

  // Close dropdowns on outside click
  // ★ FIX: previously this ref only wrapped the left <nav>, so clicking a link
  // inside the right-side User Menu dropdown (e.g. admin link) counted as
  // an "outside click" and closed the dropdown via mousedown BEFORE the
  // click/navigation could fire — link appeared to do nothing on desktop.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when search is shown
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Escape key to close dropdowns
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setShowSearch(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
      setActiveDropdown(null);
    }
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <>
      {/* Main Header */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled || activeDropdown || mobileMenuOpen || showSearch
            ? 'bg-[#0a0a0a]/95 backdrop-blur-md shadow-2xl'
            : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent'
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left Section - Logo and Navigation */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link to="/" className="flex items-center flex-shrink-0 group">
                {!logoError ? (
                  <img
                    src="/images/logoGz.png"
                    alt="GZ Movie"
                    className="h-10 md:h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                    onError={() => setLogoError(true)}
                    style={{
                      filter: 'brightness(1.2) contrast(1.1) drop-shadow(0 0 10px rgba(229, 9, 20, 0.6))',
                    }}
                  />
                ) : (
                  <span className="text-2xl md:text-4xl font-black tracking-wider">
                    <span className="text-[#E50914] drop-shadow-lg">GZ</span>
                    <span className="text-white">MOVIE</span>
                  </span>
                )}
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                <Link
                  to="/"
                  className="text-gray-200 hover:text-white text-base font-medium px-3 py-2 rounded-lg transition-colors hover:bg-white/10"
                >
                  ទំព័រដើម
                </Link>

                {/* Movies Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('movies')}
                    className="flex items-center gap-1 text-gray-200 hover:text-white text-base font-medium px-3 py-2 rounded-lg transition-colors hover:bg-white/10"
                  >
                    <Film size={18} />
                    រឿងដុំ
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${activeDropdown === 'movies' ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {activeDropdown === 'movies' && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-3">
                      <Link to="/movies" className="block px-5 py-2.5 text-base text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                        រឿងទាំងអស់
                      </Link>
                      <Link to="/movies?sort=new" className="block px-5 py-2.5 text-base text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                        ចេញថ្មី
                      </Link>
                      <Link to="/movies?sort=popular" className="block px-5 py-2.5 text-base text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                        ពេញនិយម
                      </Link>
                      <Link to="/movies?type=free" className="block px-5 py-2.5 text-base text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                        ឥតគិតថ្លៃ
                      </Link>
                    </div>
                  )}
                </div>

                {/* Series Dropdown — now driven by the Series Types API */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('series')}
                    className="flex items-center gap-1 text-gray-200 hover:text-white text-base font-medium px-3 py-2 rounded-lg transition-colors hover:bg-white/10"
                  >
                    <Tv size={18} />
                    រឿងភាគ
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${activeDropdown === 'series' ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {activeDropdown === 'series' && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-3 max-h-96 overflow-y-auto">
                      <Link to="/series" className="block px-5 py-2.5 text-base text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                        រឿងភាគទាំងអស់
                      </Link>
                      <div className="border-t border-white/10 my-2"></div>
                      {taxonomyLoading ? (
                        <p className="px-5 py-2.5 text-sm text-gray-500">កំពុងផ្ទុក…</p>
                      ) : seriesTypes.length === 0 ? (
                        <p className="px-5 py-2.5 text-sm text-gray-500">មិនទាន់មានប្រភេទរឿងភាគទេ</p>
                      ) : (
                        seriesTypes.map((type) => (
                          <Link
                            key={type.id}
                            to={`/series/type/${type.slug}`}
                            className="flex items-center px-5 py-2.5 text-base text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            {type.flag && <span className="mr-3 text-xl">{type.flag}</span>}
                            {type.name}
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Genres Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('genres')}
                    className="flex items-center gap-1 text-gray-200 hover:text-white text-base font-medium px-3 py-2 rounded-lg transition-colors hover:bg-white/10"
                  >
                    <Tag size={18} />
                    ប្រភេទ
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${activeDropdown === 'genres' ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {activeDropdown === 'genres' && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-3 max-h-96 overflow-y-auto">
                      {taxonomyLoading ? (
                        <p className="px-5 py-2.5 text-sm text-gray-500">កំពុងផ្ទុក…</p>
                      ) : genres.length === 0 ? (
                        <p className="px-5 py-2.5 text-sm text-gray-500">មិនទាន់មានប្រភេទទេ</p>
                      ) : (
                        genres.map((genre) => (
                          <Link
                            key={genre.id}
                            to={`/genre/${genre.slug}`}
                            className="block px-5 py-2.5 text-base text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            {genre.name}
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Countries Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('countries')}
                    className="flex items-center gap-1 text-gray-200 hover:text-white text-base font-medium px-3 py-2 rounded-lg transition-colors hover:bg-white/10"
                  >
                    <Globe size={18} />
                    ប្រទេស
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${activeDropdown === 'countries' ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {activeDropdown === 'countries' && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-3 max-h-96 overflow-y-auto">
                      {taxonomyLoading ? (
                        <p className="px-5 py-2.5 text-sm text-gray-500">កំពុងផ្ទុក…</p>
                      ) : countries.length === 0 ? (
                        <p className="px-5 py-2.5 text-sm text-gray-500">មិនទាន់មានប្រទេសទេ</p>
                      ) : (
                        countries.map((country) => (
                          <Link
                            key={country.id}
                            to={`/country/${country.slug}`}
                            className="flex items-center px-5 py-2.5 text-base text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            {country.flag && <span className="mr-3 text-xl">{country.flag}</span>}
                            {country.name}
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </nav>
            </div>

            {/* Right Section - Search, Notifications, User */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSearch(!showSearch);
                    setActiveDropdown(null);
                  }}
                  className="text-gray-200 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="ស្វែងរក"
                >
                  <Search size={22} />
                </button>

                {showSearch && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl p-3">
                    <form onSubmit={handleSearch}>
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ស្វែងរកភាពយន្ត រឿងភាគ..."
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-base text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                      />
                    </form>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <button
                className="hidden md:block text-gray-200 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors relative"
                title="ការជូនដំណឹង"
              >
                <Bell size={22} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu / Login */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('user')}
                    className="flex items-center gap-2 text-gray-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center relative">
                      <User size={18} className="text-white" />
                      {isVIP && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                          <Crown size={10} className="text-black" />
                        </span>
                      )}
                    </div>
                    <span className="hidden xl:block text-base font-medium">{user.username}</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${activeDropdown === 'user' ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {activeDropdown === 'user' && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-3">
                      {/* User Info */}
                      <div className="px-5 py-3 border-b border-white/10">
                        <p className="text-base font-semibold text-white">{user.username}</p>
                        <p className="text-sm text-gray-400">{user.email || 'user@example.com'}</p>
                        <div className="flex gap-2 mt-2">
                          {isVIP && (
                            <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                              <Crown size={12} /> VIP
                            </span>
                          )}
                          {isAdmin && (
                            <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                              <Shield size={12} /> Admin
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-5 py-3 text-base text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <Shield size={18} className="text-purple-400" />
                            គ្រប់គ្រង (Admin)
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-5 py-3 text-base text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <Settings size={18} />
                          ការកំណត់
                        </Link>
                        <Link
                          to="/history"
                          className="flex items-center gap-3 px-5 py-3 text-base text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <Film size={18} />
                          ប្រវត្តិមើល
                        </Link>
                      </div>

                      <div className="border-t border-white/10 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full text-left px-5 py-3 text-base text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                        >
                          <LogOut size={18} />
                          ចាកចេញ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-gray-200 hover:text-white text-base font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    ចូលគណនី
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-[#E50914] hover:bg-[#f6121d] text-white text-base font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-red-500/50 hover:scale-105"
                  >
                    ចុះឈ្មោះ
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(!mobileMenuOpen);
                  setActiveDropdown(null);
                  setShowSearch(false);
                }}
                className="lg:hidden text-gray-200 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-[90vh] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-[#0a0a0a] border-t border-white/10 px-6 py-6 space-y-1 overflow-y-auto max-h-[80vh]">
            {/* Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ស្វែងរកភាពយន្ត រឿងភាគ..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-base text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
              </div>
            </form>

            <Link
              to="/"
              className="flex items-center gap-3 text-gray-200 hover:text-white text-lg font-medium px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="text-xl">🏠</span>
              ទំព័រដើម
            </Link>

            <Link
              to="/movies"
              className="flex items-center gap-3 text-gray-200 hover:text-white text-lg font-medium px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Film size={20} />
              រឿងដុំ
            </Link>

            <Link
              to="/series"
              className="flex items-center gap-3 text-gray-200 hover:text-white text-lg font-medium px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Tv size={20} />
              រឿងភាគ
            </Link>

            {/* Series Types (dynamic) */}
            <div className="pl-8 space-y-1">
              {seriesTypes.map((type) => (
                <Link
                  key={type.id}
                  to={`/series/type/${type.slug}`}
                  className="flex items-center gap-3 text-gray-400 hover:text-white text-base px-4 py-2 rounded-xl hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {type.flag && <span className="text-lg">{type.flag}</span>}
                  {type.name}
                </Link>
              ))}
            </div>

            {/* Genres (dynamic) */}
            <div className="pt-2">
              <p className="text-gray-500 text-sm font-semibold px-4 py-2 uppercase tracking-wider">ប្រភេទ</p>
              {genres.map((genre) => (
                <Link
                  key={genre.id}
                  to={`/genre/${genre.slug}`}
                  className="flex items-center gap-3 text-gray-400 hover:text-white text-base px-4 py-2 rounded-xl hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Tag size={16} />
                  {genre.name}
                </Link>
              ))}
            </div>

            {/* Countries (dynamic) */}
            <div className="pt-2">
              <p className="text-gray-500 text-sm font-semibold px-4 py-2 uppercase tracking-wider">ប្រទេស</p>
              {countries.map((country) => (
                <Link
                  key={country.id}
                  to={`/country/${country.slug}`}
                  className="flex items-center gap-3 text-gray-400 hover:text-white text-base px-4 py-2 rounded-xl hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {country.flag && <span className="text-lg">{country.flag}</span>}
                  {country.name}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 my-4"></div>

            {/* User Actions */}
            {user ? (
              <>
                <div className="px-4 py-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.username}</p>
                    <div className="flex gap-2 mt-1">
                      {isVIP && <span className="text-amber-400 text-xs">★ VIP</span>}
                      {isAdmin && <span className="text-purple-400 text-xs">⚙️ Admin</span>}
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 text-gray-200 hover:text-white text-lg font-medium px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield size={20} className="text-purple-400" />
                    គ្រប់គ្រង (Admin)
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full text-left text-red-400 hover:text-red-300 text-lg font-medium px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={20} />
                  ចាកចេញ
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-3 text-gray-200 hover:text-white text-lg font-medium px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={20} />
                  ចូលគណនី
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-3 bg-[#E50914] hover:bg-[#f6121d] text-white text-lg font-semibold px-4 py-3 rounded-xl transition-colors justify-center mt-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ចុះឈ្មោះ
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}