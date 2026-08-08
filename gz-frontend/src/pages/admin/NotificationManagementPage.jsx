// src/pages/admin/NotificationManagementPage.jsx — broadcast messages to audience segments.
import { useState } from "react";
import { Send } from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader";
import Table from "../../components/common/Table";
import Field from "../../components/common/Field";
import { INITIAL_NOTIFS } from "../../features/admin/mockData";
import { inputClass } from "../../utils/constants";

export default function NotificationManagementPage() {
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("All users");

  const send = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setNotifs((prev) => [{ id: Date.now(), title, audience, sent: "Just now", reach: "—" }, ...prev]);
    setTitle("");
  };

  return (
    <>
      <SectionHeader title="Notifications" subtitle="Broadcast messages to segments of your audience." />
      <form onSubmit={send} className="rounded-xl p-5 bg-slate-900 border border-slate-800 mb-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Field label="Message">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. New this week: Iron Silk" className={inputClass} />
            </Field>
          </div>
          <Field label="Audience">
            <select value={audience} onChange={(e) => setAudience(e.target.value)} className={inputClass}>
              <option>All users</option>
              <option>VIP members expiring soon</option>
              <option>Free tier users</option>
              <option>Inactive 30+ days</option>
            </select>
          </Field>
        </div>
        <button className="self-start inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Send size={14} /> Send Notification
        </button>
      </form>

      <Table
        headers={["Message", "Audience", "Sent", "Reach"]}
        rows={notifs.map((n) => [n.title, n.audience, n.sent, n.reach])}
      />
    </>
  );
}
