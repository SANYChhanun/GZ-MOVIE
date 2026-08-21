// src/pages/admin/SupportTicketManagementPage.jsx â€” issues, refund requests, playback reports.
import { useState } from "react";
import SectionHeader from '';
import Table from '';
import Badge, { statusTone } from '';

export default function SupportTicketManagementPage() {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const updateStatus = (id, status) => setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));

  return (
    <>
      <SectionHeader title="Support Tickets" subtitle="Issues, refund requests, and playback reports." />
      <Table
        headers={["Ticket", "Subject", "User", "Priority", "Status", "Date"]}
        rows={tickets.map((t) => [
          t.id,
          t.subject,
          t.user,
          <Badge tone={statusTone(t.priority)}>{t.priority}</Badge>,
          <select
            value={t.status}
            onChange={(e) => updateStatus(t.id, e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            {["Open", "In Progress", "Resolved"].map((s) => <option key={s}>{s}</option>)}
          </select>,
          t.date,
        ])}
      />
    </>
  );
}
