import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Users,
  BookUp,
  RotateCcw,
  AlertTriangle,
  Download,
  Printer,
  Menu,
  Shapes,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import Sidebar from '../components/common/Sidebar';

export default function ReportsPage() {
  const {
    books,
    members,
    categories,
    issues,
    collectedFineHistory,
    metrics,
  } = useLibrary();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportTimeframe, setReportTimeframe] = useState('2026'); // '2026' | 'Q3' | 'ALL'
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  // KPI Calculations
  const totalBooksCount = metrics.totalBooks;
  const uniqueTitlesCount = metrics.uniqueTitles;
  const booksIssuedCount = metrics.booksIssued;
  const returnedCount = useMemo(
    () => issues.filter((i) => i.status === 'Returned').length,
    [issues]
  );
  const activeMembersCount = useMemo(
    () => members.filter((m) => m.status === 'Active').length,
    [members]
  );
  const overdueCount = metrics.overdueBooks;
  const totalFinesCollected = useMemo(
    () =>
      collectedFineHistory
        .filter((f) => f.paymentStatus !== 'Waived')
        .reduce((sum, f) => sum + Number(f.amount || 0), 0),
    [collectedFineHistory]
  );

  // Return compliance rate
  const totalCompletedCirculations = returnedCount + booksIssuedCount;
  const returnRatePercent =
    totalCompletedCirculations > 0
      ? ((returnedCount / totalCompletedCirculations) * 100).toFixed(1)
      : '0.0';

  // Category-wise Breakdown
  const categoryReport = useMemo(() => {
    return metrics.categoryBreakdown.filter((cat) => {
      if (selectedCategoryFilter === 'ALL') return true;
      return cat.category === selectedCategoryFilter;
    });
  }, [metrics.categoryBreakdown, selectedCategoryFilter]);

  // Monthly Issue & Return Report Data (12 Months of Academic Calendar)
  const monthlyReportData = useMemo(() => {
    const baseMonths = [
      { month: 'Jan', issued: 18, returned: 14, fines: 35.0, newMembers: 3 },
      { month: 'Feb', issued: 22, returned: 19, fines: 25.0, newMembers: 2 },
      { month: 'Mar', issued: 28, returned: 24, fines: 45.0, newMembers: 4 },
      { month: 'Apr', issued: 24, returned: 21, fines: 30.0, newMembers: 1 },
      { month: 'May', issued: 30, returned: 27, fines: 50.0, newMembers: 3 },
      { month: 'Jun', issued: 26, returned: 23, fines: 20.0, newMembers: 2 },
      { month: 'Jul', issued: 20, returned: 18, fines: 15.0, newMembers: 1 },
      { month: 'Aug', issued: 34, returned: 29, fines: 60.0, newMembers: 5 },
      { month: 'Sep', issued: 38, returned: 33, fines: 55.0, newMembers: 4 },
      { month: 'Oct', issued: 42, returned: 36, fines: 70.0, newMembers: 6 },
      { month: 'Nov', issued: 31, returned: 28, fines: 40.0, newMembers: 2 },
      { month: 'Dec', issued: 25, returned: 22, fines: 30.0, newMembers: 3 },
    ];

    // Overlay real issues for the current month (October)
    const currentMonthIssued = issues.length;
    const currentMonthReturned = returnedCount;
    const currentMonthFines = totalFinesCollected;

    return baseMonths.map((m) => {
      if (m.month === 'Oct') {
        return {
          ...m,
          issued: Math.max(m.issued, currentMonthIssued),
          returned: Math.max(m.returned, currentMonthReturned),
          fines: Math.max(m.fines, currentMonthFines),
        };
      }
      return m;
    });
  }, [issues.length, returnedCount, totalFinesCollected]);

  // Max issued count for scaling chart
  const maxMonthlyIssued = useMemo(() => {
    return Math.max(...monthlyReportData.map((m) => m.issued), 1);
  }, [monthlyReportData]);

  // Top Borrowed Titles
  const topBorrowedTitles = useMemo(() => {
    const borrowCount = {};
    issues.forEach((iss) => {
      borrowCount[iss.bookTitle] = (borrowCount[iss.bookTitle] || 0) + 1;
    });
    return books
      .map((b) => ({
        ...b,
        circulations: borrowCount[b.title] || 1,
      }))
      .sort((a, b) => b.circulations - a.circulations)
      .slice(0, 5);
  }, [books, issues]);

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = ['Category', 'Unique Titles', 'Total Copies', 'Available Copies', 'Issued Copies', 'Share (%)'];
    const rows = categoryReport.map((c) => [
      `"${c.category}"`,
      c.titlesCount,
      c.totalCopies,
      c.availableCopies,
      c.issuedCopies,
      `${c.percentage}%`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LibraX_Library_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1D1611] flex flex-col lg:flex-row antialiased font-normal">
      {/* Sticky Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EAE0D5] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 print:hidden">
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
                <span className="text-[#1D1611] font-medium">Reports & Analytics</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1D1611] tracking-tight mt-0.5">
                Library Operational Reports
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white border border-[#EAE0D5] hover:bg-[#FAF7F2] text-[#5C4B3E] rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              title="Download CSV Summary"
            >
              <Download className="w-4 h-4 text-[#764B24]" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 sm:px-4 py-2 bg-[#764B24] hover:bg-[#5C3919] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Print Official Report"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
          </div>
        </header>

        {/* Printable Official Banner (Shows only on print) */}
        <div className="hidden print:block p-8 border-b border-[#EAE0D5] text-center">
          <h1 className="text-2xl font-black text-[#1D1611] uppercase tracking-wider">
            LibraX Institutional Library
          </h1>
          <p className="text-xs text-[#7C6959] mt-1">
            Official Circulation, Stock, and Member Engagement Audit Report
          </p>
          <p className="text-[11px] font-mono text-[#8C7A6B] mt-0.5">
            Generated: {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}
          </p>
        </div>

        {/* Content Container */}
        <div className="p-4 sm:p-8 space-y-7 max-w-7xl w-full mx-auto">
          {/* Section 1: Core 5 Module 8 Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* Total Books */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAE0D5] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7C6959]">
                  Total Books
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#FAF0E6] text-[#764B24] flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1D1611]">
                  {totalBooksCount}
                </h3>
                <p className="text-[11px] text-[#7C6959] mt-0.5">
                  Across {uniqueTitlesCount} catalog titles
                </p>
              </div>
            </div>

            {/* Books Issued */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAE0D5] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E57338]">
                  Books Issued
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#FEF3EB] text-[#E57338] flex items-center justify-center">
                  <BookUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#E57338]">
                  {booksIssuedCount}
                </h3>
                <p className="text-[11px] text-[#7C6959] mt-0.5">
                  Currently with patrons
                </p>
              </div>
            </div>

            {/* Books Returned */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DCFCE7] shadow-xs flex flex-col justify-between bg-gradient-to-br from-white to-[#F4FDF7]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#166534]">
                  Books Returned
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#15803D] flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#15803D]">
                  {returnedCount}
                </h3>
                <p className="text-[11px] text-[#166534] mt-0.5">
                  {returnRatePercent}% on-time return rate
                </p>
              </div>
            </div>

            {/* Active Members */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAE0D5] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7C6959]">
                  Active Members
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#FAF0E6] text-[#764B24] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1D1611]">
                  {activeMembersCount}
                </h3>
                <p className="text-[11px] text-[#7C6959] mt-0.5">
                  In good library standing
                </p>
              </div>
            </div>

            {/* Overdue Books */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#FECACA] shadow-xs flex flex-col justify-between bg-gradient-to-br from-white to-[#FEF2F2]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#991B1B]">
                  Overdue Books
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#DC2626]">
                  {overdueCount}
                </h3>
                <p className="text-[11px] text-[#B91C1C] mt-0.5">
                  Action required
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Monthly Issue Report (Visual Chart + Table) */}
          <div className="bg-white rounded-2xl border border-[#EAE0D5] p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0E6DC] pb-4">
              <div>
                <h2 className="text-base font-bold text-[#1D1611] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#764B24]" />
                  <span>Monthly Issue & Circulation Report</span>
                </h2>
                <p className="text-xs text-[#7C6959] mt-0.5">
                  Comparison of monthly loans issued, returns processed, and penalty settlements
                </p>
              </div>

              {/* Timeframe Selector */}
              <div className="flex items-center gap-2 print:hidden">
                <span className="text-[11px] font-semibold text-[#7C6959] uppercase tracking-wider">
                  Academic Year:
                </span>
                <select
                  value={reportTimeframe}
                  onChange={(e) => setReportTimeframe(e.target.value)}
                  className="bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl px-3 py-1.5 text-xs text-[#1D1611] font-semibold outline-none cursor-pointer"
                >
                  <option value="2026">2026 Full Academic Session</option>
                  <option value="Q3">Q3 Fall Semester</option>
                  <option value="ALL">Historical All-Time</option>
                </select>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="pt-2">
              <div className="h-44 flex items-end justify-between gap-2 sm:gap-3 px-2 sm:px-4">
                {monthlyReportData.map((item) => {
                  const issuedHeight = Math.round((item.issued / maxMonthlyIssued) * 100);
                  const returnedHeight = Math.round((item.returned / maxMonthlyIssued) * 100);

                  return (
                    <div
                      key={item.month}
                      className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative"
                    >
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition absolute -top-12 z-20 bg-[#221209] text-white text-[10px] px-2 py-1 rounded-md shadow-md whitespace-nowrap pointer-events-none">
                        <strong>{item.month} 2026</strong>: {item.issued} Issued, {item.returned} Returned
                      </div>

                      <div className="w-full flex items-end justify-center gap-1 max-w-[28px] h-full">
                        {/* Issued Bar */}
                        <div
                          style={{ height: `${issuedHeight}%` }}
                          className="w-full bg-[#E57338] rounded-t-sm transition-all duration-300"
                          title={`Issued: ${item.issued}`}
                        />
                        {/* Returned Bar */}
                        <div
                          style={{ height: `${returnedHeight}%` }}
                          className="w-full bg-[#15803D] rounded-t-sm transition-all duration-300"
                          title={`Returned: ${item.returned}`}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-[#7C6959] mt-1">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-[#F0E6DC] text-xs">
                <div className="flex items-center gap-2 text-[#5C4B3E]">
                  <span className="w-3 h-3 rounded-xs bg-[#E57338]" />
                  <span className="font-medium">Books Issued</span>
                </div>
                <div className="flex items-center gap-2 text-[#5C4B3E]">
                  <span className="w-3 h-3 rounded-xs bg-[#15803D]" />
                  <span className="font-medium">Books Returned</span>
                </div>
              </div>
            </div>

            {/* Monthly Data Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#EAE0D5] text-[11px] font-semibold uppercase tracking-wider text-[#7C6959]">
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3">Books Issued</th>
                    <th className="py-2.5 px-3">Books Returned</th>
                    <th className="py-2.5 px-3">On-Time Return %</th>
                    <th className="py-2.5 px-3">Fines Accrued ($)</th>
                    <th className="py-2.5 px-3 text-right">New Patrons</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E6DC]">
                  {monthlyReportData.map((row) => {
                    const pct = ((row.returned / row.issued) * 100).toFixed(0);
                    return (
                      <tr key={row.month} className="hover:bg-[#FAF7F2]/70 transition">
                        <td className="py-2.5 px-3 font-semibold text-[#1D1611]">
                          {row.month} 2026
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[#E57338]">{row.issued}</td>
                        <td className="py-2.5 px-3 font-medium text-[#15803D]">{row.returned}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#DCFCE7] text-[#166534]">
                            {pct}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#764B24]">
                          ${row.fines.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#5C4B3E]">
                          +{row.newMembers}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Category-wise Book Count Breakdown */}
          <div className="bg-white rounded-2xl border border-[#EAE0D5] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0E6DC] pb-4">
              <div>
                <h2 className="text-base font-bold text-[#1D1611] flex items-center gap-2">
                  <Shapes className="w-5 h-5 text-[#764B24]" />
                  <span>Category-wise Book Count & Stock Analysis</span>
                </h2>
                <p className="text-xs text-[#7C6959] mt-0.5">
                  Detailed distribution across genres with availability and utilization rate
                </p>
              </div>

              {/* Category Filter Pill */}
              <div className="flex items-center gap-2 print:hidden">
                <span className="text-[11px] font-semibold text-[#7C6959] uppercase tracking-wider">
                  Filter Category:
                </span>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl px-3 py-1.5 text-xs text-[#1D1611] font-semibold outline-none cursor-pointer"
                >
                  <option value="ALL">All Categories ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {metrics.categoryBreakdown.map((cat) => (
                <div
                  key={cat.category}
                  className="bg-[#FAF7F2] border border-[#EAE0D5] rounded-xl p-3 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-bold text-xs text-[#1D1611] truncate">
                      {cat.category}
                    </span>
                  </div>
                  <div className="mt-2 text-xs">
                    <p className="text-lg font-extrabold text-[#764B24]">
                      {cat.totalCopies} <span className="text-[10.5px] font-normal text-[#7C6959]">copies</span>
                    </p>
                    <p className="text-[10.5px] text-[#7C6959] mt-0.5">
                      {cat.titlesCount} titles • {cat.percentage}%
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Category Detailed Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#EAE0D5] text-[11px] font-semibold uppercase tracking-wider text-[#7C6959]">
                    <th className="py-2.5 px-3">Classification Genre</th>
                    <th className="py-2.5 px-3">Catalog Titles</th>
                    <th className="py-2.5 px-3">Total Copies</th>
                    <th className="py-2.5 px-3">Available Copies</th>
                    <th className="py-2.5 px-3">Issued Copies</th>
                    <th className="py-2.5 px-3">Catalog Share</th>
                    <th className="py-2.5 px-3 text-right">Circulation Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E6DC]">
                  {categoryReport.map((cat) => {
                    const circRate =
                      cat.totalCopies > 0
                        ? ((cat.issuedCopies / cat.totalCopies) * 100).toFixed(0)
                        : '0';

                    return (
                      <tr key={cat.category} className="hover:bg-[#FAF7F2]/70 transition">
                        <td className="py-2.5 px-3 font-semibold text-[#1D1611] flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span>{cat.category}</span>
                        </td>
                        <td className="py-2.5 px-3 text-[#5C4B3E]">{cat.titlesCount}</td>
                        <td className="py-2.5 px-3 font-bold text-[#1D1611]">{cat.totalCopies}</td>
                        <td className="py-2.5 px-3 text-[#15803D] font-medium">
                          {cat.availableCopies} in stock
                        </td>
                        <td className="py-2.5 px-3 text-[#E57338] font-medium">
                          {cat.issuedCopies} loaned
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#764B24]">
                          {cat.percentage}%
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#FAF0E6] text-[#764B24]">
                            {circRate}% active
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Top Circulating Books & Overdue Risk Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Circulated Books */}
            <div className="bg-white rounded-2xl border border-[#EAE0D5] p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1D1611] flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-[#764B24]" />
                  <span>Most Frequently Borrowed Volumes</span>
                </h3>

                <div className="divide-y divide-[#F0E6DC]">
                  {topBorrowedTitles.map((b, idx) => (
                    <div
                      key={b.id}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 font-bold text-[#7C6959] text-center">
                          #{idx + 1}
                        </span>
                        {b.coverImage && (
                          <img
                            src={b.coverImage}
                            alt={b.title}
                            className="w-7 h-10 object-cover rounded shadow-2xs shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <Link
                            to={`/books/${b.id}`}
                            className="font-bold text-xs text-[#1D1611] hover:text-[#764B24] truncate block"
                          >
                            {b.title}
                          </Link>
                          <span className="text-[10.5px] text-[#7C6959]">
                            {b.author} • {b.category}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#FAF0E6] text-[#764B24] shrink-0">
                        {b.circulations} loans
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overdue Risk & Penalty Liability Summary */}
            <div className="bg-white rounded-2xl border border-[#FECACA] p-5 shadow-xs flex flex-col justify-between bg-gradient-to-br from-white to-[#FEF2F2]/30">
              <div>
                <h3 className="text-sm font-bold text-[#DC2626] flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
                  <span>Overdue Risk & Penalty Liability Summary</span>
                </h3>

                <div className="space-y-3 text-xs text-[#5C4B3E]">
                  <div className="p-3 bg-white rounded-xl border border-[#FECACA] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#7C6959] uppercase font-semibold block">
                        Total Overdue Volumes
                      </span>
                      <strong className="text-xl text-[#DC2626] font-extrabold">
                        {overdueCount} Items Late
                      </strong>
                    </div>
                    <Link
                      to="/fines"
                      className="px-3 py-1.5 rounded-xl bg-[#DC2626] text-white text-xs font-semibold hover:bg-[#B91C1C] transition cursor-pointer"
                    >
                      Audit Fines
                    </Link>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#EAE0D5] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#7C6959] uppercase font-semibold block">
                        Total Historical Fines Collected
                      </span>
                      <strong className="text-xl text-[#15803D] font-extrabold">
                        ${totalFinesCollected.toFixed(2)}
                      </strong>
                    </div>
                    <Link
                      to="/fines"
                      className="px-3 py-1.5 rounded-xl bg-[#15803D] text-white text-xs font-semibold hover:bg-[#166534] transition cursor-pointer"
                    >
                      View Receipts
                    </Link>
                  </div>

                  <p className="text-[11px] text-[#7C6959] italic pt-1">
                    * Overdue fines accrue at standard policy rate of $5.00/day. Fines can be settled or waived via the Fine Management module.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
