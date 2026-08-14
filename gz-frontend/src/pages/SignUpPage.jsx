// src/pages/SignUpPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SignUpPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (password !== passwordConfirm) {
      setLocalError('ពាក្យសម្ងាត់មិនត្រូវគ្នា!');
      return;
    }
    
    setIsSubmitting(true);
    
    const result = await register({
      username,
      email,
      phone,
      password,
      password_confirm: passwordConfirm
    });
    
    setIsSubmitting(false);
    
    if (result.success) {
      navigate('/');
    } else {
      setLocalError(result.error || 'ការចុះឈ្មោះបរាជ័យ');
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
          <h1 className="text-2xl font-bold text-white">ចុះឈ្មោះ</h1>
          <p className="text-gray-400 text-sm mt-1">បង្កើតគណនីថ្មីរបស់អ្នក</p>
        </div>

        {/* Error Message */}
        {localError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
            <i className="bi bi-exclamation-triangle-fill"></i>
            {localError}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="បញ្ចូលឈ្មោះ"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm flex items-center gap-2">
              <i className="bi bi-envelope"></i>
              អ៊ីមែល
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-red-500 focus:outline-none transition"
              placeholder="បញ្ចូលអ៊ីមែល"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm flex items-center gap-2">
              <i className="bi bi-phone"></i>
              លេខទូរស័ព្ទ
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-red-500 focus:outline-none transition"
              placeholder="បញ្ចូលលេខទូរស័ព្ទ (មិនចាំបាច់)"
            />
          </div>

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

          <div>
            <label className="block text-gray-300 mb-2 text-sm flex items-center gap-2">
              <i className="bi bi-lock-fill"></i>
              បញ្ជាក់ពាក្យសម្ងាត់
            </label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-red-500 focus:outline-none transition"
              placeholder="បញ្ចូលពាក្យសម្ងាត់ម្តងទៀត"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {isSubmitting ? (
              <>
                <i className="bi bi-hourglass-split animate-spin"></i>
                កំពុងបង្កើតគណនី...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus"></i>
                ចុះឈ្មោះ
              </>
            )}
          </button>
        </form>

        <p className="text-gray-400 text-center text-sm mt-6">
          មានគណនីរួចហើយ?{' '}
          <Link to="/login" className="text-red-500 hover:text-red-400 font-bold">
            ចូលគណនី
          </Link>
        </p>
      </div>
    </div>
  );
}   