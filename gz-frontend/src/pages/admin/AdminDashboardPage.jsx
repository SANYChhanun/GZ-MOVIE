// src/pages/admin/AdminDashboardPage.jsx — overview stats, charts, recent activity.
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Wallet, Crown, Users, Film, Clock } from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader";
import StatCard from "../../components/common/StatCard";
import { REVENUE_DATA, TOP_MOVIES_DATA } from "../../features/admin/mockData";

export default function AdminDashboardPage() {
  return (
    <>
      <SectionHeader title="Dashboard" subtitle="Real-time snapshot of GZ across content, revenue, and audience." />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Wallet} label="Revenue (30d)" value="$34,802" delta="+12.4% vs last month" deltaTone="up" />
        <StatCard icon={Crown} label="Active VIP Members" value="1,204" delta="+58 this week" deltaTone="up" />
        <StatCard icon={Users} label="Total Users" value="8,932" delta="+214 this week" deltaTone="up" />
        <StatCard icon={Film} label="Streaming Right Now" value="142" live />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <div className="xl:col-span-2 rounded-xl p-5 bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-200">Revenue trend — last 14 days</h2>
            <span className="text-xs text-slate-500">USD</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_DATA} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#e2e8f0" }} />
              <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} fill="url(#revFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl p-5 bg-slate-900 border border-slate-800">
          <h2 className="text-sm font-medium text-slate-200 mb-4">Top movies by views (100s)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={TOP_MOVIES_DATA} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="title" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "#1e293b" }} />
              <Bar dataKey="views" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl p-5 bg-slate-900 border border-slate-800">
        <h2 className="text-sm font-medium text-slate-200 mb-3">Recent activity</h2>
        <ul className="divide-y divide-slate-800">
          {[
            { text: "Sokha Chan upgraded to VIP Membership", time: "12 min ago", tone: "jade" },
            { text: "New support ticket TCK-1042 opened — High priority", time: "1 hr ago", tone: "crimson" },
            { text: "Iron Silk published to the catalog", time: "3 hrs ago", tone: "gold" },
            { text: "Wallet top-up of $50.00 completed for Sreymom Heng", time: "5 hrs ago", tone: "jade" },
          ].map((a, i) => (
            <li key={i} className="flex items-center gap-3 py-3 text-sm">
              <span className={`w-1.5 h-1.5 rounded-full ${a.tone === "jade" ? "bg-emerald-400" : a.tone === "crimson" ? "bg-rose-400" : "bg-amber-400"}`} />
              <span className="text-slate-300 flex-1">{a.text}</span>
              <span className="text-slate-500 text-xs flex items-center gap-1"><Clock size={12} />{a.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
