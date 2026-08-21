// src/pages/admin/ReportsSystemSettingsPage.jsx â€” platform switches & exportable reports.
import { useState } from "react";
import SectionHeader from "../../components/ui/SectionHeader";
import Toggle from "../../components/ui/Toggle";

const REPORTS = [
  { label: "Revenue report (PDF)", desc: "Top-ups, memberships, and purchases by month." },
  { label: "Subscriber report (Excel)", desc: "Full membership tier breakdown and churn." },
  { label: "Content performance (Excel)", desc: "Views, completion rate, and rating per title." },
];

export default function ReportsSystemSettingsPage() {
  const [maintenance, setMaintenance] = useState(false);
  const [registrations, setRegistrations] = useState(true);
  const [khqrLive, setKhqrLive] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  return (
    <>
      <SectionHeader title="Reports & Settings" subtitle="Platform-wide switches and exportable reports." />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-xl p-5 bg-slate-900 border border-slate-800">
          <h2 className="text-sm font-medium text-slate-200 mb-1">System</h2>
          <Toggle checked={maintenance} onChange={setMaintenance} label="Maintenance mode" description="Shows a holding page to all non-admin users." />
          <Toggle checked={registrations} onChange={setRegistrations} label="Allow new registrations" description="Turn off to pause new sign-ups temporarily." />
          <Toggle checked={khqrLive} onChange={setKhqrLive} label="ABA KHQR live mode" description="Off routes payments to the sandbox environment." />
          <Toggle checked={emailAlerts} onChange={setEmailAlerts} label="Email alerts to admins" description="Ticket escalations and failed payment webhooks." />
        </div>

        <div className="rounded-xl p-5 bg-slate-900 border border-slate-800">
          <h2 className="text-sm font-medium text-slate-200 mb-4">Export reports</h2>
          <div className="flex flex-col gap-3">
            {REPORTS.map((r) => (
              <div key={r.label} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm text-slate-100">{r.label}</div>
                  <div className="text-xs text-slate-500">{r.desc}</div>
                </div>
                <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors shrink-0">
                  Export
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
