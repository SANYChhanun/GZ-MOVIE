// src/pages/admin/PaymentManagementPage.jsx
import { useState, useEffect, useCallback } from 'react';
import SectionHeader from "../../components/common/SectionHeader";
import Table from "../../components/common/Table";
import Badge, { statusTone } from "../../components/common/Badge";
import StatCard from "../../components/common/StatCard";
import paymentsApi from "../../api/paymentsApi";
import { useDebounce } from "../../hooks/useDebounce";

export default function PaymentManagementPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    payment_type: '',
    search: '',
    page: 1,
    page_size: 20,
  });
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  // ទាញយកទិន្នន័យ
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: filters.page,
        page_size: filters.page_size,
      };

      if (filters.status) params.status = filters.status;
      if (filters.payment_type) params.payment_type = filters.payment_type;
      if (debouncedSearch) params.search = debouncedSearch;

      const response = await paymentsApi.getAllPayments(params);
      setPayments(response.data.results);
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payments');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.page_size, filters.status, filters.payment_type, debouncedSearch]);

  // ទាញយកស្ថិតិសង្ខេប
  // ★ FIX: this used to call paymentsApi.getAllPayments({ endpoint: 'summary' }),
  // which just added a harmless, ignored `?endpoint=summary` query param
  // to the LIST endpoint (/payments/admin/) -- it never actually reached
  // PaymentAdminViewSet's separate `summary` action
  // (/payments/admin/summary/), so `summary` state never populated and
  // the StatCards above silently stayed hidden (they're only rendered
  // `{summary && (...)}`).
  const fetchSummary = useCallback(async () => {
    try {
      const response = await paymentsApi.getPaymentSummary();
      setSummary(response.data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    fetchSummary();
  }, [fetchPayments, fetchSummary]);

  // ដោះស្រាយការផ្លាស់ប្តូរ filters
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  // ដោះស្រាយការផ្លាស់ប្តូរ page
  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // ធ្វើទ្រង់ទ្រាយលុយ
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  // ធ្វើទ្រង់ទ្រាយកាលបរិច្ឆេទ
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !payments.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Payments"
        subtitle="Membership and pay-per-movie payments."
      />

      {/* ស្ថិតិសង្ខេប */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(summary.total_amount)}
            icon="💰"
            trend="+12.5%"
          />
          <StatCard
            title="Today's Payments"
            value={formatCurrency(summary.today_amount)}
            icon="📈"
          />
          <StatCard
            title="Pending Payments"
            value={summary.pending_payments}
            icon="⏳"
            tone="warning"
          />
          <StatCard
            title="Total Transactions"
            value={summary.total_payments}
            icon="🔄"
          />
        </div>
      )}

      {/* តម្រង (Filters) */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by ID, user, email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Type
            </label>
            <select
              name="payment_type"
              value={filters.payment_type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="topup">Wallet Top-up</option>
              <option value="membership">Membership</option>
              <option value="purchase">Movie Purchase</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Items per page
            </label>
            <select
              name="page_size"
              value={filters.page_size}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* តារាងប្រតិបត្តិការ */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          headers={[
            "Payment ID",
            "User",
            "Type",
            "Amount",
            "Status",
            "Date",
            "Actions"
          ]}
          rows={payments.map((payment) => [
            <span className="font-mono text-xs">{payment.reference_id}</span>,
            <div>
              <div className="font-medium">{payment.user?.username || 'N/A'}</div>
              <div className="text-xs text-gray-500">{payment.user?.email}</div>
            </div>,
            <Badge tone={payment.payment_type === 'membership' ? 'info' : 'default'}>
              {payment.payment_type}
            </Badge>,
            <span className="font-medium">
              {formatCurrency(payment.amount, payment.currency)}
            </span>,
            <Badge tone={statusTone(payment.status)}>
              {payment.status}
            </Badge>,
            formatDate(payment.created_at),
            <button
              onClick={() => viewDetails(payment.id)}
              className="text-blue-600 hover:text-blue-800"
            >
              View
            </button>
          ])}
        />
      </div>

      {/* Pagination */}
      {pagination.count > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((filters.page - 1) * filters.page_size) + 1} to{' '}
            {Math.min(filters.page * filters.page_size, pagination.count)} of{' '}
            {pagination.count} payments
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={!pagination.previous}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>

            <button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={!pagination.next}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  function viewDetails(paymentId) {
    // TODO: បង្ហាញ modal ឬ drawer ជាមួយព័ត៌មានលម្អិត
    console.log('View payment:', paymentId);
  }
}