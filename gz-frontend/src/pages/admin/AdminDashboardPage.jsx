// src/pages/admin/AdminDashboardPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SectionHeader from "../../components/common/SectionHeader";
import StatCard from "../../components/common/StatCard";
import adminApi from '../../api/adminApi';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    revenue: 0,
    revenueDelta: '+0%',
    vipMembers: 0,
    vipDelta: '+0',
    totalUsers: 0,
    usersDelta: '+0',
    streamingNow: 0,
    totalMovies: 0,
    totalPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // ទាញយកទិន្នន័យពី Backend
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await adminApi.getDashboardStats();
      
      if (response.data) {
        setStats({
          revenue: response.data.total_revenue || 0,
          revenueDelta: '+0%',
          vipMembers: response.data.total_vip_members || 0,
          vipDelta: '+0',
          totalUsers: response.data.total_users || 0,
          usersDelta: '+0',
          streamingNow: 0,
          totalMovies: response.data.total_movies || 0,
          totalPayments: response.data.total_payments || 0,
        });
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('មិនអាចទាញយកទិន្នន័យបានទេ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading && stats.totalUsers === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <SectionHeader 
          title="ទំព័រដើម" 
          subtitle="ទិដ្ឋភាពទូទៅនៃ GZ Movie" 
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden md:block">
            <i className="bi bi-clock mr-1"></i>
            បច្ចុប្បន្នភាព៖ {lastUpdated.toLocaleTimeString('km-KH')}
          </span>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <i className={`bi bi-arrow-clockwise ${loading ? 'animate-spin' : ''}`}></i>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl flex items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill"></i>
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard 
          icon={<i className="bi bi-wallet2 text-2xl text-emerald-400"></i>} 
          label="ចំណូលសរុប" 
          value={`$${stats.revenue.toLocaleString()}`} 
          delta={stats.revenueDelta} 
          deltaTone="up"
        />
        <StatCard 
          icon={<i className="bi bi-star-fill text-2xl text-yellow-400"></i>} 
          label="សមាជិក VIP" 
          value={stats.vipMembers.toLocaleString()} 
          delta={stats.vipDelta} 
          deltaTone="up"
        />
        <StatCard 
          icon={<i className="bi bi-people-fill text-2xl text-blue-400"></i>} 
          label="អ្នកប្រើប្រាស់សរុប" 
          value={stats.totalUsers.toLocaleString()} 
          delta={stats.usersDelta} 
          deltaTone="up"
        />
        <StatCard 
          icon={<i className="bi bi-film text-2xl text-red-400"></i>} 
          label="ភាពយន្តសរុប" 
          value={stats.totalMovies.toLocaleString()} 
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-medium text-slate-200 mb-4">
            <i className="bi bi-lightning-charge-fill text-yellow-400 mr-2"></i>
            សកម្មភាពរហ័ស
          </h2>
          <div className="space-y-2">
            <Link
              to="/admin/movies"
              className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <i className="bi bi-plus-circle text-blue-400 text-lg"></i>
              </div>
              <div>
                <p className="text-sm text-slate-200 group-hover:text-white">បន្ថែមភាពយន្តថ្មី</p>
                <p className="text-xs text-slate-500">បង្កើតមាតិកាថ្មី</p>
              </div>
              <i className="bi bi-chevron-right text-slate-600 ml-auto"></i>
            </Link>
            
            <Link
              to="/admin/users"
              className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <i className="bi bi-person-plus text-purple-400 text-lg"></i>
              </div>
              <div>
                <p className="text-sm text-slate-200 group-hover:text-white">គ្រប់គ្រងអ្នកប្រើ</p>
                <p className="text-xs text-slate-500">បន្ថែម ឬកែសម្រួលអ្នកប្រើ</p>
              </div>
              <i className="bi bi-chevron-right text-slate-600 ml-auto"></i>
            </Link>
            
            <Link
              to="/admin/payments"
              className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors group"
            >
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <i className="bi bi-credit-card text-emerald-400 text-lg"></i>
              </div>
              <div>
                <p className="text-sm text-slate-200 group-hover:text-white">មើលការទូទាត់</p>
                <p className="text-xs text-slate-500">គ្រប់គ្រងប្រតិបត្តិការ</p>
              </div>
              <i className="bi bi-chevron-right text-slate-600 ml-auto"></i>
            </Link>
          </div>
        </div>

        {/* Revenue Chart - អាចប្រើទិន្នន័យពី API នៅពេលក្រោយ */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-200">
              <i className="bi bi-graph-up-arrow text-emerald-400 mr-2"></i>
              ស្ថិតិទូទៅ
            </h2>
          </div>
          
          {/* បង្ហាញស្ថិតិបន្ថែម */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-1">ការទូទាត់សរុប</p>
              <p className="text-2xl font-bold text-emerald-400">
                {stats.totalPayments.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-1">ភាពយន្តសរុប</p>
              <p className="text-2xl font-bold text-blue-400">
                {stats.totalMovies.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}