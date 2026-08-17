// src/components/Header.jsx — Full Code with Mobile Hamburger Menu
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GenreDropdown from './common/GenreDropdown';

export default function Header() {
  const { user, isAdmin, isVIP, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // ← NEW

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-[#141414] shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
    }`}>
      <div className="container mx-auto px-4 md:px-16 h-20 md:h-24 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0 group">
          <div className="relative">
            <div className="absolute -inset-2 bg-red-500/20 rounded-full blur-xl group-hover:bg-red-500/40 transition-all duration-300"></div>
            
            {!logoError ? (
              <img 
                src="/images/logoGz.png" 
                alt="GZ Movie" 
                className="relative h-14 md:h-20 w-auto object-contain drop-shadow-2xl group-hover:scale-105 transition-all duration-300"
                onError={() => setLogoError(true)}
                style={{
                  filter: 'brightness(1.2) contrast(1.1) drop-shadow(0 0 10px rgba(229, 9, 20, 0.6))'
                }}
              />
            ) : (
              <span className="relative text-3xl md:text-4xl font-black tracking-wider">
                <span className="text-[#E50914] drop-shadow-lg">GZ</span>
                <span className="text-white">MOVIE</span>
              </span>
            )}
          </div>
        </Link>

        {/* ===== DESKTOP NAVIGATION ===== */}
        <nav className="hidden md:flex items-center gap-1 mx-4">
          <Link to="/" className="text-gray-200 hover:text-white text-lg md:text-xl font-medium px-4 py-2 rounded-lg transition-colors hover:bg-white/10">
            ទំព័រដើម
          </Link>
          <Link to="/movies" className="text-gray-200 hover:text-white text-lg md:text-xl font-medium px-4 py-2 rounded-lg transition-colors hover:bg-white/10">
            ភាពយន្ត
          </Link>
          <GenreDropdown />
          <Link to="/pricing" className="text-gray-200 hover:text-white text-lg md:text-xl font-medium px-4 py-2 rounded-lg transition-colors hover:bg-white/10">
            តម្លៃ
          </Link>
        </nav>

        {/* ===== RIGHT SIDE ===== */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {user ? (
            <>
              {/* VIP Badge */}
              {isVIP && (
                <span className="hidden md:inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm font-semibold">
                  <i className="bi bi-star-fill text-xs"></i>
                  VIP
                </span>
              )}
              
              {/* Admin Badge */}
              {isAdmin && (
                <span className="hidden md:inline-flex items-center gap-1.5 bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-semibold">
                  <i className="bi bi-shield-fill-check text-xs"></i>
                  Admin
                </span>
              )}

              {/* Username */}
              <span className="hidden lg:block text-gray-100 text-lg font-medium">{user.username}</span>

              {/* Admin Link */}
              {isAdmin && (
                <Link to="/admin" className="hidden md:flex items-center gap-1.5 text-gray-200 hover:text-white text-lg font-medium px-3 py-2 rounded-lg transition-colors hover:bg-white/10" title="គ្រប់គ្រង">
                  <i className="bi bi-gear text-xl"></i>
                  <span>គ្រប់គ្រង</span>
                </Link>
              )}

              {/* Logout */}
              <button onClick={handleLogout} className="text-gray-200 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10" title="ចាកចេញ">
                <i className="bi bi-box-arrow-right text-2xl"></i>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-100 hover:text-white text-lg md:text-xl font-medium px-5 py-2.5 rounded-lg transition-colors hover:bg-white/10">
                ចូលគណនី
              </Link>
              <Link to="/signup" className="bg-[#E50914] hover:bg-[#f6121d] text-white text-lg md:text-xl font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg hover:shadow-red-500/50">
                ចុះឈ្មោះ
              </Link>
            </>
          )}

          {/* ===== MOBILE HAMBURGER BUTTON ===== */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-200 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'} text-3xl`}></i>
          </button>
        </div>
      </div>

      {/* ===== MOBILE MENU DROPDOWN ===== */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        mobileMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-[#141414] border-t border-white/10 px-4 py-6 space-y-2 overflow-y-auto max-h-[70vh]">
          {/* Mobile Navigation Links */}
          <Link to="/" className="block text-gray-200 hover:text-white text-xl font-medium px-4 py-3 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMobileMenuOpen(false)}>
            <i className="bi bi-house mr-3"></i>
            ទំព័រដើម
          </Link>
          <Link to="/movies" className="block text-gray-200 hover:text-white text-xl font-medium px-4 py-3 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMobileMenuOpen(false)}>
            <i className="bi bi-collection-play mr-3"></i>
            ភាពយន្ត
          </Link>
          
          {/* Mobile Genre Dropdown (inline) */}
          <div className="px-4 py-2">
            <GenreDropdown mobile />
          </div>
          
          <Link to="/pricing" className="block text-gray-200 hover:text-white text-xl font-medium px-4 py-3 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMobileMenuOpen(false)}>
            <i className="bi bi-tags mr-3"></i>
            តម្លៃ
          </Link>

          {/* Divider */}
          <div className="border-t border-white/10 my-4"></div>

          {/* Mobile User Actions */}
          {user ? (
            <>
              <div className="px-4 py-2 text-gray-400 text-sm">
                <i className="bi bi-person mr-2"></i>
                {user.username}
                {isVIP && <span className="ml-2 text-amber-400">★ VIP</span>}
                {isAdmin && <span className="ml-2 text-purple-400">⚙️ Admin</span>}
              </div>
              {isAdmin && (
                <Link to="/admin" className="block text-gray-200 hover:text-white text-xl font-medium px-4 py-3 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  <i className="bi bi-gear mr-3"></i>
                  គ្រប់គ្រង
                </Link>
              )}
              <button onClick={handleLogout} className="w-full text-left text-gray-200 hover:text-white text-xl font-medium px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                <i className="bi bi-box-arrow-right mr-3"></i>
                ចាកចេញ
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-gray-200 hover:text-white text-xl font-medium px-4 py-3 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <i className="bi bi-box-arrow-in-right mr-3"></i>
                ចូលគណនី
              </Link>
              <Link to="/signup" className="block bg-[#E50914] hover:bg-[#f6121d] text-white text-xl font-semibold px-4 py-3 rounded-lg transition-colors text-center" onClick={() => setMobileMenuOpen(false)}>
                <i className="bi bi-person-plus mr-3"></i>
                ចុះឈ្មោះ
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}