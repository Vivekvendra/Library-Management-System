import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Grid,
  List,
  Edit2,
  Trash2,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  CheckCircle2,
  Menu,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { useLibrary, formatDisplayDate } from '../context/LibraryContext';
import Sidebar from '../components/common/Sidebar';
import { MemberFormModal, DeleteMemberConfirmModal } from '../components/members/MemberModal';
import QuickActionModals from '../components/dashboard/QuickActionModals';

export default function MemberManagementPage() {
  const {
    members,
    issues,
    deleteMember,
    loading,
  } = useLibrary();

  // Navigation & responsive state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loanFilter, setLoanFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deletingMember, setDeletingMember] = useState(null);
  const [quickActionModal, setQuickActionModal] = useState(null); // 'issue' | 'return' | 'addBook'

  // Enrich members with active loans and overdue count
  const enrichedMembers = useMemo(() => {
    return members.map((member) => {
      const memberIssues = issues.filter((i) => i.memberId === member.id);
      const activeIssues = memberIssues.filter((i) => i.status !== 'Returned');
      const overdueIssues = activeIssues.filter((i) => i.status === 'Overdue');
      return {
        ...member,
        totalHistoryCount: memberIssues.length,
        activeLoansCount: activeIssues.length,
        overdueCount: overdueIssues.length,
        activeIssues,
      };
    });
  }, [members, issues]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return enrichedMembers.filter((m) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = m.fullName.toLowerCase().includes(q);
        const matchesEmail = m.email.toLowerCase().includes(q);
        const matchesPhone = (m.phone || '').toLowerCase().includes(q);
        const matchesId = (m.membershipId || '').toLowerCase().includes(q);
        const matchesAddress = (m.address || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesId && !matchesAddress) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'ALL' && m.status !== statusFilter) {
        return false;
      }

      // Loan filter
      if (loanFilter === 'ACTIVE' && m.activeLoansCount === 0) {
        return false;
      }
      if (loanFilter === 'OVERDUE' && m.overdueCount === 0) {
        return false;
      }
      if (loanFilter === 'NONE' && m.activeLoansCount > 0) {
        return false;
      }

      return true;
    });
  }, [enrichedMembers, searchQuery, statusFilter, loanFilter]);

  // Pagination calculations
  const totalItems = filteredMembers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedMembers = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return filteredMembers.slice(start, start + itemsPerPage);
  }, [filteredMembers, safeCurrentPage, itemsPerPage]);

  const handleEditClick = (member) => {
    setEditingMember(member);
    setFormModalOpen(true);
  };

  const handleDeleteClick = (member) => {
    setDeletingMember(member);
  };

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5EBE1] text-[#1D1611] font-sans flex">
      {/* SHARED STICKY SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Breadcrumb & Actions Bar */}
        <header className="bg-[#FAF7F2] border-b border-[#E3D7C9] px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-30 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-xl bg-white border border-[#E6DCD0] text-[#221209] cursor-pointer mt-0.5 sm:mt-0"
              title="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-[11.5px] text-[#7C6959]">
              <Link to="/dashboard" className="hover:text-[#1D1611] transition">
                Dashboard
              </Link>
              <span>/</span>
              <span className="font-medium text-[#1D1611]">Member Management</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="text-xl font-bold text-[#1D1611] tracking-tight">
                Member Directory & Patrons
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EAE0D5] text-[#5C4B3E]">
                {totalItems} {totalItems === 1 ? 'Record' : 'Records'}
              </span>
            </div>
          </div>
        </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#EFE7DC] p-1 rounded-xl border border-[#DED4C8]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#764B24] shadow-xs'
                    : 'text-[#7C6959] hover:text-[#1D1611]'
                }`}
                title="Grid Cards View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-[#764B24] shadow-xs'
                    : 'text-[#7C6959] hover:text-[#1D1611]'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Register Member Button */}
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#764B24] to-[#553417] text-white shadow-sm hover:brightness-110 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Member</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Search & Filter Toolbar */}
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E0D5C7] shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, email, mobile number, membership ID, address..."
                className="w-full pl-9.5 pr-4 py-2 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none transition placeholder:text-[#A69080]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-[#8C7A6B] hover:text-[#1D1611] text-xs font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-white border border-[#DED4C8] rounded-xl px-2.5 py-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-[#8C7A6B]" />
                <span className="text-[11px] text-[#7C6959] font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs font-medium text-[#1D1611] outline-none cursor-pointer"
                >
                  <option value="ALL">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              {/* Loan Status Filter */}
              <div className="flex items-center gap-1.5 bg-white border border-[#DED4C8] rounded-xl px-2.5 py-1.5 text-xs">
                <BookOpen className="w-3.5 h-3.5 text-[#8C7A6B]" />
                <span className="text-[11px] text-[#7C6959] font-medium">Loans:</span>
                <select
                  value={loanFilter}
                  onChange={(e) => {
                    setLoanFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs font-medium text-[#1D1611] outline-none cursor-pointer"
                >
                  <option value="ALL">All Loans</option>
                  <option value="ACTIVE">With Borrowed Books</option>
                  <option value="OVERDUE">With Overdue Fines</option>
                  <option value="NONE">No Active Loans</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(searchQuery || statusFilter !== 'ALL' || loanFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setLoanFilter('ALL');
                    setCurrentPage(1);
                  }}
                  className="text-xs text-[#764B24] hover:underline font-semibold px-2 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E0D5C7] animate-pulse space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#EAE0D5]" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-[#EAE0D5] rounded w-2/3" />
                      <div className="h-3 bg-[#EAE0D5] rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-3 bg-[#EAE0D5] rounded w-full" />
                  <div className="h-3 bg-[#EAE0D5] rounded w-3/4" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && paginatedMembers.length === 0 && (
            <div className="bg-[#FAF7F2] rounded-2xl border border-[#E0D5C7] p-12 text-center max-w-md mx-auto my-8">
              <div className="w-14 h-14 rounded-full bg-[#EFE7DC] text-[#764B24] flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-base text-[#1D1611]">No Members Found</h3>
              <p className="text-xs text-[#7C6959] mt-1">
                {searchQuery || statusFilter !== 'ALL' || loanFilter !== 'ALL'
                  ? 'No members match the current filter criteria. Try adjusting or clearing search terms.'
                  : 'Your library directory does not have any registered patrons yet.'}
              </p>
              <div className="mt-4 flex justify-center gap-3">
                {searchQuery || statusFilter !== 'ALL' || loanFilter !== 'ALL' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('ALL');
                      setLoanFilter('ALL');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#EAE0D5] text-[#5C4B3E] hover:bg-[#DED4C8] transition cursor-pointer"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenAdd}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#764B24] text-white hover:bg-[#5C3919] transition cursor-pointer"
                  >
                    Register First Member
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Grid Cards View */}
          {!loading && viewMode === 'grid' && paginatedMembers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-[#FAF7F2] rounded-2xl border border-[#E0D5C7] shadow-xs hover:shadow-md transition-shadow duration-200 p-5 flex flex-col justify-between"
                >
                  {/* Top Bar: Avatar + Name + ID + Status */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.fullName}
                            className="w-12 h-12 rounded-full object-cover border border-[#DED4C8] shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#EAE0D5] border border-[#D4C3B3] text-[#764B24] font-bold text-sm flex items-center justify-center shrink-0">
                            {member.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            to={`/members/${member.id}`}
                            className="font-semibold text-sm text-[#1D1611] hover:text-[#764B24] transition truncate block"
                          >
                            {member.fullName}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[11px] text-[#764B24] font-semibold bg-[#EFE7DC] px-1.5 py-0.2 rounded-md">
                              {member.membershipId}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                          member.status === 'Active'
                            ? 'bg-[#DCFCE7] text-[#15803D]'
                            : member.status === 'Suspended'
                            ? 'bg-[#FEF3C7] text-[#B45309]'
                            : 'bg-[#FEE2E2] text-[#B91C1C]'
                        }`}
                      >
                        {member.status === 'Active' ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <ShieldAlert className="w-3 h-3" />
                        )}
                        {member.status}
                      </span>
                    </div>

                    {/* Member Details */}
                    <div className="mt-4 space-y-1.5 text-xs text-[#5C4B3E]">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-[#8C7A6B] shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        <Phone className="w-3.5 h-3.5 text-[#8C7A6B] shrink-0" />
                        <span className="truncate">{member.phone || 'No phone recorded'}</span>
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#8C7A6B] shrink-0" />
                        <span className="truncate">{member.address || 'Address on file'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#7C6959]">
                        <Calendar className="w-3.5 h-3.5 text-[#8C7A6B] shrink-0" />
                        <span>Joined {formatDisplayDate(member.membershipDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Circulation Summary Bar & Actions */}
                  <div className="mt-5 pt-3.5 border-t border-[#EAE0D5] flex items-center justify-between">
                    {/* Active Loans Pills */}
                    <div className="flex items-center gap-1.5">
                      {member.activeLoansCount > 0 ? (
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                            member.overdueCount > 0
                              ? 'bg-[#FEE2E2] text-[#B91C1C]'
                              : 'bg-[#FEF9C3] text-[#854D0E]'
                          }`}
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>
                            {member.activeLoansCount}{' '}
                            {member.activeLoansCount === 1 ? 'Book' : 'Books'}
                          </span>
                          {member.overdueCount > 0 && (
                            <span className="font-semibold text-[#DC2626]">
                              ({member.overdueCount} Overdue)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#7C6959] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#15803D]" />
                          <span>Clear Account</span>
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/members/${member.id}`}
                        title="View Profile"
                        className="p-1.5 rounded-lg text-[#5C4B3E] hover:bg-[#EAE0D5] hover:text-[#1D1611] transition cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleEditClick(member)}
                        title="Edit Member"
                        className="p-1.5 rounded-lg text-[#5C4B3E] hover:bg-[#EAE0D5] hover:text-[#1D1611] transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(member)}
                        title="Delete Member"
                        className="p-1.5 rounded-lg text-[#5C4B3E] hover:bg-[#FEE2E2] hover:text-[#DC2626] transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table View */}
          {!loading && viewMode === 'table' && paginatedMembers.length > 0 && (
            <div className="bg-[#FAF7F2] rounded-2xl border border-[#E0D5C7] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1D1611]">
                  <thead className="bg-[#F5EFE6] border-b border-[#EAE0D5] text-[#7C6959] uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Member</th>
                      <th className="px-4 py-3 font-semibold">Contact Info</th>
                      <th className="px-4 py-3 font-semibold">Address</th>
                      <th className="px-4 py-3 font-semibold">Joined Date</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Active Loans</th>
                      <th className="px-4 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE0D5]">
                    {paginatedMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-[#F3ECE1] transition">
                        {/* Member */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {member.avatar ? (
                              <img
                                src={member.avatar}
                                alt={member.fullName}
                                className="w-8 h-8 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#EAE0D5] text-[#764B24] font-bold text-xs flex items-center justify-center shrink-0">
                                {member.fullName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                            )}
                            <div>
                              <Link
                                to={`/members/${member.id}`}
                                className="font-semibold text-xs text-[#1D1611] hover:text-[#764B24] transition block"
                              >
                                {member.fullName}
                              </Link>
                              <span className="font-mono text-[10.5px] text-[#764B24] font-semibold">
                                {member.membershipId}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className="px-4 py-3 text-[#5C4B3E]">
                          <div className="space-y-0.5">
                            <p className="truncate">{member.email}</p>
                            <p className="text-[11px] text-[#7C6959]">{member.phone}</p>
                          </div>
                        </td>

                        {/* Address */}
                        <td className="px-4 py-3 text-[#5C4B3E] max-w-[180px] truncate">
                          {member.address}
                        </td>

                        {/* Joined Date */}
                        <td className="px-4 py-3 text-[#7C6959] whitespace-nowrap">
                          {formatDisplayDate(member.membershipDate)}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              member.status === 'Active'
                                ? 'bg-[#DCFCE7] text-[#15803D]'
                                : member.status === 'Suspended'
                                ? 'bg-[#FEF3C7] text-[#B45309]'
                                : 'bg-[#FEE2E2] text-[#B91C1C]'
                            }`}
                          >
                            {member.status}
                          </span>
                        </td>

                        {/* Active Loans */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {member.activeLoansCount > 0 ? (
                            <span
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                                member.overdueCount > 0
                                  ? 'bg-[#FEE2E2] text-[#B91C1C]'
                                  : 'bg-[#FEF9C3] text-[#854D0E]'
                              }`}
                            >
                              {member.activeLoansCount} active
                              {member.overdueCount > 0 && ` (${member.overdueCount} overdue)`}
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#7C6959]">0 loans</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/members/${member.id}`}
                              className="p-1.5 rounded-lg text-[#5C4B3E] hover:bg-[#EAE0D5] transition cursor-pointer"
                              title="View Profile"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleEditClick(member)}
                              className="p-1.5 rounded-lg text-[#5C4B3E] hover:bg-[#EAE0D5] transition cursor-pointer"
                              title="Edit Member"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(member)}
                              className="p-1.5 rounded-lg text-[#5C4B3E] hover:bg-[#FEE2E2] hover:text-[#DC2626] transition cursor-pointer"
                              title="Delete Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && filteredMembers.length > 0 && (
            <div className="bg-[#FAF7F2] px-5 py-3 rounded-2xl border border-[#E0D5C7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7C6959]">
              <div className="flex items-center gap-2">
                <span>
                  Showing{' '}
                  <strong className="text-[#1D1611]">
                    {(safeCurrentPage - 1) * itemsPerPage + 1}
                  </strong>{' '}
                  to{' '}
                  <strong className="text-[#1D1611]">
                    {Math.min(safeCurrentPage * itemsPerPage, totalItems)}
                  </strong>{' '}
                  of <strong className="text-[#1D1611]">{totalItems}</strong> members
                </span>
                <span className="text-[#D4C3B3]">•</span>
                <div className="flex items-center gap-1">
                  <span>Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white border border-[#DED4C8] rounded-lg px-2 py-0.5 text-xs text-[#1D1611] outline-none cursor-pointer"
                  >
                    <option value={6}>6</option>
                    <option value={9}>9</option>
                    <option value={12}>12</option>
                  </select>
                </div>
              </div>

              {/* Page Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-[#DED4C8] bg-white text-[#5C4B3E] hover:bg-[#F3ECE1] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setCurrentPage(pNum)}
                      className={`min-w-[28px] h-7 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        safeCurrentPage === pNum
                          ? 'bg-[#764B24] text-white shadow-xs'
                          : 'bg-white border border-[#DED4C8] text-[#5C4B3E] hover:bg-[#F3ECE1]'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-[#DED4C8] bg-white text-[#5C4B3E] hover:bg-[#F3ECE1] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <MemberFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        initialData={editingMember}
      />

      <DeleteMemberConfirmModal
        isOpen={Boolean(deletingMember)}
        onClose={() => setDeletingMember(null)}
        member={deletingMember}
        onConfirm={(id) => deleteMember(id)}
      />

      <QuickActionModals
        activeModal={quickActionModal}
        onClose={() => setQuickActionModal(null)}
      />
    </div>
  );
}
