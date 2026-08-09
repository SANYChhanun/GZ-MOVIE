// src/components/Header.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, isAdmin, isVIP, logout } = useAuth();

  return (
    <header className="bg-gray-800 shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-red-600 flex items-center gap-2">
          🎬 GZ Movie
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link to="/movies" className="text-gray-300 hover:text-white flex items-center gap-1">
            🎥 Movies
          </Link>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isVIP && (
                  <span className="bg-yellow-500 text-black px-2 py-0.5 rounded-full text-xs font-bold">
                    ⭐ VIP
                  </span>
                )}
                {isAdmin && (
                  <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                    🛡️ Admin
                  </span>
                )}
                {!isAdmin && !isVIP && (
                  <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                    👤 User
                  </span>
                )}
                
                <Link to="/profile" className="text-gray-300 hover:text-white">
                  {user.username}
                </Link>
              </div>
              
              {isAdmin && (
                <Link to="/admin" className="text-purple-400 hover:text-purple-300 text-sm">
                  📊 Dashboard
                </Link>
              )}
              
              <button
                onClick={logout}
                className="text-gray-400 hover:text-white text-sm"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}