// src/pages/HomePage.jsx - User Homepage (Clean & Modern)
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

export default function HomePage() {
  const { user, isVIP } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome back, {user?.username}!
              </h1>
              <p className="text-gray-400 text-lg">
                Discover new movies and continue watching your favorites.
              </p>
              
              {isVIP && (
                <span className="inline-flex items-center gap-1 mt-3 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm border border-yellow-500/50">
                  <i className="bi bi-star-fill"></i>
                  VIP Member
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 hover:border-gray-600 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <i className="bi bi-collection-play text-blue-400 text-lg"></i>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Available Movies</p>
                <p className="text-white font-bold text-lg">1,200+</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 hover:border-gray-600 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <i className="bi bi-play-circle text-green-400 text-lg"></i>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Continue Watching</p>
                <p className="text-white font-bold text-lg">3 Movies</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 hover:border-gray-600 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <i className="bi bi-clock-history text-purple-400 text-lg"></i>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Watch History</p>
                <p className="text-white font-bold text-lg">12 Movies</p>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <i className="bi bi-fire text-red-500"></i>
              Trending Now
            </h2>
            <Link to="/movies" className="text-red-500 hover:text-red-400 text-sm flex items-center gap-1">
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-800 rounded-lg overflow-hidden group cursor-pointer hover:scale-105 transition-transform">
                <div className="aspect-[2/3] bg-gray-700 flex items-center justify-center">
                  <i className="bi bi-film text-4xl text-gray-600 group-hover:text-red-500 transition"></i>
                </div>
                <div className="p-2">
                  <p className="text-white text-sm font-medium truncate">Movie Title {i}</p>
                  <p className="text-gray-500 text-xs">2024 • Action</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <i className="bi bi-grid-fill text-blue-400"></i>
            Browse by Category
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Action', icon: 'bi-fire', color: 'red' },
              { name: 'Comedy', icon: 'bi-emoji-laughing', color: 'yellow' },
              { name: 'Drama', icon: 'bi-heart', color: 'pink' },
              { name: 'Horror', icon: 'bi-ghost', color: 'purple' },
              { name: 'Sci-Fi', icon: 'bi-rocket', color: 'blue' },
              { name: 'Romance', icon: 'bi-heart-fill', color: 'rose' },
              { name: 'Documentary', icon: 'bi-camera-video', color: 'green' },
              { name: 'Animation', icon: 'bi-stars', color: 'orange' },
            ].map((cat) => (
              <Link
                key={cat.name}
                to={`/movies?category=${cat.name}`}
                className={`bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-${cat.color}-500/50 hover:bg-gray-750 transition flex items-center gap-3`}
              >
                <i className={`bi ${cat.icon} text-${cat.color}-400 text-xl`}></i>
                <span className="text-white font-medium">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* VIP Banner (បង្ហាញតែពេលមិនមែន VIP) */}
        {!isVIP && (
          <section className="mb-10">
            <div className="bg-gradient-to-r from-yellow-900/50 to-yellow-800/30 border border-yellow-700/50 rounded-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <i className="bi bi-star-fill text-3xl text-yellow-400"></i>
                  <div>
                    <h2 className="text-xl font-bold text-white">Upgrade to VIP</h2>
                    <p className="text-gray-300 text-sm">Get unlimited access to premium movies, early releases, and exclusive content.</p>
                  </div>
                </div>
                <Link
                  to="/pricing"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-lg transition whitespace-nowrap flex items-center gap-2"
                >
                  <i className="bi bi-gem"></i>
                  Upgrade Now
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Recent Activity */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <i className="bi bi-clock-history text-green-400"></i>
            Recent Activity
          </h2>
          
          <div className="bg-gray-800 rounded-xl border border-gray-700 divide-y divide-gray-700">
            {[
              { action: 'Watched', movie: 'The Dark Knight', time: '2 hours ago', icon: 'bi-play-circle-fill', color: 'text-green-400' },
              { action: 'Added to Watchlist', movie: 'Inception', time: 'Yesterday', icon: 'bi-bookmark-plus', color: 'text-blue-400' },
              { action: 'Rated', movie: 'Interstellar', time: '3 days ago', icon: 'bi-star-fill', color: 'text-yellow-400' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <i className={`bi ${activity.icon} ${activity.color} text-lg`}></i>
                <div className="flex-1">
                  <p className="text-white text-sm">
                    <span className="font-medium">{activity.action}</span> {activity.movie}
                  </p>
                  <p className="text-gray-500 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>&copy; 2024 GZ Movie. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}