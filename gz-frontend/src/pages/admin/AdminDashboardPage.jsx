// src/pages/admin/AdminDashboardPage.jsx — កែលម្អ UI
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SectionHeader from "../../components/common/SectionHeader";
import StatCard from "../../components/common/StatCard";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    revenue: 34802,
    revenueDelta: '+12.4%',
    vipMembers: 1204,
    vipDelta: '+58',
    totalUsers: 8932,
    usersDelta: '+214',
    streamingNow: 142,
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Refresh function
  const refreshData = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setLastUpdated(new Date());
    }, 1000);
  }, []);

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
            onClick={refreshData}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <i className={`bi bi-arrow-clockwise ${loading ? 'animate-spin' : ''}`}></i>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard 
          icon={<i className="bi bi-wallet2 text-2xl text-emerald-400"></i>} 
          label="ចំណូល (30 ថ្ងៃ)" 
          value={`$${stats.revenue.toLocaleString()}`} 
          delta={`${stats.revenueDelta} ធៀបនឹងខែមុន`} 
          deltaTone="up"
        />
        <StatCard 
          icon={<i className="bi bi-star-fill text-2xl text-yellow-400"></i>} 
          label="សមាជិក VIP សកម្ម" 
          value={stats.vipMembers.toLocaleString()} 
          delta={`${stats.vipDelta} សប្តាហ៍នេះ`} 
          deltaTone="up"
        />
        <StatCard 
          icon={<i className="bi bi-people-fill text-2xl text-blue-400"></i>} 
          label="អ្នកប្រើប្រាស់សរុប" 
          value={stats.totalUsers.toLocaleString()} 
          delta={`${stats.usersDelta} សប្តាហ៍នេះ`} 
          deltaTone="up"
        />
        <StatCard 
          icon={<i className="bi bi-play-circle-fill text-2xl text-red-400"></i>} 
          label="កំពុងមើលឥឡូវនេះ" 
          value={stats.streamingNow} 
          live 
        />
      </div>

      {/* Quick Actions & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
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
              to="/admin/reports"
              className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors group"
            >
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <i className="bi bi-graph-up text-green-400 text-lg"></i>
              </div>
              <div>
                <p className="text-sm text-slate-200 group-hover:text-white">មើលរបាយការណ៍</p>
                <p className="text-xs text-slate-500">វិភាគទិន្នន័យលម្អិត</p>
              </div>
              <i className="bi bi-chevron-right text-slate-600 ml-auto"></i>
            </Link>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-200">
              <i className="bi bi-graph-up-arrow text-emerald-400 mr-2"></i>
              ចំណូល 7 ថ្ងៃចុងក្រោយ
            </h2>
            <span className="text-xs text-slate-500">គិតជា USD</span>
          </div>
          
          <div className="flex items-end justify-between h-40 gap-2">
            {[1200, 1800, 1500, 2200, 1900, 2800, 2400].map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-red-600/20 to-red-600/60 rounded-t-lg hover:from-red-600/40 hover:to-red-600/80 transition-all cursor-pointer relative group"
                  style={{ height: `${(value / 2800) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ${value.toLocaleString()}
                  </div>
                </div>
                <span className="text-xs text-slate-500">ថ្ងៃ {i + 1}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>សរុប៖ <span className="text-emerald-400 font-bold">$13,900</span></span>
            <span>មធ្យម/ថ្ងៃ៖ <span className="text-emerald-400 font-bold">$1,986</span></span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl p-5 bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-slate-200">
            <i className="bi bi-activity text-blue-400 mr-2"></i>
            សកម្មភាពថ្មីៗ
          </h2>
          <button className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            មើលទាំងអស់
          </button>
        </div>
        
        <ul className="divide-y divide-slate-800">
          {[
            { 
              icon: 'bi-star-fill', 
              color: 'text-yellow-400', 
              bgColor: 'bg-yellow-400/10',
              text: 'Sokha Chan បានដំឡើងទៅ VIP Membership', 
              time: '12 នាទីមុន' 
            },
            { 
              icon: 'bi-exclamation-triangle-fill', 
              color: 'text-red-400', 
              bgColor: 'bg-red-400/10',
              text: 'សំណើជំនួយថ្មី TCK-1042 — អាទិភាពខ្ពស់', 
              time: '1 ម៉ោងមុន' 
            },
            { 
              icon: 'bi-film', 
              color: 'text-blue-400', 
              bgColor: 'bg-blue-400/10',
              text: 'Iron Silk បានចេញផ្សាយ', 
              time: '3 ម៉ោងមុន' 
            },
            { 
              icon: 'bi-wallet2', 
              color: 'text-emerald-400', 
              bgColor: 'bg-emerald-400/10',
              text: 'ការបញ្ចូលលុយ $50.00 បានបញ្ចប់', 
              time: '5 ម៉ោងមុន' 
            },
          ].map((activity, i) => (
            <li key={i} className="flex items-center gap-3 py-3 text-sm hover:bg-slate-800/30 rounded-lg px-2 transition-colors">
              <div className={`w-8 h-8 ${activity.bgColor} rounded-full flex items-center justify-center shrink-0`}>
                <i className={`bi ${activity.icon} ${activity.color} text-sm`}></i>
              </div>
              <span className="text-slate-300 flex-1">{activity.text}</span>
              <span className="text-slate-500 text-xs flex items-center gap-1 whitespace-nowrap">
                <i className="bi bi-clock"></i> {activity.time}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}