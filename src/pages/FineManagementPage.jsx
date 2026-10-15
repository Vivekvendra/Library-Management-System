import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Receipt,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  BookOpen,
  Calendar,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  Eye,
  ShieldCheck,
  ArrowUpDown,
} from 'lucide-react';
import {
  useLibrary,
  formatDisplayDate,
  calculateOverdueDays,
} from '../context/LibraryContext';
import Sidebar from '../components/common/Sidebar';
import {
  PayFineModal,
  WaiveFineModal,
  ReceiptModal,
} from '../components/fines/FineModal';
import { ReturnBookModal } from '../components/circulation/CirculationModal';

export default function FineManagementPage() {
  const {
    issues,
    collectedFineHistory,
    sendOverdueReminder,
  } = useLibrary();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search & Filters
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'UNPAID' | 'PAID' | 'WAIVED' | 'OVERDUE_BOOKS'
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'highest' | 'lowest' | 'name'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Modals state
  const [payModalIssue, setPayModalIssue] = useState(null);
  const [waiveModalIssue, setWaiveModalIssue] = useState(null);
  const [receiptRecord, setReceiptRecord] = useState(null);
  const [returnRecord, setReturnRecord] = useState(null);

  // Overdue Active Loans
  const overdueIssues = useMemo(() => {
    return issues.filter((i) => i.status === 'Overdue' && i.calculatedFine > 0 && !i.finePaid);
  }, [issues]);

  // Unified Fine Records list combining Unpaid active fines + Paid/Waived collectedFineHistory
  const unifiedRecords = useMemo(() => {
    // 1. Pending/Unpaid Fines from active overdue loans
    const pendingFines = overdueIssues.map((iss) => ({
      id: `pending-${iss.id}`,
      issueId: iss.id,
      receiptNumber: `PENDING-${iss.id.slice(-4)}`,
      memberId: iss.memberId,
      memberName: iss.memberName,
      membershipId: iss.membershipId,
      bookId: iss.bookId,
      bookTitle: iss.bookTitle,
      bookCover: iss.bookCover,
      bookCategory: iss.bookCategory,
      amount: iss.calculatedFine || 0,
      overdueDays: iss.overdueDays || calculateOverdueDays(iss.dueDate),
      dueDate: iss.dueDate,
      issueDate: iss.issueDate,
      paymentMethod: 'Unpaid',
      paymentStatus: 'Unpaid',
      paidAt: null,
      notes: `${iss.overdueDays} days late penalty accrued`,
      rawIssue: iss,
    }));

    // 2. Paid / Waived records from collectedFineHistory
    const historyRecords = collectedFineHistory.map((hist) => ({
      ...hist,
      paymentStatus: hist.paymentStatus || 'Paid',
      paymentMethod: hist.paymentMethod || 'Cash',
      receiptNumber: hist.receiptNumber || hist.id,
      notes: hist.notes || 'Settled fine record',
    }));

    return [...pendingFines, ...historyRecords];
  }, [overdueIssues, collectedFineHistory]);

  // Filtered & Sorted Records
  const filteredRecords = useMemo(() => {
    return unifiedRecords
      .filter((rec) => {
        // Status tab filter
        if (statusFilter === 'UNPAID' && rec.paymentStatus !== 'Unpaid') return false;
        if (statusFilter === 'PAID' && rec.paymentStatus !== 'Paid') return false;
        if (statusFilter === 'WAIVED' && rec.paymentStatus !== 'Waived') return false;
        if (statusFilter === 'OVERDUE_BOOKS' && rec.paymentStatus !== 'Unpaid') return false;

        // Payment Method filter
        if (
          paymentMethodFilter !== 'ALL' &&
          rec.paymentMethod !== paymentMethodFilter
        ) {
          return false;
        }

        // Search by Member Name, Membership ID, or Book Title
        if (searchMemberQuery.trim()) {
          const q = searchMemberQuery.toLowerCase().trim();
          const matchesMember = (rec.memberName || '').toLowerCase().includes(q);
          const matchesId = (rec.membershipId || '').toLowerCase().includes(q);
          const matchesTitle = (rec.bookTitle || '').toLowerCase().includes(q);
          const matchesReceipt = (rec.receiptNumber || '').toLowerCase().includes(q);
          if (!matchesMember && !matchesId && !matchesTitle && !matchesReceipt) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          const dateA = a.paidAt ? new Date(a.paidAt) : new Date();
          const dateB = b.paidAt ? new Date(b.paidAt) : new Date();
          return dateB - dateA;
        }
        if (sortBy === 'highest') {
          return (Number(b.amount) || 0) - (Number(a.amount) || 0);
        }
        if (sortBy === 'lowest') {
          return (Number(a.amount) || 0) - (Number(b.amount) || 0);
        }
        if (sortBy === 'name') {
          return (a.memberName || '').localeCompare(b.memberName || '');
        }
        return 0;
      });
  }, [unifiedRecords, statusFilter, paymentMethodFilter, searchMemberQuery, sortBy]);

  // Pagination calculation
  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // KPIs
  const totalFinesCollected = useMemo(() => {
    return collectedFineHistory
      .filter((f) => f.paymentStatus !== 'Waived')
      .reduce((sum, f) => sum + Number(f.amount || 0), 0);
  }, [collectedFineHistory]);

  const totalPendingFines = useMemo(() => {
    return overdueIssues.reduce((sum, i) => sum + Number(i.calculatedFine || 0), 0);
  }, [overdueIssues]);

  const paidCount = useMemo(
    () => collectedFineHistory.filter((f) => f.paymentStatus !== 'Waived').length,
    [collectedFineHistory]
  );
  const waivedCount = useMemo(
    () => collectedFineHistory.filter((f) => f.paymentStatus === 'Waived').length,
    [collectedFineHistory]
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1D1611] flex flex-col lg:flex-row antialiased font-normal">
      {/* Sticky Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EAE0D5] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#7C6959] hover:bg-[#EAE0D5] transition cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-[#7C6959]">
                <Link to="/dashboard" className="hover:text-[#764B24] transition">
                  Dashboard
                </Link>
                <span>/</span>
                <span className="text-[#1D1611] font-medium">Fine Calculation</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1D1611] tracking-tight mt-0.5">
                Library Fines & Penalty Management
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EAE0D5] text-xs font-semibold text-[#764B24]">
              <DollarSign className="w-3.5 h-3.5 text-[#15803D]" />
              Rate: $5.00 / day
            </span>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Banner KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Collected Fines */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DCFCE7] shadow-xs flex items-center justify-between bg-gradient-to-br from-white to-[#F4FDF7]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#166534]">
                  Total Fines Collected
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#15803D] mt-1">
                  ${totalFinesCollected.toFixed(2)}
                </h3>
                <p className="text-[11px] text-[#166534] mt-0.5">
                  Across {paidCount} completed receipts
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Pending Overdue Penalties */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#FECACA] shadow-xs flex items-center justify-between bg-gradient-to-br from-white to-[#FEF2F2]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#991B1B]">
                  Pending Overdue Fines
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#DC2626] mt-1">
                  ${totalPendingFines.toFixed(2)}
                </h3>
                <p className="text-[11px] text-[#B91C1C] mt-0.5">
                  {overdueIssues.length} books past return date
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            {/* Overdue Accounts Count */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAE0D5] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7C6959]">
                  Overdue Accounts
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1D1611] mt-1">
                  {overdueIssues.length}
                </h3>
                <p className="text-[11px] text-[#7C6959] mt-0.5">
                  Unsettled patron loans
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#FEF3EB] text-[#E57338] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* Waived Penalties */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAE0D5] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7C6959]">
                  Waived Exemptions
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#764B24] mt-1">
                  {waivedCount}
                </h3>
                <p className="text-[11px] text-[#7C6959] mt-0.5">
                  Official courtesy waivers
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#FAF0E6] text-[#764B24] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Controls: Search, Tabs, Filters */}
          <div className="bg-white rounded-2xl border border-[#EAE0D5] p-4 sm:p-5 shadow-xs space-y-4">
            {/* Row 1: Search by Member + Payment Method + Sort */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search by Member */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by patron name, membership ID, book title, or receipt #..."
                  value={searchMemberQuery}
                  onChange={(e) => {
                    setSearchMemberQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9.5 pr-4 py-2 bg-[#FAF7F2] border border-[#E0D5C7] focus:border-[#764B24] focus:bg-white rounded-xl text-xs sm:text-sm text-[#1D1611] placeholder:text-[#A08E80] outline-none transition"
                />
                {searchMemberQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchMemberQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-[#8C7A6B] hover:text-[#1D1611]"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Payment Mode & Sorting */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative flex items-center">
                  <Filter className="w-3.5 h-3.5 text-[#7C6959] absolute left-3 pointer-events-none" />
                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => {
                      setPaymentMethodFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8 pr-7 py-2 bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-xs text-[#1D1611] font-medium outline-none cursor-pointer hover:border-[#764B24] transition appearance-none"
                  >
                    <option value="ALL">All Payment Methods</option>
                    <option value="Cash">Cash Desk</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="UPI / Online">UPI / Online</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Waived">Waived</option>
                  </select>
                </div>

                <div className="relative flex items-center">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#7C6959] absolute left-3 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-8 pr-7 py-2 bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-xs text-[#1D1611] font-medium outline-none cursor-pointer hover:border-[#764B24] transition appearance-none"
                  >
                    <option value="newest">Newest Records</option>
                    <option value="highest">Fine Amount: Highest</option>
                    <option value="lowest">Fine Amount: Lowest</option>
                    <option value="name">Member Name: A to Z</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 2: Status Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F0E6DC]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7C6959] mr-1">
                Filter by Status:
              </span>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('ALL');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'ALL'
                    ? 'bg-[#221209] text-white shadow-xs font-semibold'
                    : 'bg-[#FAF7F2] text-[#5C4B3E] hover:bg-[#EAE0D5]'
                }`}
              >
                <span>All Fines</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  {unifiedRecords.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('UNPAID');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'UNPAID'
                    ? 'bg-[#DC2626] text-white shadow-xs font-semibold'
                    : 'bg-[#FAF7F2] text-[#991B1B] hover:bg-[#FEE2E2]'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Pending / Unpaid</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  {overdueIssues.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('PAID');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'PAID'
                    ? 'bg-[#15803D] text-white shadow-xs font-semibold'
                    : 'bg-[#FAF7F2] text-[#15803D] hover:bg-[#DCFCE7]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Paid History</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  {paidCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('WAIVED');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'WAIVED'
                    ? 'bg-[#764B24] text-white shadow-xs font-semibold'
                    : 'bg-[#FAF7F2] text-[#764B24] hover:bg-[#FAF0E6]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Waived</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  {waivedCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('OVERDUE_BOOKS');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'OVERDUE_BOOKS'
                    ? 'bg-[#B45309] text-white shadow-xs font-semibold'
                    : 'bg-[#FAF7F2] text-[#B45309] hover:bg-[#FEF3C7]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Overdue Books List</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  {overdueIssues.length}
                </span>
              </button>
            </div>
          </div>

          {/* Records Table */}
          {filteredRecords.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-[#EAE0D5] p-12 text-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#1D1611]">No fine records found</h3>
              <p className="text-xs text-[#7C6959] max-w-sm mx-auto mt-1 mb-5">
                {searchMemberQuery || statusFilter !== 'ALL' || paymentMethodFilter !== 'ALL'
                  ? 'No records matched your search terms or active filters. Try clearing your search.'
                  : 'All patrons are in good standing with zero overdue fines pending.'}
              </p>
              {(searchMemberQuery || statusFilter !== 'ALL' || paymentMethodFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchMemberQuery('');
                    setStatusFilter('ALL');
                    setPaymentMethodFilter('ALL');
                  }}
                  className="px-4 py-2 rounded-xl border border-[#DED4C8] text-xs font-medium text-[#7C6959] hover:bg-[#FAF7F2] transition cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#EAE0D5] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-[#EAE0D5] text-[11px] font-semibold uppercase tracking-wider text-[#7C6959]">
                      <th className="py-3.5 px-4">Receipt / Ref #</th>
                      <th className="py-3.5 px-4">Patron / Member</th>
                      <th className="py-3.5 px-4">Book Title</th>
                      <th className="py-3.5 px-4">Fine Amount</th>
                      <th className="py-3.5 px-4">Status & Mode</th>
                      <th className="py-3.5 px-4">Date / Due Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E6DC]">
                    {paginatedRecords.map((rec) => {
                      const isUnpaid = rec.paymentStatus === 'Unpaid';
                      const isPaid = rec.paymentStatus === 'Paid';
                      const isWaived = rec.paymentStatus === 'Waived';

                      return (
                        <tr
                          key={rec.id}
                          className="hover:bg-[#FAF7F2]/80 transition group"
                        >
                          {/* Receipt Number */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Receipt className="w-3.5 h-3.5 text-[#7C6959] shrink-0" />
                              <span className="font-mono text-xs font-semibold text-[#764B24]">
                                {rec.receiptNumber}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#8C7A6B] block mt-0.5">
                              {rec.notes || 'Fine calculation'}
                            </span>
                          </td>

                          {/* Member */}
                          <td className="py-3 px-4">
                            <div>
                              <Link
                                to={rec.memberId ? `/members/${rec.memberId}` : '#'}
                                className="font-semibold text-xs text-[#1D1611] hover:text-[#764B24] transition block"
                              >
                                {rec.memberName}
                              </Link>
                              <span className="font-mono text-[10.5px] text-[#7C6959] block">
                                ID: {rec.membershipId || 'N/A'}
                              </span>
                            </div>
                          </td>

                          {/* Book */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5 max-w-[220px]">
                              {rec.bookCover && (
                                <img
                                  src={rec.bookCover}
                                  alt={rec.bookTitle}
                                  className="w-7 h-10 object-cover rounded shadow-2xs shrink-0"
                                />
                              )}
                              <div className="min-w-0">
                                <Link
                                  to={rec.bookId ? `/books/${rec.bookId}` : '#'}
                                  className="font-semibold text-xs text-[#1D1611] hover:text-[#764B24] transition truncate block"
                                  title={rec.bookTitle}
                                >
                                  {rec.bookTitle}
                                </Link>
                                {rec.overdueDays !== undefined && (
                                  <span className="text-[10.5px] text-[#DC2626] font-medium block">
                                    {rec.overdueDays} days overdue
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Fine Amount */}
                          <td className="py-3 px-4">
                            <span
                              className={`text-sm font-bold block ${
                                isUnpaid
                                  ? 'text-[#DC2626]'
                                  : isPaid
                                  ? 'text-[#15803D]'
                                  : 'text-[#7C6959] line-through'
                              }`}
                            >
                              ${Number(rec.amount || 0).toFixed(2)}
                            </span>
                            {rec.originalAmount !== undefined && isWaived && (
                              <span className="text-[10px] text-[#7C6959] block">
                                Waived (${Number(rec.originalAmount).toFixed(2)})
                              </span>
                            )}
                          </td>

                          {/* Status & Payment Mode */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              {isUnpaid ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#FEE2E2] text-[#B91C1C]">
                                  <AlertTriangle className="w-3 h-3" />
                                  Unpaid / Pending
                                </span>
                              ) : isPaid ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#DCFCE7] text-[#15803D]">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Paid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#FAF0E6] text-[#764B24]">
                                  <ShieldCheck className="w-3 h-3" />
                                  Waived
                                </span>
                              )}

                              {!isUnpaid && rec.paymentMethod && (
                                <span className="text-[10.5px] text-[#7C6959] block font-medium">
                                  via {rec.paymentMethod}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-3 px-4 text-[#5C4B3E]">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#8C7A6B]" />
                              <span>
                                {rec.paidAt
                                  ? formatDisplayDate(rec.paidAt)
                                  : rec.dueDate
                                  ? `Due ${formatDisplayDate(rec.dueDate)}`
                                  : 'Active'}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isUnpaid ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setPayModalIssue(rec.rawIssue)}
                                    className="px-2.5 py-1.5 rounded-lg bg-[#15803D] text-white text-[11px] font-semibold hover:bg-[#166534] transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                    title="Collect / Pay Fine"
                                  >
                                    <DollarSign className="w-3 h-3" />
                                    <span>Pay Fine</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setWaiveModalIssue(rec.rawIssue)}
                                    className="px-2 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#FAF0E6] border border-[#DED4C8] text-[11px] font-medium text-[#764B24] transition cursor-pointer"
                                    title="Waive Fine"
                                  >
                                    <span>Waive</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => sendOverdueReminder(rec.issueId)}
                                    className="p-1.5 rounded-lg bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA] transition cursor-pointer"
                                    title="Send Payment Reminder"
                                  >
                                    <Bell className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setReturnRecord(rec.rawIssue)}
                                    className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE0D5] border border-[#DED4C8] text-[#5C4B3E] transition cursor-pointer"
                                    title="Process Book Return"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setReceiptRecord(rec)}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE0D5] border border-[#DED4C8] text-[11px] font-semibold text-[#764B24] transition cursor-pointer flex items-center gap-1"
                                  title="View Official Receipt"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Receipt</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredRecords.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#EAE0D5] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7C6959]">
              <div className="flex items-center gap-2">
                <span>
                  Showing{' '}
                  <strong className="text-[#1D1611]">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </strong>{' '}
                  to{' '}
                  <strong className="text-[#1D1611]">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </strong>{' '}
                  of <strong className="text-[#1D1611]">{totalItems}</strong> records
                </span>
                <span className="hidden sm:inline">•</span>
                <div className="hidden sm:flex items-center gap-1.5">
                  <span>Per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg px-2 py-1 text-xs text-[#1D1611] font-semibold outline-none cursor-pointer"
                  >
                    <option value={6}>6</option>
                    <option value={8}>8</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                  </select>
                </div>
              </div>

              {/* Prev / Next buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-[#DED4C8] hover:bg-[#FAF7F2] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4 text-[#1D1611]" />
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((page, idx, arr) => {
                      const prev = arr[idx - 1];
                      return (
                        <div key={page} className="flex items-center">
                          {prev && page - prev > 1 && (
                            <span className="px-1 text-[#8C7A6B]">...</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handlePageChange(page)}
                            className={`w-7 h-7 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              currentPage === page
                                ? 'bg-[#764B24] text-white shadow-xs'
                                : 'hover:bg-[#FAF7F2] text-[#5C4B3E]'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-[#DED4C8] hover:bg-[#FAF7F2] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4 text-[#1D1611]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <PayFineModal
        isOpen={Boolean(payModalIssue)}
        onClose={() => setPayModalIssue(null)}
        issueRecord={payModalIssue}
      />

      <WaiveFineModal
        isOpen={Boolean(waiveModalIssue)}
        onClose={() => setWaiveModalIssue(null)}
        issueRecord={waiveModalIssue}
      />

      <ReceiptModal
        isOpen={Boolean(receiptRecord)}
        onClose={() => setReceiptRecord(null)}
        receiptRecord={receiptRecord}
      />

      <ReturnBookModal
        isOpen={Boolean(returnRecord)}
        onClose={() => setReturnRecord(null)}
        issueRecord={returnRecord}
      />
    </div>
  );
}
