import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login({ username, password });
    if (success) {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-black/75 p-16 rounded-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-8">Sign In</h1>
        
        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username or Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-4 mb-4 bg-gray-700 text-white rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 mb-8 bg-gray-700 text-white rounded"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-red-600 text-white rounded font-bold hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p className="text-gray-400 mt-4">
          New to GZ Movie?{' '}
          <Link to="/signup" className="text-white hover:underline">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
