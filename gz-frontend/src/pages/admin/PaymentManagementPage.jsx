// src/pages/admin/PaymentManagementPage.jsx — membership & pay-per-movie payments.
import SectionHeader from "../../components/common/SectionHeader";
import Table from "../../components/common/Table";
import Badge, { statusTone } from "../../components/common/Badge";
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
