// src/components/Header.jsx — Full Code with Glowing Logo
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, isAdmin, isVIP, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-[#141414] shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
    }`}>
      <div className="container mx-auto px-4 md:px-16 h-20 md:h-24 flex justify-between items-center">
        
        {/* Logo - ធំជាងមុន ភ្លឺច្បាស់ ជាមួយបែបផែនពន្លឺ */}
        <Link to="/" className="flex items-center flex-shrink-0 group">
          <div className="relative">
            {/* Glow Effect */}
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

        {/* Navigation - អក្សរធំជាងមុន */}
        <nav className="hidden md:flex items-center gap-3 mx-4">
          <Link 
            to="/" 
            className="text-gray-200 hover:text-white text-lg md:text-xl font-medium px-4 py-2 rounded-lg transition-colors hover:bg-white/10"
          >
            ទំព័រដើម
          </Link>
          <Link 
            to="/movies" 
            className="text-gray-200 hover:text-white text-lg md:text-xl font-medium px-4 py-2 rounded-lg transition-colors hover:bg-white/10"
          >
            ភាពយន្ត
          </Link>
          <Link 
            to="/pricing" 
            className="text-gray-200 hover:text-white text-lg md:text-xl font-medium px-4 py-2 rounded-lg transition-colors hover:bg-white/10"
          >
            តម្លៃ
          </Link>
        </nav>

        {/* User Actions - អក្សរធំជាងមុន */}
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
                <Link 
                  to="/admin" 
                  className="hidden md:flex items-center gap-1.5 text-gray-200 hover:text-white text-lg font-medium px-3 py-2 rounded-lg transition-colors hover:bg-white/10"
                  title="គ្រប់គ្រង"
                >
                  <i className="bi bi-gear text-xl"></i>
                  <span>គ្រប់គ្រង</span>
                </Link>
              )}

              {/* Logout */}
              <button 
                onClick={handleLogout} 
                className="text-gray-200 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                title="ចាកចេញ"
              >
                <i className="bi bi-box-arrow-right text-2xl"></i>
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <Link 
                to="/login" 
                className="text-gray-100 hover:text-white text-lg md:text-xl font-medium px-5 py-2.5 rounded-lg transition-colors hover:bg-white/10"
              >
                ចូលគណនី
              </Link>
              
              {/* Signup */}
              <Link 
                to="/signup" 
                className="bg-[#E50914] hover:bg-[#f6121d] text-white text-lg md:text-xl font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg hover:shadow-red-500/50"
              >
                ចុះឈ្មោះ
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}