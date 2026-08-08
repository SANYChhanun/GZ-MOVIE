// src/components/common/Badge.jsx
const BADGE_TONES = {
  gold: "bg-amber-500/15 text-amber-400",
  jade: "bg-emerald-500/15 text-emerald-400",
  crimson: "bg-rose-500/15 text-rose-400",
  azure: "bg-sky-500/15 text-sky-400",
  muted: "bg-slate-500/15 text-slate-400",
};

export default function Badge({ tone = "muted", children }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${BADGE_TONES[tone]}`}>
      {children}
    </span>
  );
}

export function statusTone(status) {
  if (["Published", "Completed", "Resolved", "Active"].includes(status)) return "jade";
  if (["Draft", "Pending", "In Progress", "Open"].includes(status)) return "gold";
  if (["Failed", "Refunded", "High"].includes(status)) return "crimson";
  return "muted";
}

export function accessTone(access) {
  if (access === "Free") return "jade";
  if (access === "Member") return "azure";
  return "gold";
}
