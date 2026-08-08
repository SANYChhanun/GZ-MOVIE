// src/components/common/StatCard.jsx
import { TrendingUp, TrendingDown } from "lucide-react";
import { FONT_MONO } from "../../utils/constants";

export default function StatCard({ icon: Icon, label, value, delta, deltaTone, live }) {
  return (
    <div className="rounded-xl p-5 flex flex-col gap-3 bg-slate-900 border border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400">
          <Icon size={16} />
          <span className="text-xs uppercase tracking-wider">{label}</span>
        </div>
        {live && (
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold text-slate-100" style={FONT_MONO}>{value}</div>
      {delta && (
        <div className={`flex items-center gap-1 text-xs ${deltaTone === "up" ? "text-emerald-400" : "text-rose-400"}`}>
          {deltaTone === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {delta}
        </div>
      )}
    </div>
  );
}
