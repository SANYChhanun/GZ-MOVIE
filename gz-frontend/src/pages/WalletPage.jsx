// src/pages/WalletPage.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function WalletPage() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const walletBalance = user?.wallet_balance || 0;
  const predefinedAmounts = [5, 10, 20, 50, 100];
  
  const handleTopUp = () => {
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      setShowQR(true);
    }, 1000);
  };
  
  return (
    <div className="min-h-screen bg-[#141414] font-khmer">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <i className="bi bi-wallet2 text-blue-400"></i>
          Wallet
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6">
              <p className="text-blue-200 text-sm mb-2">សមតុល្យបច្ចុប្បន្ន</p>
              <p className="text-4xl font-black text-white">${walletBalance.toFixed(2)}</p>
            </div>
            
            {/* Top-up */}
            <div className="bg-[#1f1f1f] rounded-2xl p-6 border border-gray-800">
              <h2 className="text-lg font-bold text-white mb-4">បញ្ចូលលុយ</h2>
              
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                {predefinedAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(String(amt))}
                    className={`py-3 rounded-xl border font-bold transition-colors ${
                      amount === String(amt)
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">ចំនួនផ្សេងទៀត</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="បញ្ចូលចំនួន"
                    className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <button
                onClick={handleTopUp}
                disabled={loading || !amount || Number(amount) <= 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="bi bi-hourglass-split animate-spin"></i>
                    កំពុងដំណើរការ...
                  </>
                ) : (
                  <>
                    <i className="bi bi-qr-code"></i>
                    បង្កើត QR សម្រាប់ទូទាត់
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Transaction History */}
          <div className="space-y-6">
            <div className="bg-[#1f1f1f] rounded-2xl p-6 border border-gray-800">
              <h2 className="text-lg font-bold text-white mb-4">ប្រតិបត្តិការថ្មីៗ</h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <i className="bi bi-arrow-down-left text-emerald-400"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">បញ្ចូលលុយ</p>
                    <p className="text-gray-500 text-xs">ម្សិលមិញ</p>
                  </div>
                  <span className="text-emerald-400 font-bold">+$10.00</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                    <i className="bi bi-arrow-up-right text-red-400"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">ទិញរឿង</p>
                    <p className="text-gray-500 text-xs">3 ថ្ងៃមុន</p>
                  </div>
                  <span className="text-red-400 font-bold">-$2.99</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">ស្កេន QR ដើម្បីទូទាត់</h3>
            <p className="text-gray-600 text-sm mb-4">ចំនួន៖ ${amount}</p>
            
            <div className="w-48 h-48 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <i className="bi bi-qr-code text-6xl text-gray-400"></i>
            </div>
            
            <p className="text-gray-500 text-xs mb-4">
              ប្រើ KHQR / Bakong ដើម្បីស្កេន QR នេះ
            </p>
            
            <button
              onClick={() => setShowQR(false)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition-colors"
            >
              បិទ
            </button>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}