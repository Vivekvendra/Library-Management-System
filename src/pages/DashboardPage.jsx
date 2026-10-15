import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  BookUp,
  CheckSquare,
  AlertTriangle,
  Clock,
  Plus,
  UserPlus,
  RotateCcw,
  RefreshCw,
  LogOut,
  Search,
  Menu,
  Bell,
  ChevronDown,
  BarChart3,
  Shapes,
  Archive,
  Zap,
  ArrowRight,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLibrary, formatDisplayDate } from '../context/LibraryContext';
import Sidebar from '../components/common/Sidebar';
import QuickActionModals from '../components/dashboard/QuickActionModals';

function formatRelativeTime(isoString) {
  if (!isoString) return 'Just now';
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} mins ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr === 1) return '1 hour ago';
  if (diffHr < 24) return `${diffHr} hours ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

function CategoryDonutChart({ breakdown, totalBooks }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;

  const segments = breakdown.reduce((acc, item) => {
    const prevCumulative = acc.length > 0 ? acc[acc.length - 1].nextCumulative : 0;
    const pct = totalBooks > 0 ? item.totalCopies / totalBooks : 0;
    acc.push({
      category: item.category,
      color: item.color,
      strokeDasharray: `${pct * circumference} ${circumference}`,
      strokeDashoffset: -prevCumulative * circumference,
      nextCumulative: prevCumulative + pct,
    });
    return acc;
  }, []);

  return (
    <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="transparent"
          stroke="#F1EAE1"
          strokeWidth="16"
        />
        {segments.map((seg) => (
          <circle
            key={seg.category}
            cx="56"
            cy="56"
            r={radius}
            fill="transparent"
            stroke={seg.color}
            strokeWidth="16"
            strokeDasharray={seg.strokeDasharray}
            strokeDashoffset={seg.strokeDashoffset}
            className="transition-all duration-500"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold text-[#1D1611] leading-none">
          {totalBooks}
        </span>
        <span className="text-[10px] text-[#6E6259] mt-0.5">Books</span>
      </div>
    </div>
  );
}

function UtilizationDonutChart({ available, issued, overdue, total }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const safeTotal = Math.max(1, total);

  const nonOverdueIssued = Math.max(0, issued - overdue);
  const availPct = available / safeTotal;
  const issuedPct = nonOverdueIssued / safeTotal;
  const overduePct = overdue / safeTotal;

  const availDash = `${availPct * circumference} ${circumference}`;
  const issuedDash = `${issuedPct * circumference} ${circumference}`;
  const overdueDash = `${overduePct * circumference} ${circumference}`;

  const issuedOffset = -availPct * circumference;
  const overdueOffset = -(availPct + issuedPct) * circumference;

  const availPercentDisplay = Math.round(availPct * 100);

  return (
    <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="transparent"
          stroke="#F1EAE1"
          strokeWidth="13"
        />
        {/* Available segment (Green) */}
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="transparent"
          stroke="#199A5B"
          strokeWidth="13"
          strokeDasharray={availDash}
          strokeDashoffset={0}
          className="transition-all duration-500"
        />
        {/* Issued segment (Amber) */}
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="transparent"
          stroke="#F59E0B"
          strokeWidth="13"
          strokeDasharray={issuedDash}
          strokeDashoffset={issuedOffset}
          className="transition-all duration-500"
        />
        {/* Overdue segment (Red) */}
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="transparent"
          stroke="#DC2626"
          strokeWidth="13"
          strokeDasharray={overdueDash}
          strokeDashoffset={overdueOffset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold text-[#1D1611] leading-none">
          {availPercentDisplay}%
        </span>
        <span className="text-[10px] text-[#6E6259] mt-0.5">Available</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    issues,
    activities,
    weeklyCirculation,
    metrics,
    loading,
    apiError,
    lastSyncedAt,
    returnBook,
    sendOverdueReminder,
    syncWithApi,
  } = useLibrary();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [circulationRange, setCirculationRange] = useState('This Week');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const showAllTransactions = false;
  const showAllOverdue = false;
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const overdueIssues = useMemo(
    () => issues.filter((i) => i.status === 'Overdue'),
    [issues]
  );

  const filteredTransactions = useMemo(() => {
    return issues.filter((iss) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        iss.bookTitle.toLowerCase().includes(q) ||
        iss.memberName.toLowerCase().includes(q) ||
        iss.status.toLowerCase().includes(q)
      );
    });
  }, [issues, searchQuery]);

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        act.title.toLowerCase().includes(q) ||
        act.description.toLowerCase().includes(q)
      );
    });
  }, [activities, searchQuery]);

  const displayedCategoryBreakdown = useMemo(() => {
    if (selectedGenre === 'All Genres') return metrics.categoryBreakdown;
    return metrics.categoryBreakdown.filter((c) => c.category === selectedGenre);
  }, [metrics.categoryBreakdown, selectedGenre]);

  const displayedCirculation = useMemo(() => {
    if (circulationRange === 'This Week') return weeklyCirculation;
    return weeklyCirculation.map((d, i) => ({
      day: d.day,
      issued: Math.max(2, d.issued - (i % 2 === 0 ? 1 : -2)),
      returned: Math.max(1, d.returned + (i % 2 === 0 ? 1 : -1)),
    }));
  }, [weeklyCirculation, circulationRange]);

  const issuedStockPct = Math.round(
    (metrics.booksIssued / Math.max(1, metrics.totalBooks)) * 100
  );

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1D1611] font-sans flex">
      {/* SHARED STICKY SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER BAR */}
        <header className="sticky top-0 z-30 bg-[#F6EFE6]/95 backdrop-blur-md px-4 sm:px-6 pt-3.5 pb-2.5">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 max-w-[1360px] mx-auto w-full">
            {/* Left Title & Welcome Line */}
            <div className="flex items-start sm:items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-xl bg-white border border-[#E6DCD0] text-[#221209] cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-[22px] font-bold tracking-tight text-[#1D1611] leading-tight">
                    Library Command Center
                  </h1>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-[#DDF5E6] text-[#177A44] px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#177A44]" />
                    Live Data
                  </span>
                </div>
                <p className="text-[11.5px] sm:text-xs text-[#6E6259] mt-0.5">
                  Welcome back,{' '}
                  <span className="font-semibold text-[#1D1611]">
                    {user?.fullName || 'Eleanor Vance'}
                  </span>{' '}
                  ({user?.role || 'Head Librarian'}) • Last synced{' '}
                  {formatRelativeTime(lastSyncedAt)}
                </p>
              </div>
            </div>

            {/* Right Controls: Search, Sync API Data, Bell Notification, User Profile */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {/* Search Box */}
              <div className="relative flex-1 sm:w-56 md:w-64">
                <Search className="w-3.5 h-3.5 text-[#8C7E71] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books, members, activities..."
                  className="w-full bg-white border border-[#E8DFD5] focus:border-[#764922] rounded-xl pl-8.5 pr-3 py-2 text-xs text-[#1D1611] placeholder-[#8C7E71] shadow-2xs outline-none transition"
                />
              </div>

              {/* Sync API Data Button */}
              <button
                type="button"
                onClick={syncWithApi}
                disabled={loading}
                className="inline-flex items-center gap-1.5 bg-[#764922] hover:bg-[#5E391A] disabled:opacity-60 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync API Data</span>
              </button>

              {/* Notification Bell (Overdue Count) */}
              <button
                type="button"
                onClick={() => setActiveModal('finesAndCategories')}
                title="View Overdue Fines & Categories"
                className="relative p-2 rounded-xl bg-white border border-[#E8DFD5] hover:bg-[#FAF6F0] text-[#2A1E17] transition cursor-pointer shrink-0"
              >
                <Bell className="w-4 h-4" />
                {metrics.overdueBooks > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9.5px] font-bold flex items-center justify-center">
                    {metrics.overdueBooks}
                  </span>
                )}
              </button>

              {/* User Profile Pill + Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-white/80 hover:bg-white border border-[#E8DFD5] rounded-xl px-2.5 py-1.5 transition cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#E2E6EC] text-[#1D1611] font-bold text-xs flex items-center justify-center">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'E'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-[11.5px] font-semibold text-[#1D1611] leading-tight">
                      {user?.fullName || 'Eleanor Vance'}
                    </p>
                    <p className="text-[10px] text-[#7A6E65] leading-tight">
                      {user?.role || 'Head Librarian'}
                    </p>
                  </div>
                  <ChevronDown className="w-3 h-3 text-[#7A6E65]" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E6DCD0] rounded-2xl shadow-xl p-3 z-50 space-y-2">
                    <div className="px-2 py-1 border-b border-[#F1EAE1]">
                      <p className="text-xs font-bold text-[#1D1611]">
                        {user?.fullName || 'Eleanor Vance'}
                      </p>
                      <p className="text-[11px] text-[#6E6259]">
                        {user?.email || 'admin@librax.com'}
                      </p>
                    </div>
                    <div className="px-2 py-1 text-[11.5px] text-[#5A4D41] space-y-1">
                      <div className="flex justify-between">
                        <span>Total Categories:</span>
                        <span className="font-semibold text-[#1D1611]">
                          {metrics.totalCategories}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fine Collected:</span>
                        <span className="font-semibold text-emerald-700">
                          ${metrics.fineCollected.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setActiveModal('finesAndCategories');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#764922] hover:bg-[#F6EFE6] flex items-center gap-2 cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Manage Fines & Categories
                    </button>
                    <button
                      type="button"
                      onClick={logout}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {apiError && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 text-xs text-amber-900 flex items-center justify-between max-w-[1360px] mx-auto">
              <span>{apiError}</span>
              <button
                type="button"
                onClick={syncWithApi}
                className="font-semibold underline ml-2 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}
        </header>

        {/* MAIN DASHBOARD CONTENT (Scaled for 100% Zoom) */}
        <main className="flex-1 px-4 sm:px-6 pb-6 pt-1 space-y-3.5 max-w-[1360px] w-full mx-auto">
          {/* ROW 1: 4 PRIMARY KPI CARDS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {/* Card 1: Total Books */}
            <div
              onClick={() => setActiveModal('addBook')}
              className="bg-[#FDFBF9] border border-[#ECE3D8] rounded-2xl p-4 shadow-2xs hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F4E8DC] text-[#7D4E24] flex items-center justify-center shrink-0">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[11.5px] font-medium text-[#5A4D41]">
                      Total Books
                    </span>
                    <span className="text-[10.5px] font-semibold bg-[#F3E5D7] text-[#7D4E24] px-2 py-0.5 rounded-full whitespace-nowrap">
                      Live Inventory
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[#1D1611] mt-0.5 tracking-tight leading-tight">
                    {metrics.totalBooks}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#F4EDE4] flex items-center justify-between text-[11px]">
                <span className="text-[#7A6E65]">
                  {metrics.uniqueTitles} unique catalog items
                </span>
                <span className="font-semibold text-[#764922] inline-flex items-center gap-0.5">
                  + Add Book <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Card 2: Total Members */}
            <div
              onClick={() => setActiveModal('addMember')}
              className="bg-[#FDFBF9] border border-[#ECE3D8] rounded-2xl p-4 shadow-2xs hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E5EFFF] text-[#2563EB] flex items-center justify-center shrink-0">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[11.5px] font-medium text-[#5A4D41]">
                      Total Members
                    </span>
                    <span className="text-[10.5px] font-semibold bg-[#E3EEFF] text-[#2563EB] px-2 py-0.5 rounded-full whitespace-nowrap">
                      DummyJSON Synced
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[#1D1611] mt-0.5 tracking-tight leading-tight">
                    {metrics.totalMembers}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#F4EDE4] flex items-center justify-between text-[11px]">
                <span className="text-[#7A6E65]">Active registrations</span>
                <Link
                  to="/members"
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold text-[#764922] inline-flex items-center gap-0.5 hover:underline"
                >
                  View Directory <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Card 3: Books Issued */}
            <div
              onClick={() => setActiveModal('issue')}
              className="bg-[#FDFBF9] border border-[#ECE3D8] rounded-2xl p-4 shadow-2xs hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FDECE6] text-[#D94E28] flex items-center justify-center shrink-0">
                  <BookUp className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[11.5px] font-medium text-[#5A4D41]">
                      Books Issued
                    </span>
                    <span className="text-[10.5px] font-semibold bg-[#FDECE4] text-[#D95326] px-2 py-0.5 rounded-full whitespace-nowrap">
                      {issuedStockPct}% of stock
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[#1D1611] mt-0.5 tracking-tight leading-tight">
                    {metrics.booksIssued}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#F4EDE4] flex items-center justify-between text-[11px]">
                <span className="text-[#7A6E65]">Currently checked out</span>
                <span className="font-semibold text-[#764922] inline-flex items-center gap-0.5">
                  + Issue Book <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Card 4: Books Available */}
            <div
              onClick={() => navigate('/books')}
              className="bg-[#FDFBF9] border border-[#ECE3D8] rounded-2xl p-4 shadow-2xs hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E1F6EC] text-[#17824C] flex items-center justify-center shrink-0">
                  <CheckSquare className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[11.5px] font-medium text-[#5A4D41]">
                      Books Available
                    </span>
                    <span className="text-[10.5px] font-semibold bg-[#DCF5E7] text-[#17824C] px-2 py-0.5 rounded-full whitespace-nowrap">
                      In Stock
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[#1D1611] mt-0.5 tracking-tight leading-tight">
                    {metrics.booksAvailable}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#F4EDE4] flex items-center justify-between text-[11px]">
                <span className="text-[#7A6E65]">Ready on library shelves</span>
                <span className="font-semibold text-[#764922] inline-flex items-center gap-0.5">
                  View Catalog <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </section>

          {/* ROW 2: 3 ANALYTICS CHARTS */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            {/* Chart 1: Book Circulation (5 cols) */}
            <div className="lg:col-span-5 bg-[#FDFBF9] border border-[#ECE3D8] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#764922]" />
                    <h2 className="text-sm font-bold text-[#1D1611]">
                      Book Circulation
                    </h2>
                  </div>

                  <select
                    value={circulationRange}
                    onChange={(e) => setCirculationRange(e.target.value)}
                    className="bg-white border border-[#E6DCD0] rounded-lg px-2 py-0.5 text-[11px] font-medium text-[#4A3E35] outline-none cursor-pointer"
                  >
                    <option value="This Week">This Week</option>
                    <option value="Last Week">Last Week</option>
                  </select>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-2 text-[11px] text-[#5A4D41]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#7A461D]" />
                    Books Issued
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#E3C8B0]" />
                    Books Returned
                  </span>
                </div>
              </div>

              {/* Grouped Vertical Bar Chart */}
              <div className="mt-3">
                <div className="flex h-32">
                  {/* Y-axis labels */}
                  <div className="flex flex-col justify-between text-[10px] text-[#8C7E71] pr-2.5 pb-4 select-none">
                    <span>15</span>
                    <span>10</span>
                    <span>5</span>
                    <span>0</span>
                  </div>

                  {/* Bars Container */}
                  <div className="flex-1 flex flex-col justify-between relative">
                    <div className="absolute inset-x-0 top-0 bottom-4 flex flex-col justify-between pointer-events-none">
                      <div className="border-b border-[#F1EAE1] w-full" />
                      <div className="border-b border-[#F1EAE1] w-full" />
                      <div className="border-b border-[#F1EAE1] w-full" />
                      <div className="border-b border-[#E6DCD0] w-full" />
                    </div>

                    <div className="relative z-10 flex-1 grid grid-cols-7 gap-1.5 items-end pb-4 pt-1 px-1">
                      {displayedCirculation.map((item) => {
                        const maxVal = 15;
                        const issuedHeightPct = Math.min(
                          100,
                          Math.round((item.issued / maxVal) * 100)
                        );
                        const returnedHeightPct = Math.min(
                          100,
                          Math.round((item.returned / maxVal) * 100)
                        );
                        return (
                          <div
                            key={item.day}
                            className="h-full flex flex-col justify-end items-center group relative"
                          >
                            <div className="w-full flex items-end justify-center gap-1 h-full">
                              <div
                                title={`${item.day} Issued: ${item.issued}`}
                                className="w-2.5 sm:w-3 bg-[#7A461D] rounded-t-xs transition-all duration-300"
                                style={{ height: `${issuedHeightPct}%` }}
                              />
                              <div
                                title={`${item.day} Returned: ${item.returned}`}
                                className="w-2.5 sm:w-3 bg-[#E3C8B0] rounded-t-xs transition-all duration-300"
                                style={{ height: `${returnedHeightPct}%` }}
                              />
                            </div>
                            <span className="absolute -bottom-4 text-[10px] text-[#6E6259]">
                              {item.day}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Category Distribution (4 cols) */}
            <div className="lg:col-span-4 bg-[#FDFBF9] border border-[#ECE3D8] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Shapes className="w-4 h-4 text-[#764922]" />
                  <h2 className="text-sm font-bold text-[#1D1611]">
                    Category Distribution
                  </h2>
                </div>

                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="bg-white border border-[#E6DCD0] rounded-lg px-2 py-0.5 text-[11px] font-medium text-[#4A3E35] outline-none cursor-pointer"
                >
                  <option value="All Genres">All Genres</option>
                  {metrics.categoryBreakdown.map((c) => (
                    <option key={c.category} value={c.category}>
                      {c.category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3.5 my-auto py-2">
                <CategoryDonutChart
                  breakdown={displayedCategoryBreakdown}
                  totalBooks={metrics.totalBooks}
                />

                <div className="flex-1 min-w-0 space-y-1.5">
                  {displayedCategoryBreakdown.slice(0, 6).map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between text-[11px]"
                    >
                      <span className="inline-flex items-center gap-1.5 text-[#4A3E35] truncate">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate">{item.category}</span>
                      </span>
                      <span className="text-[#6E6259] whitespace-nowrap ml-1">
                        <strong className="font-bold text-[#1D1611]">
                          {item.totalCopies}
                        </strong>{' '}
                        ({item.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-[#EFE7DD] flex justify-end">
                  <Link
                    to="/categories"
                    className="text-[11px] font-semibold text-[#764B24] hover:underline inline-flex items-center gap-1"
                  >
                    Manage Categories <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Chart 3: Collection Utilization (3 cols) */}
            <div className="lg:col-span-3 bg-[#FDFBF9] border border-[#ECE3D8] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Archive className="w-4 h-4 text-[#764922]" />
                  <h2 className="text-sm font-bold text-[#1D1611]">
                    Collection Utilization
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3 my-auto py-2">
                <UtilizationDonutChart
                  available={metrics.booksAvailable}
                  issued={metrics.booksIssued}
                  overdue={metrics.overdueBooks}
                  total={metrics.totalBooks}
                />

                <div className="flex-1 min-w-0 bg-[#FAF6F1] border border-[#EFE7DD] rounded-xl p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] border-b border-[#EAE0D5] pb-1.5">
                    <span className="inline-flex items-center gap-1.5 text-[#4A3E35] leading-tight">
                      <span className="w-2 h-2 rounded-full bg-[#199A5B] shrink-0" />
                      <span>
                        Available
                        <br />
                        Books
                      </span>
                    </span>
                    <span className="text-xs font-bold text-[#1D1611]">
                      {metrics.booksAvailable}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] border-b border-[#EAE0D5] pb-1.5">
                    <span className="inline-flex items-center gap-1.5 text-[#4A3E35] leading-tight">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" />
                      <span>
                        Issued
                        <br />
                        Books
                      </span>
                    </span>
                    <span className="text-xs font-bold text-[#1D1611]">
                      {metrics.booksIssued}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="inline-flex items-center gap-1.5 text-[#4A3E35] leading-tight">
                      <span className="w-2 h-2 rounded-full bg-[#DC2626] shrink-0" />
                      <span>
                        Overdue
                        <br />
                        Books
                      </span>
                    </span>
                    <span className="text-xs font-bold text-[#1D1611]">
                      {metrics.overdueBooks}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ROW 3: RECENT TRANSACTIONS & OVERDUE BOOKS */}
          <section id="circulation" className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            {/* Left 7 Cols: Recent Transactions Table */}
              <div className="lg:col-span-7 bg-[#FDFBF9] border border-[#ECE3D8] rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#764922]" />
                    <h2 className="text-sm font-bold text-[#1D1611]">
                      Recent Transactions
                    </h2>
                  </div>
                  <Link
                    to="/circulation"
                    className="text-[11.5px] font-semibold text-[#764922] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Manage Circulation <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F6EFE7] text-[#5A4D41] text-[11px] font-semibold">
                        <th className="py-2 px-2.5 rounded-l-lg">#</th>
                        <th className="py-2 px-2.5">Book Title</th>
                        <th className="py-2 px-2.5">Member</th>
                        <th className="py-2 px-2.5">Type</th>
                        <th className="py-2 px-2.5">Date</th>
                        <th className="py-2 px-2.5 rounded-r-lg text-right">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1EAE1] text-[11.5px]">
                      {(showAllTransactions
                        ? filteredTransactions
                        : filteredTransactions.slice(0, 5)
                      ).map((tx, idx) => {
                        const statusStyles =
                          tx.status === 'Issued'
                            ? 'bg-[#DCF5E7] text-[#17824C]'
                            : tx.status === 'Returned'
                            ? 'bg-[#E3EEFF] text-[#2563EB]'
                            : 'bg-[#FDE2E1] text-[#DC2626]';

                        const displayDate =
                          tx.status === 'Returned' && tx.returnDate
                            ? formatDisplayDate(tx.returnDate)
                            : formatDisplayDate(tx.issueDate);

                        return (
                          <tr
                            key={tx.id}
                            className="hover:bg-[#FAF5EE]/60 transition"
                          >
                            <td className="py-2 px-2.5 text-[#6E6259] font-medium">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-2.5">
                              <div className="flex items-center gap-2">
                                <img
                                  src={
                                    tx.bookCover ||
                                    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=120&auto=format&fit=crop&q=80'
                                  }
                                  alt={tx.bookTitle}
                                  className="w-5 h-7 object-cover rounded-xs shadow-2xs shrink-0 bg-[#EFE7DC]"
                                />
                                <span className="font-semibold text-[#1D1611] truncate max-w-[150px]">
                                  {tx.bookTitle}
                                </span>
                              </div>
                            </td>
                            <td className="py-2 px-2.5 text-[#4A3E35] whitespace-nowrap">
                              {tx.memberName}
                            </td>
                            <td className="py-2 px-2.5 text-[#6E6259]">
                              {tx.transactionType ||
                                (tx.status === 'Returned' ? 'Return' : 'Issue')}
                            </td>
                            <td className="py-2 px-2.5 text-[#6E6259] whitespace-nowrap">
                              {displayDate}
                            </td>
                            <td className="py-2 px-2.5 text-right">
                              <span
                                onClick={() => {
                                  if (tx.status !== 'Returned') {
                                    returnBook(tx.id, true);
                                  }
                                }}
                                title={
                                  tx.status !== 'Returned'
                                    ? 'Click to mark returned'
                                    : 'Already returned'
                                }
                                className={`inline-block text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full ${statusStyles} ${
                                  tx.status !== 'Returned'
                                    ? 'cursor-pointer hover:opacity-80'
                                    : ''
                                }`}
                              >
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right 5 Cols: Overdue Books Table */}
              <div className="lg:col-span-5 bg-[#FDFBF9] border border-[#ECE3D8] rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
                    <h2 className="text-sm font-bold text-[#1D1611]">
                      Overdue Books
                    </h2>
                  </div>
                  <Link
                    to="/fines"
                    className="text-[11.5px] font-semibold text-[#DC2626] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Manage Overdue & Fines <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F6EFE7] text-[#5A4D41] text-[11px] font-semibold">
                        <th className="py-2 px-2 rounded-l-lg">#</th>
                        <th className="py-2 px-2">Book Title</th>
                        <th className="py-2 px-2">Member</th>
                        <th className="py-2 px-2">Due Date</th>
                        <th className="py-2 px-2">Days Late</th>
                        <th className="py-2 px-2 rounded-r-lg text-right">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1EAE1] text-[11.5px]">
                      {overdueIssues.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-[#6E6259]"
                          >
                            All books are returned on time!
                          </td>
                        </tr>
                      ) : (
                        (showAllOverdue
                          ? overdueIssues
                          : overdueIssues.slice(0, 3)
                        ).map((ov, idx) => (
                          <tr
                            key={ov.id}
                            className="hover:bg-[#FAF5EE]/60 transition"
                          >
                            <td className="py-2.5 px-2 text-[#6E6259] font-medium">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-2">
                              <div className="flex items-center gap-2">
                                <img
                                  src={
                                    ov.bookCover ||
                                    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=120&auto=format&fit=crop&q=80'
                                  }
                                  alt={ov.bookTitle}
                                  className="w-5 h-7 object-cover rounded-xs shadow-2xs shrink-0 bg-[#EFE7DC]"
                                />
                                <span className="font-semibold text-[#1D1611] line-clamp-2 max-w-[105px] leading-tight">
                                  {ov.bookTitle}
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-[#4A3E35] whitespace-nowrap">
                              {ov.memberName}
                            </td>
                            <td className="py-2.5 px-2 text-[#6E6259] whitespace-nowrap">
                              {formatDisplayDate(ov.dueDate)}
                            </td>
                            <td className="py-2.5 px-2 font-bold text-[#DC2626] whitespace-nowrap">
                              {ov.overdueDays} days
                            </td>
                            <td className="py-2.5 px-2 text-right">
                              <button
                                type="button"
                                onClick={() => sendOverdueReminder(ov.id)}
                                className="border border-[#B0845C] text-[#6B421E] hover:bg-[#764922] hover:text-white text-[10.5px] font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer"
                              >
                                Remind
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

          {/* ROW 4: QUICK ACTIONS (4 Pastel Cards) & LATEST ACTIVITY FEED */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            {/* Left 7 Cols: Quick Actions */}
            <div className="lg:col-span-7 bg-[#FDFBF9] border border-[#ECE3D8] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-[#764922]" />
                <h2 className="text-sm font-bold text-[#1D1611]">
                  Quick Actions
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                {/* Action 1: Issue Book */}
                <button
                  type="button"
                  onClick={() => setActiveModal('issue')}
                  className="bg-[#F6EDE4] hover:bg-[#EFE2D4] rounded-xl p-3 flex flex-col items-center justify-center text-center transition cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-[#7A461D] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#5E3414] mt-2">
                    Issue Book
                  </span>
                  <span className="text-[10.5px] text-[#7D6B5D] mt-0.5">
                    Quickly issue a book
                  </span>
                </button>

                {/* Action 2: Return Book */}
                <button
                  type="button"
                  onClick={() => setActiveModal('return')}
                  className="bg-[#E8F6EE] hover:bg-[#D9EFE2] rounded-xl p-3 flex flex-col items-center justify-center text-center transition cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-[#198E52] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#136E3E] mt-2">
                    Return Book
                  </span>
                  <span className="text-[10.5px] text-[#5E7D6C] mt-0.5">
                    Process a return
                  </span>
                </button>

                {/* Action 3: Add New Book */}
                <button
                  type="button"
                  onClick={() => setActiveModal('addBook')}
                  className="bg-[#FCEEE9] hover:bg-[#F9E1D9] rounded-xl p-3 flex flex-col items-center justify-center text-center transition cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-[#D94625] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#A63319] mt-2">
                    Add New Book
                  </span>
                  <span className="text-[10.5px] text-[#8C655B] mt-0.5">
                    Update catalog
                  </span>
                </button>

                {/* Action 4: Enroll Member */}
                <button
                  type="button"
                  onClick={() => setActiveModal('addMember')}
                  className="bg-[#EAF2FF] hover:bg-[#DCE9FF] rounded-xl p-3 flex flex-col items-center justify-center text-center transition cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#1E4FBC] mt-2">
                    Enroll Member
                  </span>
                  <span className="text-[10.5px] text-[#5B7099] mt-0.5">
                    Register new member
                  </span>
                </button>
              </div>
            </div>

            {/* Right 5 Cols: Latest Activity Feed */}
            <div id="activities" className="lg:col-span-5 bg-[#FDFBF9] border border-[#ECE3D8] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#764922]" />
                    <h2 className="text-sm font-bold text-[#1D1611]">
                      Latest Activity Feed
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAllActivities((prev) => !prev)}
                    className="text-[11.5px] font-semibold text-[#764922] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    {showAllActivities ? 'Show Less' : 'View All'}{' '}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="divide-y divide-[#F1EAE1]">
                  {(showAllActivities
                    ? filteredActivities
                    : filteredActivities.slice(0, 4)
                  ).map((act) => {
                    const iconConfig =
                      act.type === 'member_added'
                        ? {
                            bg: 'bg-[#E5EFFF] text-[#2563EB]',
                            icon: UserPlus,
                          }
                        : act.type === 'issue'
                        ? {
                            bg: 'bg-[#F4E8DC] text-[#7D4E24]',
                            icon: BookOpen,
                          }
                        : act.type === 'return'
                        ? {
                            bg: 'bg-[#E1F6EC] text-[#17824C]',
                            icon: RotateCcw,
                          }
                        : {
                            bg: 'bg-[#FDECE6] text-[#DC2626]',
                            icon: AlertTriangle,
                          };

                    const ActIcon = iconConfig.icon;

                    return (
                      <div
                        key={act.id}
                        className="py-2 flex items-center justify-between gap-2.5 text-[11.5px]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${iconConfig.bg}`}
                          >
                            <ActIcon className="w-3 h-3" />
                          </div>
                          <span className="text-[#2B211A] font-medium truncate">
                            {act.title}
                          </span>
                        </div>
                        <span className="text-[10.5px] text-[#8C7E71] shrink-0">
                          {formatRelativeTime(act.timestamp)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Interactive Quick Action Modals */}
      <QuickActionModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
