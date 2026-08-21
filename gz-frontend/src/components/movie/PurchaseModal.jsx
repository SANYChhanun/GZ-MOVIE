// src/components/movie/PurchaseModal.jsx
import { useState } from 'react';
import moviesApi from '../../api/moviesApi';

export default function PurchaseModal({ movie, onClose, onSuccess }) {
  const [step, setStep] = useState('confirm');
  
  const purchasePrice = Number(movie?.purchase_price || 0);
  
  const handleShowQR = () => {
    setStep('qr');
  };
  
const handlePaymentDone = async () => {
  setStep('processing');
  try {
    await moviesApi.purchaseMovie(movie.id);
    setStep('success');
    setTimeout(() => {
      if (onSuccess) onSuccess();
    }, 1000);
  } catch (err) {
    console.error('Purchase failed:', err);
    // ✅ បើ error គឺ "already has access" ចាត់ទុកជាជោគជ័យ
    if (err.response?.status === 400 && err.response?.data?.purchase) {
      setStep('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1000);
      return;
    }
    const msg = err.response?.data?.error || 'ការទូទាត់មិនជោគជ័យ សូមព្យាយាមម្ដងទៀត';
    alert(msg);
    setStep('qr');
  }
};
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
        
        {/* ============ STEP 1: បញ្ជាក់ការទិញ ============ */}
        {step === 'confirm' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="bi bi-cart-check text-blue-400"></i>
                ទិញរឿងនេះ
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className="flex gap-4 p-4 border-b border-gray-800">
              <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                {movie?.poster_url || movie?.poster ? (
                  <img src={movie.poster_url || movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <i className="bi bi-film text-2xl text-gray-600"></i>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">{movie?.title}</h3>
                <p className="text-gray-500 text-sm mt-1">ចូលប្រើបាន 30 ថ្ងៃ</p>
                <p className="text-white font-bold text-xl mt-2">${purchasePrice.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <button
                onClick={handleShowQR}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <i className="bi bi-qr-code"></i>
                ទូទាត់ជាមួយ KHQR / Bakong
              </button>
              
              <button
                onClick={onClose}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-colors"
              >
                បោះបង់
              </button>
            </div>
          </>
        )}
        
        {/* ============ STEP 2: បង្ហាញ QR ============ */}
        {step === 'qr' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="bi bi-qr-code text-amber-400"></i>
                ស្កេន QR ដើម្បីទូទាត់
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className="p-6 text-center">
              <p className="text-gray-400 text-sm mb-2">
                ចំនួនដែលត្រូវទូទាត់
              </p>
              <p className="text-white font-bold text-2xl mb-4">${purchasePrice.toFixed(2)}</p>
              
              {/* QR Code Placeholder - TODO: ជំនួសដោយ QR ពិតពី KHQR API */}
              <div className="w-56 h-56 bg-white rounded-xl mx-auto mb-4 flex flex-col items-center justify-center border-4 border-gray-300">
                <i className="bi bi-qr-code text-7xl text-gray-800"></i>
                <p className="text-xs text-gray-500 mt-2 font-bold">KHQR / Bakong</p>
              </div>
              
              {/* ជំហាន */}
              <div className="text-left space-y-2 mb-4 bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">1</span>
                  បើក KHQR ឬ Bakong App
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">2</span>
                  ស្កេន QR ខាងលើ
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">3</span>
                  បញ្ជាក់ការទូទាត់
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">4</span>
                  ចុច "ខ្ញុំបានទូទាត់រួច"
                </div>
              </div>
              
              <button
                onClick={handlePaymentDone}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <i className="bi bi-check-circle"></i>
                ខ្ញុំបានទូទាត់រួចហើយ
              </button>
              
              <button
                onClick={() => setStep('confirm')}
                className="w-full mt-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 rounded-xl transition-colors"
              >
                ត្រឡប់ក្រោយ
              </button>
            </div>
          </>
        )}
        
        {/* ============ STEP 3: កំពុងដំណើរការ ============ */}
        {step === 'processing' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-white font-bold mb-2">កំពុងផ្ទៀងផ្ទាត់ការទូទាត់...</h3>
            <p className="text-gray-400 text-sm">សូមរង់ចាំមួយភ្លែត</p>
          </div>
        )}
        
        {/* ============ STEP 4: ជោគជ័យ ============ */}
        {step === 'success' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="bi bi-check-circle-fill text-4xl text-emerald-400"></i>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">ទិញបានជោគជ័យ!</h2>
            <p className="text-gray-400 mb-4">អ្នកអាចមើលរឿងនេះបានឥឡូវនេះ</p>
          </div>
        )}
      </div>
    </div>
  );
}