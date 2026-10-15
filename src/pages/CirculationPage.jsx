import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookUp,
  RotateCcw,
  Search,
  Filter,
  Grid,
  List,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  BookOpen,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Bell,
  RefreshCw,
  Trash2,
  Menu,
  DollarSign,
  Plus,
} from 'lucide-react';
import {
  useLibrary,
  formatDisplayDate,
  calculateOverdueDays,
} from '../context/LibraryContext';
import Sidebar from '../components/common/Sidebar';
import {
  IssueBookModal,
  ReturnBookModal,
} from '../components/circulation/CirculationModal';
import QuickActionModals from '../components/dashboard/QuickActionModals';

export default function CirculationPage() {
  const {
    issues,
    members,
    categories,
    renewBook,
    deleteIssueRecord,
    sendOverdueReminder,
  } = useLibrary();

  // Navigation & responsive state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'OVERDUE' | 'RETURNED'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('dueDateAsc'); // 'dueDateAsc' | 'dueDateDesc' | 'issueDateDesc' | 'fineDesc' | 'titleAsc'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Modals state
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [returnRecord, setReturnRecord] = useState(null); // record object for ReturnBookModal
  const [quickActionModal, setQuickActionModal] = useState(null);

  // Filtered & Sorted Issues
  const filteredIssues = useMemo(() => {
    return issues
      .filter((iss) => {
        // Status Tab Filter
        if (statusTab === 'ACTIVE' && iss.status === 'Returned') return false;
        if (statusTab === 'OVERDUE' && iss.status !== 'Overdue') return false;
        if (statusTab === 'RETURNED' && iss.status !== 'Returned') return false;

        // Category Filter
        if (categoryFilter !== 'ALL' && iss.bookCategory !== categoryFilter) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTitle = (iss.bookTitle || '').toLowerCase().includes(q);
          const matchesMember = (iss.memberName || '').toLowerCase().includes(q);
          const matchesId = (iss.membershipId || '').toLowerCase().includes(q);
          const matchesCategory = (iss.bookCategory || '').toLowerCase().includes(q);
          const matchesLoanId = (iss.id || '').toLowerCase().includes(q);
          if (!matchesTitle && !matchesMember && !matchesId && !matchesCategory && !matchesLoanId) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDateAsc') {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        if (sortBy === 'dueDateDesc') {
          return new Date(b.dueDate) - new Date(a.dueDate);
        }
        if (sortBy === 'issueDateDesc') {
          return new Date(b.issueDate) - new Date(a.issueDate);
        }
        if (sortBy === 'fineDesc') {
          return (b.calculatedFine || 0) - (a.calculatedFine || 0);
        }
        if (sortBy === 'titleAsc') {
          return (a.bookTitle || '').localeCompare(b.bookTitle || '');
        }
        return 0;
      });
  }, [issues, statusTab, categoryFilter, searchQuery, sortBy]);

  // Pagination calculation
  const totalItems = filteredIssues.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredIssues.slice(start, start + itemsPerPage);
  }, [filteredIssues, currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // KPI Calculations
  const activeCount = useMemo(() => issues.filter((i) => i.status !== 'Returned').length, [issues]);
  const overdueCount = useMemo(() => issues.filter((i) => i.status === 'Overdue').length, [issues]);
  const returnedCount = useMemo(() => issues.filter((i) => i.status === 'Returned').length, [issues]);
  const totalFineAccrued = useMemo(
    () => issues.reduce((sum, i) => sum + (i.calculatedFine || 0), 0),
    [issues]
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1D1611] flex flex-col lg:flex-row antialiased font-normal">
      {/* Sticky Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Circulation Workspace */}
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
                <span className="text-[#1D1611] font-medium">Circulation & Issues</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1D1611] tracking-tight mt-0.5">
                Issue & Return Books
              </h1>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIssueModalOpen(true)}
              className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-[#E57338] to-[#B84E18] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:brightness-110 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
            >
              <BookUp className="w-4 h-4" />
              <span>Issue Book</span>
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Banner KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Active Loans */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAE0D5] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7C6959]">
                  Active Checked Out
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1D1611] mt-1">
                  {activeCount}
                </h3>
                <p className="text-[11px] text-[#7C6959] mt-0.5">
                  Across {members.length} registered patrons
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#FEF3EB] text-[#E57338] flex items-center justify-center shrink-0">
                <BookUp className="w-5 h-5" />
              </div>
            </div>

            {/* Overdue Loans */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#FECACA] shadow-xs flex items-center justify-between bg-gradient-to-br from-white to-[#FEF2F2]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#991B1B]">
                  Overdue Books
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#DC2626] mt-1">
                  {overdueCount}
                </h3>
                <p className="text-[11px] text-[#B91C1C] mt-0.5">
                  Requires immediate return
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            {/* Returned Archive */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAE0D5] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7C6959]">
                  Total Returned
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#16A34A] mt-1">
                  {returnedCount}
                </h3>
                <p className="text-[11px] text-[#7C6959] mt-0.5">
                  Restocked into inventory
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
            </div>

            {/* Overdue Fines */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAE0D5] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7C6959]">
                  Pending Overdue Fines
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#764B24] mt-1">
                  ${totalFineAccrued.toFixed(2)}
                </h3>
                <p className="text-[11px] text-[#7C6959] mt-0.5">
                  Rate: $5.00/day late penalty
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#FAF0E6] text-[#764B24] flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Controls: Search, Tabs, Filters & View Toggle */}
          <div className="bg-white rounded-2xl border border-[#EAE0D5] p-4 sm:p-5 shadow-xs space-y-4">
            {/* Row 1: Search + Category + Sort + View */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by book title, author, patron name, membership ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9.5 pr-4 py-2 bg-[#FAF7F2] border border-[#E0D5C7] focus:border-[#764B24] focus:bg-white rounded-xl text-xs sm:text-sm text-[#1D1611] placeholder:text-[#A08E80] outline-none transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-[#8C7A6B] hover:text-[#1D1611]"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Filters & View Toggle */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Category Filter */}
                <div className="relative flex items-center">
                  <Filter className="w-3.5 h-3.5 text-[#7C6959] absolute left-3 pointer-events-none" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8 pr-7 py-2 bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-xs text-[#1D1611] font-medium outline-none cursor-pointer hover:border-[#764B24] transition appearance-none"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div className="relative flex items-center">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#7C6959] absolute left-3 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-8 pr-7 py-2 bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-xs text-[#1D1611] font-medium outline-none cursor-pointer hover:border-[#764B24] transition appearance-none"
                  >
                    <option value="dueDateAsc">Due Date: Earliest First</option>
                    <option value="dueDateDesc">Due Date: Latest First</option>
                    <option value="issueDateDesc">Issue Date: Most Recent</option>
                    <option value="fineDesc">Fine Amount: Highest</option>
                    <option value="titleAsc">Book Title: A to Z</option>
                  </select>
                </div>

                {/* View Switcher */}
                <div className="flex items-center bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-white text-[#764B24] shadow-2xs font-semibold'
                        : 'text-[#8C7A6B] hover:text-[#1D1611]'
                    }`}
                    title="Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      viewMode === 'cards'
                        ? 'bg-white text-[#764B24] shadow-2xs font-semibold'
                        : 'text-[#8C7A6B] hover:text-[#1D1611]'
                    }`}
                    title="Card View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
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
                  setStatusTab('ALL');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  statusTab === 'ALL'
                    ? 'bg-[#221209] text-white shadow-xs font-semibold'
                    : 'bg-[#FAF7F2] text-[#5C4B3E] hover:bg-[#EAE0D5]'
                }`}
              >
                <span>All History</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  {issues.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusTab('ACTIVE');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  statusTab === 'ACTIVE'
                    ? 'bg-[#E57338] text-white shadow-xs font-semibold'
                    : 'bg-[#FAF7F2] text-[#5C4B3E] hover:bg-[#EAE0D5]'
                }`}
              >
                <span>Currently Issued</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  {activeCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusTab('OVERDUE');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  statusTab === 'OVERDUE'
                    ? 'bg-[#DC2626] text-white shadow-xs font-semibold'
                    : 'bg-[#FAF7F2] text-[#991B1B] hover:bg-[#FEE2E2]'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Overdue Only</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  {overdueCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusTab('RETURNED');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  statusTab === 'RETURNED'
                    ? 'bg-[#15803D] text-white shadow-xs font-semibold'
                    : 'bg-[#FAF7F2] text-[#15803D] hover:bg-[#DCFCE7]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Returned Archive</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  {returnedCount}
                </span>
              </button>
            </div>
          </div>

          {/* Results Summary & Records */}
          {filteredIssues.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-[#EAE0D5] p-12 text-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#FEF3EB] text-[#E57338] flex items-center justify-center mx-auto mb-4">
                <BookUp className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#1D1611]">No circulation records found</h3>
              <p className="text-xs text-[#7C6959] max-w-sm mx-auto mt-1 mb-5">
                {searchQuery || statusTab !== 'ALL' || categoryFilter !== 'ALL'
                  ? 'No loan records matched your active filters or search terms. Try clearing filters.'
                  : 'Start by issuing a library book to any registered patron in the system.'}
              </p>
              <div className="flex items-center justify-center gap-3">
                {(searchQuery || statusTab !== 'ALL' || categoryFilter !== 'ALL') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusTab('ALL');
                      setCategoryFilter('ALL');
                    }}
                    className="px-4 py-2 rounded-xl border border-[#DED4C8] text-xs font-medium text-[#7C6959] hover:bg-[#FAF7F2] transition cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIssueModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#E57338] text-white text-xs font-semibold hover:bg-[#C95B24] transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Issue First Book</span>
                </button>
              </div>
            </div>
          ) : viewMode === 'table' ? (
            /* Table View */
            <div className="bg-white rounded-2xl border border-[#EAE0D5] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-[#EAE0D5] text-[11px] font-semibold uppercase tracking-wider text-[#7C6959]">
                      <th className="py-3.5 px-4">Book Title & Cover</th>
                      <th className="py-3.5 px-4">Patron / Member</th>
                      <th className="py-3.5 px-4">Issue Date</th>
                      <th className="py-3.5 px-4">Return Due Date</th>
                      <th className="py-3.5 px-4">Status & Fine</th>
                      <th className="py-3.5 px-4 text-right">Circulation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E6DC]">
                    {paginatedIssues.map((iss) => {
                      const isOverdue = iss.status === 'Overdue';
                      const isReturned = iss.status === 'Returned';
                      const overdueDays = calculateOverdueDays(iss.dueDate);

                      return (
                        <tr
                          key={iss.id}
                          className="hover:bg-[#FAF7F2]/80 transition group"
                        >
                          {/* Book Details */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {iss.bookCover ? (
                                <img
                                  src={iss.bookCover}
                                  alt={iss.bookTitle}
                                  className="w-8 h-11 object-cover rounded shadow-2xs shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-11 rounded bg-[#EAE0D5] flex items-center justify-center text-[#7C6959] shrink-0">
                                  <BookOpen className="w-4 h-4" />
                                </div>
                              )}
                              <div className="min-w-0 max-w-[200px]">
                                <Link
                                  to={`/books/${iss.bookId}`}
                                  className="font-semibold text-xs text-[#1D1611] hover:text-[#764B24] transition truncate block"
                                  title={iss.bookTitle}
                                >
                                  {iss.bookTitle}
                                </Link>
                                <span className="text-[10.5px] px-1.5 py-0.5 rounded-full bg-[#FAF0E6] text-[#764B24] font-medium inline-block mt-0.5">
                                  {iss.bookCategory}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Member Details */}
                          <td className="py-3 px-4">
                            <div>
                              <Link
                                to={`/members/${iss.memberId}`}
                                className="font-semibold text-xs text-[#1D1611] hover:text-[#764B24] transition block"
                              >
                                {iss.memberName}
                              </Link>
                              <span className="font-mono text-[10.5px] text-[#7C6959] block">
                                ID: {iss.membershipId}
                              </span>
                            </div>
                          </td>

                          {/* Issue Date */}
                          <td className="py-3 px-4 text-[#5C4B3E]">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#8C7A6B]" />
                              <span>{formatDisplayDate(iss.issueDate)}</span>
                            </div>
                          </td>

                          {/* Due Date & Return Date */}
                          <td className="py-3 px-4">
                            <div>
                              <div className="flex items-center gap-1.5 font-medium">
                                <Clock
                                  className={`w-3.5 h-3.5 ${
                                    isOverdue ? 'text-[#DC2626]' : 'text-[#8C7A6B]'
                                  }`}
                                />
                                <span
                                  className={
                                    isOverdue
                                      ? 'text-[#DC2626] font-bold'
                                      : 'text-[#1D1611]'
                                  }
                                >
                                  {formatDisplayDate(iss.dueDate)}
                                </span>
                              </div>

                              {isReturned && iss.returnDate && (
                                <span className="text-[10.5px] text-[#15803D] block mt-0.5">
                                  Returned on {formatDisplayDate(iss.returnDate)}
                                </span>
                              )}
                              {!isReturned && isOverdue && (
                                <span className="text-[10.5px] text-[#DC2626] font-semibold block mt-0.5">
                                  {iss.overdueDays || overdueDays} days late
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status & Overdue Fine */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              {isReturned ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#DCFCE7] text-[#15803D]">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Returned
                                </span>
                              ) : isOverdue ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#FEE2E2] text-[#B91C1C]">
                                  <AlertTriangle className="w-3 h-3" />
                                  Overdue
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#FEF3EB] text-[#C05621]">
                                  <BookUp className="w-3 h-3" />
                                  Issued
                                </span>
                              )}

                              {/* Fine Info */}
                              {iss.calculatedFine > 0 && (
                                <div className="text-[10.5px] font-medium text-[#B91C1C] flex items-center gap-0.5">
                                  <span>Fine: ${iss.calculatedFine.toFixed(2)}</span>
                                  {iss.finePaid && (
                                    <span className="text-[#15803D] font-bold">(Paid)</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isReturned ? (
                                <>
                                  {/* Return Button */}
                                  <button
                                    type="button"
                                    onClick={() => setReturnRecord(iss)}
                                    className="px-2.5 py-1.5 rounded-lg bg-[#15803D] text-white text-[11px] font-semibold hover:bg-[#166534] transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                    title="Return Book & Restock Copy"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Return</span>
                                  </button>

                                  {/* Renew Button */}
                                  <button
                                    type="button"
                                    onClick={() => renewBook(iss.id, 14)}
                                    className="px-2 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE0D5] border border-[#DED4C8] text-[11px] font-medium text-[#5C4B3E] transition cursor-pointer"
                                    title="Renew Loan (+14 Days)"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                  </button>

                                  {/* Overdue Reminder */}
                                  {isOverdue && (
                                    <button
                                      type="button"
                                      onClick={() => sendOverdueReminder(iss.id)}
                                      className="p-1.5 rounded-lg bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA] transition cursor-pointer"
                                      title="Send Overdue Reminder"
                                    >
                                      <Bell className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </>
                              ) : (
                                <>
                                  <span className="text-[11px] text-[#7C6959] italic px-2">
                                    Archived
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => deleteIssueRecord(iss.id)}
                                    className="p-1.5 rounded-lg text-[#A08E80] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition cursor-pointer"
                                    title="Delete Archived Record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
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
          ) : (
            /* Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedIssues.map((iss) => {
                const isOverdue = iss.status === 'Overdue';
                const isReturned = iss.status === 'Returned';
                const overdueDays = calculateOverdueDays(iss.dueDate);

                return (
                  <div
                    key={iss.id}
                    className={`bg-white rounded-2xl border p-4.5 shadow-xs flex flex-col justify-between transition hover:shadow-md ${
                      isOverdue
                        ? 'border-[#FECACA] bg-gradient-to-b from-white to-[#FEF2F2]/40'
                        : isReturned
                        ? 'border-[#EAE0D5] opacity-90'
                        : 'border-[#EAE0D5]'
                    }`}
                  >
                    <div>
                      {/* Top Header: Loan ID & Status Pill */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#F0E6DC] text-xs">
                        <span className="font-mono text-[11px] text-[#7C6959]">
                          Loan #{iss.id.slice(-6)}
                        </span>
                        {isReturned ? (
                          <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#DCFCE7] text-[#15803D] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Returned
                          </span>
                        ) : isOverdue ? (
                          <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#FEE2E2] text-[#B91C1C] flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Overdue
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#FEF3EB] text-[#C05621] flex items-center gap-1">
                            <BookUp className="w-3 h-3" /> Issued
                          </span>
                        )}
                      </div>

                      {/* Book Thumbnail + Info */}
                      <div className="flex items-start gap-3 py-3">
                        {iss.bookCover ? (
                          <img
                            src={iss.bookCover}
                            alt={iss.bookTitle}
                            className="w-12 h-16 object-cover rounded-lg shadow-xs shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-16 rounded-lg bg-[#EAE0D5] flex items-center justify-center text-[#7C6959] shrink-0">
                            <BookOpen className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            to={`/books/${iss.bookId}`}
                            className="font-bold text-xs text-[#1D1611] hover:text-[#764B24] transition line-clamp-1"
                          >
                            {iss.bookTitle}
                          </Link>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FAF0E6] text-[#764B24] font-medium inline-block mt-1">
                            {iss.bookCategory}
                          </span>
                          <div className="mt-2 text-xs text-[#5C4B3E]">
                            <span className="text-[11px] text-[#7C6959]">Patron:</span>{' '}
                            <Link
                              to={`/members/${iss.memberId}`}
                              className="font-semibold text-[#1D1611] hover:text-[#764B24]"
                            >
                              {iss.memberName}
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Dates Box */}
                      <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE0D5] text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-[#7C6959]">Issue Date:</span>
                          <strong className="text-[#1D1611]">
                            {formatDisplayDate(iss.issueDate)}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-[#7C6959]">Return Due Date:</span>
                          <strong
                            className={
                              isOverdue ? 'text-[#DC2626] font-bold' : 'text-[#1D1611]'
                            }
                          >
                            {formatDisplayDate(iss.dueDate)}
                          </strong>
                        </div>
                        {isReturned && iss.returnDate && (
                          <div className="flex items-center justify-between pt-1 border-t border-[#EAE0D5]">
                            <span className="text-[11px] text-[#15803D]">Returned On:</span>
                            <strong className="text-[#15803D]">
                              {formatDisplayDate(iss.returnDate)}
                            </strong>
                          </div>
                        )}
                        {isOverdue && (
                          <div className="flex items-center justify-between pt-1 border-t border-[#FECACA] text-[#DC2626]">
                            <span className="text-[11px] font-semibold">Late Penalty:</span>
                            <span className="font-bold">
                              ${(iss.calculatedFine || 0).toFixed(2)} ({iss.overdueDays || overdueDays}d)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-3 mt-3 border-t border-[#F0E6DC] flex items-center justify-between gap-2">
                      {!isReturned ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setReturnRecord(iss)}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-[#15803D] text-white text-xs font-semibold hover:bg-[#166534] transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Return Book</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => renewBook(iss.id, 14)}
                            className="p-1.5 rounded-xl border border-[#DED4C8] bg-white hover:bg-[#FAF7F2] text-[#5C4B3E] transition cursor-pointer"
                            title="Renew for 14 Days"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          {isOverdue && (
                            <button
                              type="button"
                              onClick={() => sendOverdueReminder(iss.id)}
                              className="p-1.5 rounded-xl bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA] transition cursor-pointer"
                              title="Send Reminder"
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="w-full flex items-center justify-between">
                          <span className="text-[11px] text-[#7C6959] italic">
                            Transaction Archived
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteIssueRecord(iss.id)}
                            className="p-1.5 rounded-lg text-[#A08E80] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition cursor-pointer"
                            title="Delete Archived Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {filteredIssues.length > 0 && (
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
                  of <strong className="text-[#1D1611]">{totalItems}</strong> circulation records
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

      {/* Circulation Modals */}
      <IssueBookModal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
      />

      <ReturnBookModal
        isOpen={Boolean(returnRecord)}
        onClose={() => setReturnRecord(null)}
        issueRecord={returnRecord}
      />

      <QuickActionModals
        activeModal={quickActionModal}
        onClose={() => setQuickActionModal(null)}
      />
    </div>
  );
}
