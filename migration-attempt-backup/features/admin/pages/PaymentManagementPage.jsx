// src/pages/admin/PaymentManagementPage.jsx â€” membership & pay-per-movie payments.
import SectionHeader from "../../components/ui/SectionHeader";
import Table from "../../components/ui/Table";
import Badge, { statusTone } from "../../components/ui/Badge";
import { PAYMENTS } from "../../features/admin/mockData";

export default function PaymentManagementPage() {
  return (
    <>
      <SectionHeader title="Payments" subtitle="Membership and pay-per-movie payments." />
      <Table
        headers={["Payment", "User", "Item", "Amount", "Method", "Status", "Date"]}
        rows={PAYMENTS.map((p) => [p.id, p.user, p.item, p.amount, p.method, <Badge tone={statusTone(p.status)}>{p.status}</Badge>, p.date])}
      />
    </>
  );
}
