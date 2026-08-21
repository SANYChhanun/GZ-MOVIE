// src/components/ui/Field.jsx
export default function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>
      {children}
    </label>
  );
}
