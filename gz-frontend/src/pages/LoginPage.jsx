// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsSubmitting(true);

    const result = await login(username, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setLocalError(result.error || 'ការចូលគណនីបរាជ័យ');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 font-khmer">
      <div className="bg-[#1F1F1F] p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-800">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="bi bi-film text-3xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold text-white">GZ Movie</h1>
          <p className="text-gray-400 text-sm mt-1">ចូលគណនីរបស់អ្នក</p>
        </div>

        {/* Error Message */}
        {localError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
            <i className="bi bi-exclamation-triangle-fill"></i>
            {localError}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-gray-300 mb-2 text-sm flex items-center gap-2">
              <i className="bi bi-person"></i>
              ឈ្មោះអ្នកប្រើប្រាស់
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-red-500 focus:outline-none transition"
              placeholder="បញ្ចូលឈ្មោះអ្នកប្រើប្រាស់"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-300 mb-2 text-sm flex items-center gap-2">
              <i className="bi bi-lock"></i>
              ពាក្យសម្ងាត់
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-red-500 focus:outline-none transition"
              placeholder="បញ្ចូលពាក្យសម្ងាត់"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <i className="bi bi-hourglass-split animate-spin"></i>
                កំពុងចូលគណនី...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i>
                ចូលគណនី
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 border-t border-gray-700"></div>
          <span className="text-gray-500 text-sm">ឬ</span>
          <div className="flex-1 border-t border-gray-700"></div>
        </div>

        {/* Register Link */}
        <p className="text-gray-400 text-center text-sm">
          មិនទាន់មានគណនីទេ?{' '}
          <Link to="/signup" className="text-red-500 hover:text-red-400 font-bold">
            ចុះឈ្មោះឥឡូវនេះ
          </Link>
        </p>
      </div>
    </div>
  );
}