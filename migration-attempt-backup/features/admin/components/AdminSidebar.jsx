// src/components/navigation/AdminSidebar.jsx
import { LogOut } from "lucide-react";
import { NAV, FONT_DISPLAY, FONT_MONO } from '../../../config/constants';

export default function AdminSidebar({ active, setActive, open, setOpen }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-slate-950/70 z-30 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed lg:sticky top-0 z-40 lg:z-0 h-screen w-64 shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <span className="text-slate-950 text-sm font-bold" style={FONT_MONO}>GZ</span>
            </div>
            <span className="text-lg text-slate-100" style={FONT_DISPLAY}>Admin</span>
          </div>
          <div className="flex gap-1 mt-4">
            {Array.from({ length: 9 }).map((_, i) => <span key={i} className="w-1 h-1 rounded-full bg-slate-800" />)}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {NAV.map((group) => (
            <div key={group.group} className="mb-5">
              <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">{group.group}</div>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive = active === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActive(item.id); setOpen(false); }}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left border-l-2 transition-colors ${
                        isActive ? "bg-amber-500/10 border-amber-500 text-amber-400" : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }`}
                    >
                      <Icon size={15} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
