// src/layouts/AdminLayout.jsx — sidebar admin shell
// Wraps every admin page with the sidebar + topbar chrome.
import AdminSidebar from "../components/navigation/AdminSidebar";
import AdminTopbar from "../components/navigation/AdminTopbar";

export default function AdminLayout({ active, setActive, sidebarOpen, setSidebarOpen, sectionLabel, children }) {
  return (
    <div className="min-h-screen w-full flex bg-slate-950" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
      `}</style>

      <AdminSidebar active={active} setActive={setActive} open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 min-w-0 flex flex-col">
        <AdminTopbar onMenu={() => setSidebarOpen(true)} sectionLabel={sectionLabel} />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
