// src/pages/admin/WalletTopUpManagementPage.jsx — ABA KHQR / Bakong top-up transactions.
import SectionHeader from '';
import Table from '';
import Badge, { statusTone } from '';

export default function WalletTopUpManagementPage() {
  return (
    <>
      <SectionHeader title="Wallet Top-ups" subtitle="ABA KHQR and Bakong top-up transactions." />
      <Table
        headers={["Transaction", "User", "Amount", "Method", "Status", "Date"]}
        rows={TOPUPS.map((t) => [t.id, t.user, t.amount, t.method, <Badge tone={statusTone(t.status)}>{t.status}</Badge>, t.date])}
      />
    </>
  );
}

