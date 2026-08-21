// src/components/ui/SectionHeader.jsx
import { FONT_DISPLAY } from '../../config/constants';

export default function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
      <div>
        <h1 className="text-2xl text-slate-100" style={FONT_DISPLAY}>{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
