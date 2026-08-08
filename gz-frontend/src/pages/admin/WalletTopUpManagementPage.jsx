// src/pages/admin/WalletTopUpManagementPage.jsx — ABA KHQR / Bakong top-up transactions.
import SectionHeader from "../../components/common/SectionHeader";
import Table from "../../components/common/Table";
import Badge, { statusTone } from "../../components/common/Badge";
import { TOPUPS } from "../../features/admin/mockData";

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
