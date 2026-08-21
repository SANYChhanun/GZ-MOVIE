// src/router.jsx — Fixed Version with Khmer Text
import { createBrowserRouter, Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

// ============ PUBLIC PAGES ============
import HomePage from './pages/HomePage';
import LoginPage from './features/auth/pages/LoginPage';
import SignUpPage from './features/auth/pages/SignUpPage';
import PricingPage from './pages/PricingPage';

// ============ MOVIE PAGES ============
import MovieLibraryPage from './pages/movies/MovieLibraryPage';
import MovieDetailPage from './pages/movies/MovieDetailPage';
import VideoPlayerPage from './pages/watch/VideoPlayerPage';

import WalletPage from './pages/WalletPage';

// ============ PROTECTED ROUTES ============
import PrivateRoute, { AdminRoute } from './routes/PrivateRoute';

// ============ ADMIN PAGES ============
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import MovieListPage from './pages/admin/MovieListPage';
import UserListPage from './pages/admin/UserListPage';
import BannerFeaturedContentPage from './pages/admin/BannerFeaturedContentPage';
import CategoryGenreManagementPage from './pages/admin/CategoryGenreManagementPage';
import MembershipPlanManagementPage from './pages/admin/MembershipPlanManagementPage';
import NotificationManagementPage from './pages/admin/NotificationManagementPage';
import PaymentManagementPage from './pages/admin/PaymentManagementPage';
import ReportsSystemSettingsPage from './pages/admin/ReportsSystemSettingsPage';
import SupportTicketManagementPage from './pages/admin/SupportTicketManagementPage';
import WalletTopUpManagementPage from './pages/admin/WalletTopUpManagementPage';

// ============ ADMIN SIDEBAR ============
const AdminSidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    { path: '/admin', icon: 'bi-speedometer2', label: 'ទំព័រដើម' },
    { path: '/admin/movies', icon: 'bi-film', label: 'ភាពយន្ត' },
    { path: '/admin/users', icon: 'bi-people', label: 'អ្នកប្រើប្រាស់' },
    { path: '/admin/banners', icon: 'bi-image', label: 'Banner' },
    { path: '/admin/categories', icon: 'bi-grid', label: 'ប្រភេទ' },
    { path: '/admin/membership', icon: 'bi-star', label: 'សមាជិក VIP' },
    { path: '/admin/payments', icon: 'bi-wallet2', label: 'ការទូទាត់' },
    { path: '/admin/wallet', icon: 'bi-cash', label: 'Wallet' },
    { path: '/admin/notifications', icon: 'bi-bell', label: 'ការជូនដំណឹង' },
    { path: '/admin/support', icon: 'bi-headset', label: 'ជំនួយ' },
    { path: '/admin/reports', icon: 'bi-file-earmark-bar-graph', label: 'របាយការណ៍' },
  ];

  return (
    <aside className={`
      bg-slate-900 border-r border-slate-800 transition-all duration-300
      ${collapsed ? 'w-20' : 'w-64'}
      hidden lg:flex flex-col
    `}>
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        {!collapsed && (
          <h2 className="text-xl font-bold text-red-500">
            <i className="bi bi-speedometer2 mr-2"></i>
            GZ Admin
          </h2>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white p-1"
        >
          <i className={`bi bi-chevron-${collapsed ? 'right' : 'left'}`}></i>
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
              ${isActive(item.path) 
                ? 'bg-red-600/10 text-red-500 border border-red-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }
            `}
            title={collapsed ? item.label : ''}
          >
            <i className={`bi ${item.icon} text-lg`}></i>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}

        <hr className="border-slate-700 my-3" />
        
        <a
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
          title={collapsed ? 'ត្រឡប់ទៅទំព័រដើម' : ''}
        >
          <i className="bi bi-arrow-left text-lg"></i>
          {!collapsed && <span>ត្រឡប់ទៅទំព័រដើម</span>}
        </a>
      </nav>
    </aside>
  );
};

const AdminLayout = () => (
  <div className="min-h-screen bg-slate-950 text-white font-khmer flex">
    <AdminSidebar />
    <main className="flex-1 p-4 md:p-6 overflow-auto max-h-screen">
      <Outlet />
    </main>
  </div>
);

// ============ ROUTER ============
export const router = createBrowserRouter([
  // PUBLIC
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignUpPage /> },
  { path: '/pricing', element: <PricingPage /> },
  { path: '/movies', element: <MovieLibraryPage /> },
  { path: '/movies/:id', element: <MovieDetailPage /> },
  
  // PROTECTED
  {
    path: '/watch/:id',
    element: (
      <PrivateRoute>
        <VideoPlayerPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/wallet',
    element: (
      <PrivateRoute>
        <WalletPage />
      </PrivateRoute>
    ),
  },
  // ADMIN
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'movies', element: <MovieListPage /> },
      { path: 'users', element: <UserListPage /> },
      { path: 'banners', element: <BannerFeaturedContentPage /> },
      { path: 'categories', element: <CategoryGenreManagementPage /> },
      { path: 'membership', element: <MembershipPlanManagementPage /> },
      { path: 'payments', element: <PaymentManagementPage /> },
      { path: 'wallet', element: <WalletTopUpManagementPage /> },
      { path: 'notifications', element: <NotificationManagementPage /> },
      { path: 'support', element: <SupportTicketManagementPage /> },
      { path: 'reports', element: <ReportsSystemSettingsPage /> },
    ],
  },
  
  // 404
  {
    path: '*',
    element: (
      <div className="min-h-screen bg-darker flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-black text-white mb-4">404</h1>
          <p className="text-gray-400 text-lg mb-6">រកមិនឃើញទំព័រដែលអ្នកកំពុងស្វែងរកទេ</p>
          <Link to="/" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl inline-flex items-center gap-2 transition">
            <i className="bi bi-house-door"></i>
            ត្រឡប់ទៅទំព័រដើម
          </Link>
        </div>
      </div>
    ),
  },
]);

export default router;