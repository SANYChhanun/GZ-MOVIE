import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="p-4 flex justify-between items-center bg-black">
        <h1 className="text-2xl font-bold text-red-600">GZ MOVIE</h1>
        <div className="flex items-center space-x-4">
          <span>{user?.email}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold mb-8">Welcome back!</h2>
        <div className="grid grid-cols-4 gap-4">
          {/* Movie cards will go here in future phases */}
          <div className="bg-gray-800 p-4 rounded">
            <div className="bg-gray-700 h-48 rounded mb-2"></div>
            <h3 className="font-bold">Movie Title</h3>
            <p className="text-gray-400 text-sm">Coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
