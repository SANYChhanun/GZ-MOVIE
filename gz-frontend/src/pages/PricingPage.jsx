// src/pages/PricingPage.jsx
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

const PLANS = [
  {
    id: 1,
    name: '14 ថ្ងៃ',
    price: '$2.99',
    duration: '14 ថ្ងៃ',
    icon: 'bi-gem',
    color: 'blue',
    popular: false,
    features: [
      'មើលភាពយន្ត VIP ទាំងអស់',
      'គុណភាព HD',
      'មើលបាន 2 ឧបករណ៍',
      'គ្មានការផ្សាយពាណិជ្ជកម្ម',
    ],
  },
  {
    id: 2,
    name: '30 ថ្ងៃ',
    price: '$5.99',
    duration: '30 ថ្ងៃ',
    icon: 'bi-star-fill',
    color: 'yellow',
    popular: true,
    features: [
      'មើលភាពយន្ត VIP ទាំងអស់',
      'គុណភាព Full HD',
      'មើលបាន 3 ឧបករណ៍',
      'គ្មានការផ្សាយពាណិជ្ជកម្ម',
      'ទាញយកទុកមើលក្រៅបណ្តាញ',
    ],
  },
  {
    id: 3,
    name: '90 ថ្ងៃ',
    price: '$12.99',
    duration: '90 ថ្ងៃ',
    icon: 'bi-trophy-fill',
    color: 'purple',
    popular: false,
    features: [
      'មើលភាពយន្ត VIP ទាំងអស់',
      'គុណភាព 4K Ultra HD',
      'មើលបាន 5 ឧបករណ៍',
      'គ្មានការផ្សាយពាណិជ្ជកម្ម',
      'ទាញយកទុកមើលក្រៅបណ្តាញ',
      'មើលមុនគេសម្រាប់រឿងថ្មី',
    ],
  },
];

const FAQS = [
  { q: 'តើខ្ញុំអាចបោះបង់ VIP នៅពេលណាក៏បានទេ?', a: 'បាទ! អ្នកអាចបោះបង់បានគ្រប់ពេល។ សមាជិកភាពនឹងបន្តដំណើរការរហូតដល់ថ្ងៃផុតកំណត់។' },
  { q: 'តើមានរឿងឥតគិតថ្លៃដែរទេ?', a: 'បាទ! យើងមានភាពយន្តឥតគិតថ្លៃជាច្រើនដែលអ្នកអាចមើលបានដោយមិនចាំបាច់មាន VIP។' },
  { q: 'តើខ្ញុំអាចបង់ប្រាក់តាមរបៀបណា?', a: 'យើងគាំទ្រការបង់ប្រាក់តាម ABA Pay, KHQR, និងកាបូបលុយក្នុងប្រព័ន្ធ។' },
  { q: 'តើខ្ញុំអាចមើលលើឧបករណ៍ប៉ុន្មាន?', a: 'អាស្រ័យលើកញ្ចប់ដែលអ្នកជ្រើសរើស អាចមើលបានពី 2 ទៅ 5 ឧបករណ៍ក្នុងពេលតែមួយ។' },
];

export default function PricingPage() {
  const { user, isVIP } = useAuth();

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-khmer">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-3">
              តម្លើងទៅ <span className="text-yellow-400">VIP</span> ថ្ងៃនេះ
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              ទទួលបានការមើលភាពយន្តគ្មានកំណត់ គុណភាពខ្ពស់ និងគ្មានការផ្សាយពាណិជ្ជកម្ម
            </p>
          </div>

          {/* VIP Status */}
          {isVIP && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl mb-8 max-w-2xl mx-auto text-center">
              <i className="bi bi-check-circle-fill mr-2"></i>
              អ្នកជាសមាជិក VIP រួចហើយ! សូមរីករាយជាមួយការមើលភាពយន្ត។
            </div>
          )}

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-[#1F1F1F] rounded-2xl p-6 border-2 transition-all ${
                  plan.popular
                    ? 'border-yellow-500 scale-105 md:scale-110'
                    : 'border-gray-800 hover:border-gray-600'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-bold px-4 py-1 rounded-full text-sm">
                    <i className="bi bi-star-fill mr-1"></i>
                    ពេញនិយមបំផុត
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6 mt-2">
                  <div className={`w-16 h-16 bg-${plan.color}-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <i className={`bi ${plan.icon} text-3xl text-${plan.color}-400`}></i>
                  </div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-gray-400 text-sm"> / {plan.duration}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <i className="bi bi-check2-circle text-green-400 mt-0.5"></i>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                {user ? (
                  isVIP ? (
                    <Link
                      to="/"
                      className="block text-center bg-gray-700 text-white font-bold py-3 rounded-xl hover:bg-gray-600 transition"
                    >
                      មើលភាពយន្ត
                    </Link>
                  ) : (
                    <Link
                      to="/wallet/top-up"
                      className={`block text-center font-bold py-3 rounded-xl transition ${
                        plan.popular
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      ជ្រើសរើស
                    </Link>
                  )
                ) : (
                  <Link
                    to="/login"
                    className={`block text-center font-bold py-3 rounded-xl transition ${
                      plan.popular
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    ចុះឈ្មោះឥឡូវនេះ
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Why VIP */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              ហេតុអ្វីត្រូវជ្រើសរើស VIP?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: 'bi-play-circle', title: 'មើលគ្មានកំណត់', desc: 'ភាពយន្តរាប់ពាន់រឿង រួមទាំងរឿងថ្មីៗ' },
                { icon: 'bi-badge-hd', title: 'គុណភាព 4K', desc: 'គុណភាពខ្ពស់បំផុតជាមួយសំឡេង Surround' },
                { icon: 'bi-phone', title: 'មើលគ្រប់ទីកន្លែង', desc: 'មើលបានលើទូរស័ព្ទ ថេប្លេត និងកុំព្យូទ័រ' },
              ].map((item, i) => (
                <div key={i} className="bg-[#1F1F1F] rounded-xl p-6 text-center">
                  <i className={`bi ${item.icon} text-4xl text-red-500 mb-4 block`}></i>
                  <h3 className="text-white font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              សំណួរដែលសួរញឹកញាប់
            </h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <details key={i} className="bg-[#1F1F1F] rounded-xl p-4 group">
                  <summary className="text-white font-medium cursor-pointer flex justify-between items-center">
                    {faq.q}
                    <i className="bi bi-chevron-down group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <p className="text-gray-400 text-sm mt-3">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}