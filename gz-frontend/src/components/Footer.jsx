// src/components/Footer.jsx — Full Code with Larger Text & Logo
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function Footer() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [logoError, setLogoError] = useState(false);

  const footerLinks = {
    'រុករក': [
      { label: 'ទំព័រដើម', to: '/' },
      { label: 'ភាពយន្ត', to: '/movies' },
      { label: 'រឿងថ្មីៗ', to: '/movies?sort=new' },
      { label: 'ពេញនិយម', to: '/movies?sort=popular' },
      { label: 'ឥតគិតថ្លៃ', to: '/movies?type=free' },
    ],
    'គណនី': [
      { label: user ? 'គណនីរបស់ខ្ញុំ' : 'ចូលគណនី', to: user ? '/profile' : '/login' },
      { label: 'ចុះឈ្មោះ', to: '/signup' },
      { label: 'តម្លើង VIP', to: '/pricing' },
      { label: 'ប្រវត្តិមើល', to: '/history' },
      { label: 'ចំណូលចិត្ត', to: '/favorites' },
    ],
    'ជំនួយ': [
      { label: 'មជ្ឈមណ្ឌលជំនួយ', to: '/help' },
      { label: 'លក្ខខណ្ឌប្រើប្រាស់', to: '/terms' },
      { label: 'គោលការណ៍ឯកជនភាព', to: '/privacy' },
      { label: 'ទំនាក់ទំនង', to: '/contact' },
      { label: 'សំណួរញឹកញាប់', to: '/faq' },
    ],
  };

  const socialLinks = [
    { icon: 'bi-facebook', label: 'Facebook', color: 'hover:bg-blue-600' },
    { icon: 'bi-telegram', label: 'Telegram', color: 'hover:bg-sky-500' },
    { icon: 'bi-youtube', label: 'YouTube', color: 'hover:bg-red-600' },
    { icon: 'bi-tiktok', label: 'TikTok', color: 'hover:bg-black' },
    { icon: 'bi-instagram', label: 'Instagram', color: 'hover:bg-pink-600' },
  ];

  return (
    <footer className="bg-[#141414] border-t border-gray-800/50">
      <div className="container mx-auto px-4 md:px-16 py-12">
        
        {/* Top Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Section with Logo */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              {!logoError ? (
                <img 
                  src="/images/logoGz.png" 
                  alt="GZ Movie" 
                  className="h-12 md:h-16 w-auto object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-2xl md:text-3xl font-black tracking-wider">
                  <span className="text-[#E50914]">GZ</span>
                  <span className="text-white">MOVIE</span>
                </span>
              )}
            </Link>
            <p className="text-gray-400 text-base leading-relaxed mb-4">
              វេទិកាភាពយន្តខ្មែរល្អបំផុត មើលភាពយន្តគុណភាព HD & 4K គ្រប់ទីកន្លែង គ្រប់ពេលវេលា។
            </p>
            
            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className={`w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all ${social.color}`}
                  title={social.label}
                >
                  <i className={`bi ${social.icon} text-base`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Link Sections */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white font-semibold text-base md:text-lg mb-4 tracking-wide">
                {section}
              </h4>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.to}
                      className="text-gray-400 hover:text-white text-base transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* App Download Section */}
        <div className="border-t border-gray-800/50 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-white font-semibold text-lg mb-2">ទាញយកកម្មវិធី</h4>
              <p className="text-gray-400 text-base">មើលភាពយន្តនៅលើទូរស័ព្ទរបស់អ្នក</p>
            </div>
            <div className="flex gap-3">
              {/* App Store Button */}
              <a href="#" className="flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg px-4 py-2 transition-all">
                <i className="bi bi-apple text-2xl text-white"></i>
                <div>
                  <p className="text-[10px] text-gray-400">Download on the</p>
                  <p className="text-white font-semibold text-sm">App Store</p>
                </div>
              </a>
              
              {/* Google Play Button */}
              <a href="#" className="flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg px-4 py-2 transition-all">
                <i className="bi bi-google-play text-xl text-white"></i>
                <div>
                  <p className="text-[10px] text-gray-400">Get it on</p>
                  <p className="text-white font-semibold text-sm">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800/50 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-gray-400 text-base">
              &copy; {currentYear} GZ Movie. រក្សាសិទ្ធិគ្រប់យ៉ាង។
            </p>
            
            {/* Quick Links */}
            <div className="flex gap-4 text-base">
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                លក្ខខណ្ឌ
              </Link>
              <span className="text-gray-600">|</span>
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                ឯកជនភាព
              </Link>
              <span className="text-gray-600">|</span>
              <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}