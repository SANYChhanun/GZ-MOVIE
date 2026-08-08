// src/pages/admin/UserListPage.jsx — registered accounts, search, tier badges.
import { useState } from "react";
import { Search, Pencil, Trash2 } from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import IconBtn from "../../components/common/IconBtn";
import { INITIAL_USERS } from "../../features/admin/mockData";
import { inputClass } from "../../utils/constants";

export default function UserListPage() {
  const [query, setQuery] = useState("");
  const filtered = INITIAL_USERS.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()));
  const tierTone = (t) => (t === "VIP" ? "gold" : t === "Premium" ? "azure" : t === "Basic" ? "jade" : "muted");

  return (
    <>
      <SectionHeader title="Users" subtitle={`${INITIAL_USERS.length} registered accounts`} />
      <div className="relative max-w-sm mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email..." className={`${inputClass} pl-8 w-full`} />
      </div>
      <Table
        headers={["User", "Tier", "Devices", "Joined", ""]}
        empty="No users match your search."
        rows={filtered.map((u) => [
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-medium text-amber-400 shrink-0">
              {u.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="font-medium text-slate-100">{u.name}</div>
              <div className="text-xs text-slate-500">{u.email}</div>
            </div>
          </div>,
          <Badge tone={tierTone(u.tier)}>{u.tier}</Badge>,
          u.devices,
          u.joined,
          <div className="flex items-center gap-1.5">
            <IconBtn icon={Pencil} title="Edit" />
            <IconBtn icon={Trash2} tone="crimson" title="Suspend" />
          </div>,
        ])}
      />
    </>
  );
}
