// src/pages/admin/MembershipPlanManagementPage.jsx
import { useState, useEffect, useCallback } from "react";
import { Crown, Loader, RefreshCw, Ticket } from "lucide-react";
import SectionHeader from '';
import Badge from '';
  return `/ ${days} days`;
};

export default function MembershipPlanManagementPage() {
  const [plans, setPlans] = useState([]);
  const [ppvStats, setPpvStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null); // â† plan object being edited, or null

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [plansRes, ppvRes] = await Promise.all([
        adminApi.getMembershipPlans(),
        adminApi.getPpvStats(),
      ]);
      setPlans(Array.isArray(plansRes.data) ? plansRes.data : plansRes.data.results ?? []);
      setPpvStats(ppvRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load membership plans.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handlePlanSaved = () => {
    setEditingPlan(null);
    fetchAll(); // refresh subscriber counts / updated values
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={fetchAll} className="inline-flex items-center gap-2 bg-slate-800 text-slate-200 px-4 py-2 rounded-lg">
          <RefreshCw size={15} /> Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <SectionHeader title="Membership Plans" subtitle="Pricing tiers and current subscriber counts." />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map((p) => (
          <div key={p.id} className={`rounded-xl p-5 border flex flex-col gap-4 ${p.is_highlighted ? "bg-amber-500/[0.06] border-amber-500/40" : "bg-slate-900 border-slate-800"}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-100 flex items-center gap-1.5">
                {p.is_highlighted && <Crown size={14} className="text-amber-400" />} {p.name}
              </span>
              {p.is_highlighted && <Badge tone="gold">Most popular</Badge>}
              {!p.is_active && (
                <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-slate-700 text-slate-500">
                  Hidden
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-slate-100" style={FONT_MONO}>
                {Number(p.price) === 0 ? "Free" : `$${Number(p.price).toFixed(2)}`}
              </span>
              <span className="text-xs text-slate-500">{formatPeriod(p.duration_days)}</span>
            </div>
            <ul className="text-sm text-slate-400 flex flex-col gap-1.5 flex-1">
              {(p.features || []).map((f) => <li key={f}>Â· {f}</li>)}
            </ul>
            <div className="text-xs text-slate-500 pt-3 border-t border-slate-800">{p.subscriber_count} subscribers</div>
            <button
              onClick={() => setEditingPlan(p)}
              className="text-sm font-medium px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Edit Plan
            </button>
          </div>
        ))}

        {/* Special / PPV â€” not a MembershipPlan row, sourced from purchases app */}
        <div className="rounded-xl p-5 border border-dashed flex flex-col gap-4 bg-slate-900 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-100 flex items-center gap-1.5">
              <Ticket size={14} className="text-amber-400" /> Special
            </span>
            <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-slate-700 text-slate-500">
              Pay per video
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-slate-100" style={FONT_MONO}>Varies</span>
            <span className="text-xs text-slate-500">/ per title</span>
          </div>
          <ul className="text-sm text-slate-400 flex flex-col gap-1.5 flex-1">
            <li>Â· No subscription â€” unlock one movie at a time</li>
            <li>Â· 1-month access per purchase</li>
            <li>Â· Priced per title (see Movies page)</li>
          </ul>
          <div className="text-xs text-slate-500 pt-3 border-t border-slate-800">
            {ppvStats ? `${ppvStats.active_purchasers} active purchasers Â· ${ppvStats.active_purchase_count} unlocks` : "â€”"}
          </div>
          <button
            disabled
            title="Managed per-movie via the purchase_price field on the Movies page"
            className="text-sm font-medium px-3 py-2 rounded-lg border border-slate-800 text-slate-600 cursor-not-allowed"
          >
            Managed via Movies
          </button>
        </div>
      </div>

      {editingPlan && (
        <EditPlanDrawer
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSave={handlePlanSaved}
        />
      )}
    </>
  );
}