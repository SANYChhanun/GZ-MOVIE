// src/pages/admin/AdminDashboardPage.jsx — ប្រើ Bootstrap Icons ជំនួស lucide-react
import SectionHeader from "../../components/common/SectionHeader";
import StatCard from "../../components/common/StatCard";

export default function AdminDashboardPage() {
  return (
    <>
      <SectionHeader title="Dashboard" subtitle="Real-time snapshot of GZ across content, revenue, and audience." />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={<i className="bi bi-wallet2 text-2xl text-emerald-400"></i>} 
          label="Revenue (30d)" 
          value="$34,802" 
          delta="+12.4% vs last month" 
          deltaTone="up" 
        />
        <StatCard 
          icon={<i className="bi bi-star-fill text-2xl text-yellow-400"></i>} 
          label="Active VIP Members" 
          value="1,204" 
          delta="+58 this week" 
          deltaTone="up" 
        />
        <StatCard 
          icon={<i className="bi bi-people-fill text-2xl text-blue-400"></i>} 
          label="Total Users" 
          value="8,932" 
          delta="+214 this week" 
          deltaTone="up" 
        />
        <StatCard 
          icon={<i className="bi bi-play-circle-fill text-2xl text-red-400"></i>} 
          label="Streaming Right Now" 
          value="142" 
          live 
        />
      </div>

      <div className="rounded-xl p-5 bg-slate-900 border border-slate-800">
        <h2 className="text-sm font-medium text-slate-200 mb-3">Recent activity</h2>
        <ul className="divide-y divide-slate-800">
          {[
            { text: "Sokha Chan upgraded to VIP Membership", time: "12 min ago" },
            { text: "New support ticket TCK-1042 opened — High priority", time: "1 hr ago" },
            { text: "Iron Silk published to the catalog", time: "3 hrs ago" },
            { text: "Wallet top-up of $50.00 completed", time: "5 hrs ago" },
          ].map((a, i) => (
            <li key={i} className="flex items-center gap-3 py-3 text-sm">
              <i className="bi bi-dot text-emerald-400"></i>
              <span className="text-slate-300 flex-1">{a.text}</span>
              <span className="text-slate-500 text-xs">
                <i className="bi bi-clock"></i> {a.time}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}