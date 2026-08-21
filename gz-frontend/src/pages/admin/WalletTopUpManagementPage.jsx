// src/pages/admin/WalletTopUpManagementPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, 
  Search, 
  Filter, 
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import SectionHeader from "../../components/common/SectionHeader";
import Table from "../../components/common/Table";
import Badge, { statusTone } from "../../components/common/Badge";
import StatCard from "../../components/common/StatCard";
import adminApi from "../../api/adminApi";
import { useDebounce } from "../../hooks/useDebounce";

export default function WalletTopUpManagementPage() {
  // ============ STATE ============
  const [topups, setTopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  
  const debouncedSearch = useDebounce(search, 500);
  const PAGE_SIZE = 20;

  // ============ FETCH DATA ============
  const fetchTopups = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        page_size: PAGE_SIZE,
      };
      
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.method = methodFilter;
      
      // TODO: ហៅ API ពិតប្រាកដ
      // const res = await adminApi.getWalletTopups(params);
      
      // សម្រាប់ពេលនេះ ប្រើទិន្នន័យសាកល្បង
      const mockData = [
        { 
          id: 'TXN-001', 
          user: 'superchha', 
          user_email: 'superchha@gmail.com',
          amount: 10.00, 
          method: 'KHQR', 
          status: 'completed', 
          date: '2026-08-20T10:30:00Z' 
        },
        { 
          id: 'TXN-002', 
          user: 'sokha', 
          user_email: 'sokha@gmail.com',
          amount: 20.00, 
          method: 'Bakong', 
          status: 'pending', 
          date: '2026-08-20T09:15:00Z' 
        },
        { 
          id: 'TXN-003', 
          user: 'dara', 
          user_email: 'dara@gmail.com',
          amount: 50.00, 
          method: 'KHQR', 
          status: 'completed', 
          date: '2026-08-19T14:45:00Z' 
        },
        { 
          id: 'TXN-004', 
          user: 'sreyneang', 
          user_email: 'sreyneang@gmail.com',
          amount: 100.00, 
          method: 'Bakong', 
          status: 'failed', 
          date: '2026-08-19T11:20:00Z' 
        },
        { 
          id: 'TXN-005', 
          user: 'vuthy', 
          user_email: 'vuthy@gmail.com',
          amount: 5.00, 
          method: 'KHQR', 
          status: 'completed', 
          date: '2026-08-18T16:00:00Z' 
        },
      ];
      
      setTopups(mockData);
      setPagination({
        count: mockData.length,
        next: null,
        previous: null,
      });
      
      // Summary
      setSummary({
        total_topups: mockData.length,
        total_amount: mockData.reduce((sum, t) => sum + t.amount, 0),
        completed: mockData.filter(t => t.status === 'completed').length,
        pending: mockData.filter(t => t.status === 'pending').length,
        failed: mockData.filter(t => t.status === 'failed').length,
      });
      
    } catch (err) {
      console.error('Error fetching topups:', err);
      setError('មិនអាចទាញយកទិន្នន័យបានទេ');
      setTopups([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, methodFilter]);

  useEffect(() => {
    fetchTopups();
  }, [fetchTopups]);

  // ============ HANDLERS ============
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleMethodChange = (e) => {
    setMethodFilter(e.target.value);
    setPage(1);
  };

  const handleRefresh = () => {
    fetchTopups();
  };

  // ============ HELPERS ============
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('km-KH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge tone="jade"><CheckCircle2 size={12} className="mr-1" /> បានបញ្ចប់</Badge>;
      case 'pending':
        return <Badge tone="gold"><Clock size={12} className="mr-1" /> កំពុងរង់ចាំ</Badge>;
      case 'failed':
        return <Badge tone="crimson"><XCircle size={12} className="mr-1" /> បរាជ័យ</Badge>;
      default:
        return <Badge tone="muted">{status}</Badge>;
    }
  };

  const getMethodBadge = (method) => {
    switch (method) {
      case 'KHQR':
        return <Badge tone="info"><i className="bi bi-qr-code mr-1"></i> KHQR</Badge>;
      case 'Bakong':
        return <Badge tone="violet"><i className="bi bi-bank mr-1"></i> Bakong</Badge>;
      default:
        return <Badge tone="muted">{method}</Badge>;
    }
  };

  // ============ LOADING STATE ============
  if (loading && topups.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="animate-spin text-amber-400 mx-auto mb-3" size={32} />
          <p className="text-slate-400 text-sm">កំពុងផ្ទុកទិន្នន័យ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader 
        title="Wallet Top-ups" 
        subtitle="ABA KHQR and Bakong top-up transactions."
        action={
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        }
      />

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={<Wallet size={20} className="text-blue-400" />}
            label="ប្រតិបត្តិការសរុប"
            value={summary.total_topups}
          />
          <StatCard
            icon={<TrendingUp size={20} className="text-emerald-400" />}
            label="ចំនួនសរុប"
            value={formatCurrency(summary.total_amount)}
          />
          <StatCard
            icon={<CheckCircle2 size={20} className="text-green-400" />}
            label="បានបញ្ចប់"
            value={summary.completed}
          />
          <StatCard
            icon={<Clock size={20} className="text-yellow-400" />}
            label="កំពុងរង់ចាំ"
            value={summary.pending}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="ស្វែងរកដោយ Transaction ID, User..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm px-4 py-2.5 focus:outline-none focus:border-amber-500"
          >
            <option value="">គ្រប់ស្ថានភាព</option>
            <option value="completed">បានបញ្ចប់</option>
            <option value="pending">កំពុងរង់ចាំ</option>
            <option value="failed">បរាជ័យ</option>
          </select>
          
          <select
            value={methodFilter}
            onChange={handleMethodChange}
            className="bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm px-4 py-2.5 focus:outline-none focus:border-amber-500"
          >
            <option value="">គ្រប់វិធីទូទាត់</option>
            <option value="KHQR">KHQR</option>
            <option value="Bakong">Bakong</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <Table
          headers={[
            "Transaction", 
            "User", 
            "Amount", 
            "Method", 
            "Status", 
            "Date",
            "Action"
          ]}
          rows={topups.map((t) => [
            <span className="font-mono text-xs text-slate-400">{t.id}</span>,
            <div>
              <div className="text-slate-200 font-medium">{t.user}</div>
              <div className="text-xs text-slate-500">{t.user_email}</div>
            </div>,
            <span className="font-bold text-emerald-400">{formatCurrency(t.amount)}</span>,
            getMethodBadge(t.method),
            getStatusBadge(t.status),
            formatDate(t.date),
            <button
              onClick={() => console.log('View transaction:', t.id)}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs"
            >
              <Eye size={14} /> មើល
            </button>
          ])}
        />
      </div>

      {/* Pagination */}
      {pagination.count > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            សរុប {pagination.count} ប្រតិបត្តិការ
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.previous}
              className="px-3 py-2 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
            >
              មុន
            </button>
            <span className="px-3 py-2 text-sm text-slate-400">
              ទំព័រ {page}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.next}
              className="px-3 py-2 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
            >
              បន្ទាប់
            </button>
          </div>
        </div>
      )}
    </div>
  );
}