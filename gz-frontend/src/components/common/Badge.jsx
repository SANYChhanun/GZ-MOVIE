// src/components/common/Badge.jsx — បន្ថែម amber tone

export const accessTone = {
  free: "jade",
  member: "amber",
  purchase: "rose",
};

export const statusTone = {
  Active: "jade",
  Inactive: "muted",
};

// ✅ បន្ថែម tone សម្រាប់ Featured
export const featuredTone = {
  true: "amber",
  false: "muted",
};

export default function Badge({ children, tone = "muted", className = "" }) {
  const tones = {
    jade: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    crimson: "bg-red-500/10 text-red-400 border-red-500/20",
    muted: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${tones[tone] || tones.muted} ${className}`}>
      {children}
    </span>
  );
}