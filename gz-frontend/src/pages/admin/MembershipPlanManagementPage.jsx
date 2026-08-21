// src/pages/admin/MembershipPlanManagementPage.jsx
import { useState, useEffect, useCallback } from "react";
import { 
  Crown, 
  Loader, 
  RefreshCw, 
  Ticket, 
  Plus,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader";
import Badge from "../../components/common/Badge";
import adminApi from "../../api/adminApi";
import EditPlanDrawer from "../../features/admin/EditPlanDrawer";
import { FONT_MONO } from "../../utils/constants";

const formatPeriod = (days) => {
  if (!days) return "forever";
  if (days === 7) return "/ week";
  if (days === 14) return "/ 2 weeks";
  if (days === 30) return "/ month";
  if (days === 90) return "/ 3 months";
  if (days === 365) return "/ year";
  return `/ ${days} days`;
};

export default function MembershipPlanManagementPage() {
  const [plans, setPlans] = useState([]);
  const [ppvStats, setPpvStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // ប្រើ Promise.allSettled ដើម្បីមិនឱ្យ error មួយធ្វើឱ្យទាំងអស់បរាជ័យ
      const [plansRes, ppvRes] = await Promise.allSettled([
        adminApi.getMembershipPlans(),
        adminApi.getPpvStats ? adminApi.getPpvStats() : Promise.resolve({ data: null }),
      ]);
      
      // ដោះស្រាយ plans
      if (plansRes.status === 'fulfilled') {
        const data = plansRes.value.data;
        setPlans(Array.isArray(data) ? data : data?.results ?? []);
      } else {
        console.error('Failed to load plans:', plansRes.reason);
        setPlans([]);
      }
      
      // ដោះស្រាយ PPV stats
      if (ppvRes.status === 'fulfilled' && ppvRes.value?.data) {
        setPpvStats(ppvRes.value.data);
      } else {
        setPpvStats(null);
      }
      
    } catch (err) {
      console.error('Error in fetchAll:', err);
      setError("Failed to load membership plans.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchAll(); 
  }, [fetchAll]);

  const handlePlanSaved = () => {
    setEditingPlan(null);
    setShowCreateDrawer(false);
    fetchAll();
  };

  // ============ LOADING STATE ============
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="animate-spin text-amber-400 mx-auto mb-3" size={32} />
          <p className="text-slate-400 text-sm">កំពុងផ្ទុកទិន្នន័យ...</p>
        </div>
      </div>
    );
  }

  // ============ ERROR STATE ============
  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="text-red-400 mx-auto mb-3" size={32} />
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={fetchAll} 
          className="inline-flex items-center gap-2 bg-slate-800 text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <RefreshCw size={15} /> ព្យាយាមម្តងទៀត
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader 
        title="គម្រោងសមាជិកភាព" 
        subtitle="តម្លៃ និងចំនួនអ្នកជាវបច្ចុប្បន្ន"
        action={
          <button
            onClick={() => setShowCreateDrawer(true)}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} /> បន្ថែមគម្រោង
          </button>
        }
      />

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <PlanCard 
            key={plan.id} 
            plan={plan} 
            onEdit={() => setEditingPlan(plan)} 
          />
        ))}

        {/* PPV Card */}
        <PPVCard ppvStats={ppvStats} />

        {/* Empty State */}
        {plans.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center gap-3 py-12 text-center border border-dashed border-slate-800 rounded-xl">
            <Crown size={32} className="text-slate-600" />
            <p className="text-slate-400 text-sm">មិនទាន់មានគម្រោងទេ</p>
            <button
              onClick={() => setShowCreateDrawer(true)}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
            >
              <Plus size={15} /> បន្ថែមគម្រោង
            </button>
          </div>
        )}
      </div>

      {/* Edit Drawer */}
      {editingPlan && (
        <EditPlanDrawer
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSave={handlePlanSaved}
        />
      )}

      {/* Create Drawer */}
      {showCreateDrawer && (
        <EditPlanDrawer
          plan={null}
          onClose={() => setShowCreateDrawer(false)}
          onSave={handlePlanSaved}
        />
      )}
    </div>
  );
}

// ============ PLAN CARD COMPONENT ============
function PlanCard({ plan, onEdit }) {
  const isHighlighted = plan.is_highlighted;
  const isActive = plan.is_active;
  const price = Number(plan.price) || 0;
  const features = plan.features || [];
  
  return (
    <div className={`
      rounded-xl p-5 border flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
      ${isHighlighted 
        ? "bg-amber-500/[0.06] border-amber-500/40 shadow-amber-500/10" 
        : "bg-slate-900 border-slate-800 hover:border-slate-700"
      }
      ${!isActive ? "opacity-60" : ""}
    `}>
      {/* Plan Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-100 flex items-center gap-1.5">
          {isHighlighted && <Crown size={14} className="text-amber-400" />} 
          {plan.name}
        </span>
        {isHighlighted && <Badge tone="gold">ពេញនិយម</Badge>}
        {!isActive && (
          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-slate-700 text-slate-500">
            លាក់
          </span>
        )}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-slate-100" style={FONT_MONO}>
          {price === 0 ? "ឥតគិតថ្លៃ" : `$${price.toFixed(2)}`}
        </span>
        <span className="text-xs text-slate-500">{formatPeriod(plan.duration_days)}</span>
      </div>

      {/* Features */}
      <ul className="text-sm text-slate-400 flex flex-col gap-1.5 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-800">
        <span className="flex items-center gap-1">
          <Users size={12} />
          {plan.subscriber_count || 0} អ្នកជាវ
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {formatPeriod(plan.duration_days)}
        </span>
      </div>

      {/* Edit Button */}
      <button
        onClick={onEdit}
        className="text-sm font-medium px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
      >
        កែសម្រួលគម្រោង
      </button>
    </div>
  );
}

// ============ PPV CARD COMPONENT ============
function PPVCard({ ppvStats }) {
  return (
    <div className="rounded-xl p-5 border border-dashed flex flex-col gap-4 bg-slate-900 border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-100 flex items-center gap-1.5">
          <Ticket size={14} className="text-amber-400" /> ពិសេស
        </span>
        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-slate-700 text-slate-500">
          ទិញម្តងមើលម្តង
        </span>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-slate-100" style={FONT_MONO}>
          ប្រែប្រួល
        </span>
        <span className="text-xs text-slate-500">/ ក្នុងមួយរឿង</span>
      </div>

      {/* Features */}
      <ul className="text-sm text-slate-400 flex flex-col gap-1.5 flex-1">
        <li className="flex items-start gap-2">
          <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
          មិនចាំបាច់ជាវ — ដោះសោរឿងម្តងមួយៗ
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
          ចូលប្រើបាន 1 ខែក្នុងមួយការទិញ
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
          តម្លៃកំណត់ក្នុងមួយរឿង
        </li>
      </ul>

      {/* Stats */}
      <div className="text-xs text-slate-500 pt-3 border-t border-slate-800 space-y-1">
        {ppvStats ? (
          <>
            <div className="flex items-center justify-between">
              <span>អ្នកទិញសកម្ម៖</span>
              <span className="text-emerald-400 font-bold">{ppvStats.active_purchasers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>ការដោះសោសកម្ម៖</span>
              <span className="text-emerald-400 font-bold">{ppvStats.active_purchase_count || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>ចំណូលសរុប៖</span>
              <span className="text-amber-400 font-bold">
                ${Number(ppvStats.total_revenue || 0).toLocaleString()}
              </span>
            </div>
          </>
        ) : (
          <span className="text-slate-600">— គ្មានទិន្នន័យ —</span>
        )}
      </div>

      {/* Info */}
      <button
        disabled
        title="គ្រប់គ្រងតាមរយៈ purchase_price នៅទំព័រភាពយន្ត"
        className="text-sm font-medium px-3 py-2 rounded-lg border border-slate-800 text-slate-600 cursor-not-allowed flex items-center justify-center gap-2"
      >
        <DollarSign size={14} />
        គ្រប់គ្រងតាមរយៈទំព័រភាពយន្ត
      </button>
    </div>
  );
}