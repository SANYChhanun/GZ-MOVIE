// src/pages/SignUpPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
  });
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    // ពិនិត្យ password និង confirm password
    if (formData.password !== formData.passwordConfirm) {
      setLocalError('ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ!');
      return;
    }
    
    // ពិនិត្យប្រវែង password
    if (formData.password.length < 6) {
      setLocalError('ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ 6 តួអក្សរ');
      return;
    }
    
    setIsSubmitting(true);
    
    const result = await register({
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      password_confirm: formData.passwordConfirm
    });
    
    setIsSubmitting(false);
    
    if (result.success) {
      navigate('/');
    } else {
      setLocalError(result.error || 'ការចុះឈ្មោះបរាជ័យ');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="bg-[#1F1F1F] p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-800">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="bi bi-film text-3xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold text-white">បង្កើតគណនី</h1>
          <p className="text-gray-400 text-sm mt-1">ចុះឈ្មោះដើម្បីចាប់ផ្តើមមើលភាពយន្ត</p>
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
          {/* Username */}
          <div>
            <label className="block text-gray-300 mb-2 text-sm flex items-center gap-2">
              <i className="bi bi-person"></i>
              ឈ្មោះអ្នកប្រើប្រាស់
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-red-500 focus:outline-none transition"
              placeholder="បញ្ចូលឈ្មោះអ្នកប្រើប្រាស់"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-300 mb-2 text-sm flex items-center gap-2">
              <i className="bi bi-envelope"></i>
              អ៊ីមែល
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-red-500 focus:outline-none transition"
              placeholder="បញ្ចូលអ៊ីមែល"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-300 mb-2 text-sm flex items-center gap-2">
              <i className="bi bi-phone"></i>
              លេខទូរស័ព្ទ
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-red-500 focus:outline-none transition"
              placeholder="បញ្ចូលលេខទូរស័ព្ទ (ជម្រើស)"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-300 mb-2 text-sm flex items-center gap-2">
              <i className="bi bi-lock"></i>
              ពាក្យសម្ងាត់
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-red-500 focus:outline-none transition pr-12"
                placeholder="បញ្ចូលពាក្យសម្ងាត់"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-300 mb-2 text-sm flex items-center gap-2">
              <i className="bi bi-lock-fill"></i>
              បញ្ជាក់ពាក្យសម្ងាត់
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-red-500 focus:outline-none transition pr-12"
                placeholder="បញ្ចូលពាក្យសម្ងាត់ម្តងទៀត"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {isSubmitting ? (
              <>
                <i className="bi bi-hourglass-split animate-spin"></i>
                កំពុងចុះឈ្មោះ...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus"></i>
                ចុះឈ្មោះ
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-gray-400 text-center text-sm mt-6">
          មានគណនីរួចហើយ?{' '}
          <Link to="/login" className="text-red-500 hover:text-red-400 font-bold">
            ចូលប្រើប្រាស់
          </Link>
        </p>
      </div>
    </div>
  );
}