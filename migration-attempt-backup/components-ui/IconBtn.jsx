// src/components/ui/IconBtn.jsx
export default function IconBtn({ icon: Icon, tone = "slate", onClick, title }) {
  const toneClass = tone === "crimson" ? "hover:text-rose-400 hover:border-rose-500/40" : "hover:text-amber-400 hover:border-amber-500/40";
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 inline-flex items-center justify-center rounded-md border border-slate-700 text-slate-400 ${toneClass} transition-colors`}
    >
      <Icon size={13} />
    </button>
  );
}
