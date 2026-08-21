// src/features/admin/EditPlanDrawer.jsx
import { useState } from "react";
import { X, Loader } from "lucide-react";
import adminApi from "../adminApi";
import { inputClass } from '../../../config/constants';

export default function EditPlanDrawer({ plan, onClose, onSave }) {
  const [form, setForm] = useState({
    name: plan.name ?? "",
    description: plan.description ?? "",
    price: plan.price ?? "0",
    noExpiry: !plan.duration_days,
    duration_days: plan.duration_days ?? "",
    features: (plan.features ?? []).join("\n"),
    is_highlighted: !!plan.is_highlighted,
    is_active: plan.is_active ?? true,
    sort_order: plan.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price) || 0,
        duration_days: form.noExpiry ? null : Number(form.duration_days) || null,
        features: form.features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
        is_highlighted: form.is_highlighted,
        is_active: form.is_active,
        sort_order: Number(form.sort_order) || 0,
      };
      if (!payload.name) throw new Error("Name is required.");
      if (!form.noExpiry && !payload.duration_days) {
        throw new Error("Set a duration, or check 'No expiry' for the Free tier.");
      }
      await adminApi.updateMembershipPlan(plan.id, payload);
      onSave();
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || "Failed to save plan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 p-5 overflow-y-auto flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-slate-100 font-medium">Edit Plan â€” {plan.name}</h2>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <label className="flex flex-col gap-1 text-sm text-slate-400">
          Name
          <input className={inputClass} value={form.name} onChange={set("name")} required />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-400">
          Description
          <textarea className={inputClass} rows={3} value={form.description} onChange={set("description")} />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-400">
          Price (USD)
          <input type="number" step="0.01" min="0" className={inputClass} value={form.price} onChange={set("price")} />
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-400">
          <input type="checkbox" checked={form.noExpiry} onChange={set("noExpiry")} />
          No expiry (Free tier)
        </label>

        {!form.noExpiry && (
          <label className="flex flex-col gap-1 text-sm text-slate-400">
            Duration (days)
            <input type="number" min="1" className={inputClass} value={form.duration_days} onChange={set("duration_days")} />
          </label>
        )}

        <label className="flex flex-col gap-1 text-sm text-slate-400">
          Features (one per line)
          <textarea className={inputClass} rows={4} value={form.features} onChange={set("features")} />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-400">
          Sort order
          <input type="number" className={inputClass} value={form.sort_order} onChange={set("sort_order")} />
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-400">
          <input type="checkbox" checked={form.is_highlighted} onChange={set("is_highlighted")} />
          Highlighted ("Most popular")
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-400">
          <input type="checkbox" checked={form.is_active} onChange={set("is_active")} />
          Active (visible to users)
        </label>

        <div className="mt-auto pt-4 flex gap-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 text-sm font-medium px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-60"
          >
            {saving && <Loader size={14} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}