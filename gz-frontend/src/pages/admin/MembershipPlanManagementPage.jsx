// src/pages/admin/MembershipPlanManagementPage.jsx — VIP plan pricing & subscriber counts.
import { Crown } from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader";
import Badge from "../../components/common/Badge";
import { PLANS } from "../../features/admin/mockData";
import { FONT_MONO } from "../../utils/constants";

export default function MembershipPlanManagementPage() {
  return (
    <>
      <SectionHeader title="Membership Plans" subtitle="Pricing tiers and current subscriber counts." />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {PLANS.map((p) => (
          <div key={p.name} className={`rounded-xl p-5 border flex flex-col gap-4 ${p.highlighted ? "bg-amber-500/[0.06] border-amber-500/40" : "bg-slate-900 border-slate-800"}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-100 flex items-center gap-1.5">
                {p.highlighted && <Crown size={14} className="text-amber-400" />} {p.name}
              </span>
              {p.highlighted && <Badge tone="gold">Top tier</Badge>}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-slate-100" style={FONT_MONO}>{p.price}</span>
              <span className="text-xs text-slate-500">{p.period}</span>
            </div>
            <ul className="text-sm text-slate-400 flex flex-col gap-1.5 flex-1">
              {p.features.map((f) => <li key={f}>· {f}</li>)}
            </ul>
            <div className="text-xs text-slate-500 pt-3 border-t border-slate-800">{p.subscribers} subscribers</div>
            <button className="text-sm font-medium px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">Edit Plan</button>
          </div>
        ))}
      </div>
    </>
  );
}
