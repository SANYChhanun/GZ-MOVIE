// src/components/movie/PurchaseCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function PurchaseCard({ movie, onClose, onSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wallet'); // 'wallet' | 'khqr'
  
  const walletBalance = user?.wallet_balance || 0;
  const purchasePrice = Number(movie?.purchase_price || 0);
  const hasEnoughBalance = walletBalance >= purchasePrice;
  
  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    
    // TODO: ហៅ API ពិតប្រាកដនៅពេលក្រោយ
    // សម្រាប់ពេលនេះ គ្រាន់តែក្លែងធ្វើ
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);
    }, 1500);
  };
  
  const handleTopUp = () => {
    if (onClose) onClose();
    navigate('/wallet');
  };
  
  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="bi bi-check-circle-fill text-4xl text-emerald-400"></i>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">ទិញបានជោគជ័យ!</h2>
          <p className="text-gray-400 mb-4">អ្នកអាចមើលរឿងនេះបានឥឡូវនេះ</p>
          <button
            onClick={onSuccess}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            ចាប់ផ្តើមមើល
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <i className="bi bi-cart-check text-blue-400"></i>
            ទិញរឿងនេះ
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        
        {/* Movie Info */}
        <div className="flex gap-4 p-4 border-b border-gray-800">
          <div className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0">
            {movie?.poster_url || movie?.poster ? (
              <img 
                src={movie.poster_url || movie.poster} 
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <i className="bi bi-film text-2xl text-gray-600"></i>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">{movie?.title}</h3>
            {movie?.year && <p className="text-gray-500 text-sm mb-2">{movie.year}</p>}
            {movie?.genres?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {movie.genres.slice(0, 3).map((genre, i) => (
                  <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                    {typeof genre === 'string' ? genre : genre.name}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">រយៈពេលចូលប្រើ៖</span>
              <span className="text-white font-medium">30 ថ្ងៃ</span>
            </div>
          </div>
        </div>
        
        {/* Price Summary */}
        <div className="p-4 border-b border-gray-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">តម្លៃ</span>
            <span className="text-white font-bold text-lg">${purchasePrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm flex items-center gap-1">
              <i className="bi bi-wallet2"></i>
              សមតុល្យរបស់អ្នក
            </span>
            <span className={`font-bold ${hasEnoughBalance ? 'text-emerald-400' : 'text-red-400'}`}>
              ${walletBalance.toFixed(2)}
            </span>
          </div>
          {!hasEnoughBalance && (
            <div className="flex items-start gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
              <i className="bi bi-exclamation-triangle-fill mt-0.5"></i>
              <span>សមតុល្យមិនគ្រប់គ្រាន់សម្រាប់ការទិញ</span>
            </div>
          )}
        </div>
        
        {/* Payment Method */}
        <div className="p-4 border-b border-gray-800">
          <label className="block text-sm text-gray-400 mb-2">វិធីទូទាត់</label>
          <div className="space-y-2">
            {/* Wallet */}
            <button
              onClick={() => setPaymentMethod('wallet')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                paymentMethod === 'wallet'
                  ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              <i className="bi bi-wallet2 text-xl"></i>
              <div className="flex-1 text-left">
                <p className="font-medium">Wallet</p>
                <p className="text-xs text-gray-500">ប្រើសមតុល្យក្នុងគណនី</p>
              </div>
              {paymentMethod === 'wallet' && <i className="bi bi-check-circle-fill"></i>}
            </button>
            
            {/* KHQR */}
            <button
              onClick={() => setPaymentMethod('khqr')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                paymentMethod === 'khqr'
                  ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              <i className="bi bi-qr-code text-xl"></i>
              <div className="flex-1 text-left">
                <p className="font-medium">KHQR / Bakong</p>
                <p className="text-xs text-gray-500">ស្កេន QR ដើម្បីទូទាត់</p>
              </div>
              {paymentMethod === 'khqr' && <i className="bi bi-check-circle-fill"></i>}
            </button>
          </div>
        </div>
        
        {/* Error */}
        {error && (
          <div className="mx-4 mt-4 flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <i className="bi bi-exclamation-triangle-fill mt-0.5"></i>
            <span>{error}</span>
          </div>
        )}
        
        {/* Actions */}
        <div className="p-4 space-y-3">
          {hasEnoughBalance ? (
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="bi bi-hourglass-split animate-spin"></i>
                  កំពុងដំណើរការ...
                </>
              ) : (
                <>
                  <i className="bi bi-cart-check"></i>
                  បញ្ជាក់ការទិញ
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleTopUp}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <i className="bi bi-plus-circle"></i>
              បញ្ចូលលុយបន្ថែម
            </button>
          )}
          
          <button
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-colors"
          >
            បោះបង់
          </button>
        </div>
      </div>
    </div>
  );
}