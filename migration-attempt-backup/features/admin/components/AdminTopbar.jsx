// src/components/navigation/AdminTopbar.jsx
import { Search, Bell, ChevronDown, Menu } from "lucide-react";
import { FONT_DISPLAY, inputClass } from '../../../config/constants';

export default function AdminTopbar({ onMenu, sectionLabel }) {
  return (
    <header className="sticky top-0 z-20 h-16 flex items-center gap-3 px-4 sm:px-6 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <button onClick={onMenu} className="lg:hidden text-slate-400 hover:text-slate-200">
        <Menu size={20} />
      </button>
      <div className="relative flex-1 max-w-sm hidden sm:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input placeholder={`Search ${sectionLabel.toLowerCase()}...`} className={`${inputClass} pl-8 w-full`} />
      </div>
      <div className="flex-1 sm:hidden text-sm text-slate-300" style={FONT_DISPLAY}>{sectionLabel}</div>
      <div className="ml-auto flex items-center gap-4">
        <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> All systems live
        </span>
        <button className="relative text-slate-400 hover:text-slate-200">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-medium text-white flex items-center justify-center">3</span>
        </button>
        <button className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs font-medium text-amber-400">AD</div>
          <ChevronDown size={14} className="text-slate-500 hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
