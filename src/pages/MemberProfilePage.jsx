import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  BookUp,
  Edit2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Menu,
  DollarSign,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useLibrary, formatDisplayDate } from '../context/LibraryContext';
import Sidebar from '../components/common/Sidebar';
import { MemberFormModal, DeleteMemberConfirmModal } from '../components/members/MemberModal';
import QuickActionModals from '../components/dashboard/QuickActionModals';

export default function MemberProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getMemberById,
    returnBook,
    deleteMember,
  } = useLibrary();

  // Navigation & responsive state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quickActionModal, setQuickActionModal] = useState(null);

  // Active tab in profile
  const [activeTab, setActiveTab] = useState('current'); // 'current' | 'history'

  const member = getMemberById(id);

  if (!member) {
    return (
      <div className="min-h-screen bg-[#F5EBE1] flex items-center justify-center p-6">
        <div className="bg-[#FAF7F2] rounded-2xl border border-[#E0D5C7] p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-14 h-14 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[#1D1611]">Member Record Not Found</h2>
          <p className="text-xs text-[#7C6959] mt-2 mb-6">
            The member file with ID &quot;{id}&quot; was not found or may have been deleted.
          </p>
          <button
            type="button"
            onClick={() => navigate('/members')}
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#764B24] text-white hover:bg-[#5C3919] transition cursor-pointer"
          >
            Return to Member Directory
          </button>
        </div>
      </div>
    );
  }

  const handleDeleteSuccess = (memberId) => {
    deleteMember(memberId);
    navigate('/members');
  };

  return (
    <div className="min-h-screen bg-[#F5EBE1] text-[#1D1611] font-sans flex">
      {/* SHARED STICKY SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-[#FAF7F2] border-b border-[#E3D7C9] px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-[#DED4C8] bg-white text-[#5C4B3E] hover:bg-[#F3ECE1] transition cursor-pointer"
              title="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/members')}
              className="p-2 rounded-xl border border-[#DED4C8] bg-white text-[#5C4B3E] hover:bg-[#F3ECE1] transition cursor-pointer"
              title="Back to Directory"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-[11.5px] text-[#7C6959]">
                <Link to="/members" className="hover:text-[#1D1611] transition">
                  Members
                </Link>
                <span>/</span>
                <span className="font-medium text-[#1D1611]">{member.fullName}</span>
              </div>
              <h2 className="text-xl font-bold text-[#1D1611] tracking-tight">
                Patron Profile & Activity
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setEditModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#DED4C8] text-[#5C4B3E] hover:bg-[#F3ECE1] transition cursor-pointer shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#764B24]" />
              <span>Edit File</span>
            </button>

            <button
              type="button"
              onClick={() => setQuickActionModal('issue')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#764B24] to-[#553417] text-white hover:brightness-110 transition cursor-pointer shadow-sm"
            >
              <BookUp className="w-3.5 h-3.5" />
              <span>Issue Book</span>
            </button>
          </div>
        </header>

        {/* Profile Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Member Card Header */}
          <div className="bg-[#FAF7F2] rounded-2xl border border-[#E0D5C7] shadow-xs p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Avatar + Main Details */}
              <div className="flex items-start md:items-center gap-4">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.fullName}
                    className="w-18 h-18 rounded-2xl object-cover border-2 border-[#DED4C8] shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-[#764B24] to-[#45270E] text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-xs">
                    {member.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-xl font-bold text-[#1D1611]">{member.fullName}</h1>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        member.status === 'Active'
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : member.status === 'Suspended'
                          ? 'bg-[#FEF3C7] text-[#B45309]'
                          : 'bg-[#FEE2E2] text-[#B91C1C]'
                      }`}
                    >
                      {member.status === 'Active' ? (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5" />
                      )}
                      {member.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#7C6959]">
                    <span className="font-mono font-semibold text-[#764B24] bg-[#EFE7DC] px-2 py-0.5 rounded-md">
                      {member.membershipId}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#8C7A6B]" />
                      Member since {formatDisplayDate(member.membershipDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Quick Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-xl border border-[#EAE0D5] md:min-w-[340px]">
                <div className="flex items-center gap-2 text-[#5C4B3E]">
                  <Mail className="w-4 h-4 text-[#764B24] shrink-0" />
                  <a
                    href={`mailto:${member.email}`}
                    className="hover:underline truncate font-medium text-[#1D1611]"
                  >
                    {member.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-[#5C4B3E]">
                  <Phone className="w-4 h-4 text-[#764B24] shrink-0" />
                  <span className="font-medium text-[#1D1611]">
                    {member.phone || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#5C4B3E] sm:col-span-2">
                  <MapPin className="w-4 h-4 text-[#764B24] shrink-0" />
                  <span className="truncate">{member.address || 'Address on file'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Patron Activity KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E0D5C7] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#7C6959] uppercase tracking-wider">
                  Total Borrowed
                </span>
                <BookOpen className="w-4 h-4 text-[#764B24]" />
              </div>
              <p className="text-2xl font-bold text-[#1D1611] mt-2">{member.totalBorrowed}</p>
              <p className="text-[11px] text-[#8C7A6B] mt-0.5">Lifetime circulation loans</p>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E0D5C7] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#7C6959] uppercase tracking-wider">
                  Active Loans
                </span>
                <BookUp className="w-4 h-4 text-[#E57338]" />
              </div>
              <p className="text-2xl font-bold text-[#1D1611] mt-2">
                {member.activeLoans.length}
              </p>
              <p className="text-[11px] text-[#8C7A6B] mt-0.5">Currently checked out</p>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E0D5C7] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#7C6959] uppercase tracking-wider">
                  Pending Fines
                </span>
                <DollarSign className="w-4 h-4 text-[#DC2626]" />
              </div>
              <p
                className={`text-2xl font-bold mt-2 ${
                  member.pendingFines > 0 ? 'text-[#DC2626]' : 'text-[#15803D]'
                }`}
              >
                ${member.pendingFines.toFixed(2)}
              </p>
              <p className="text-[11px] text-[#8C7A6B] mt-0.5">
                {member.pendingFines > 0 ? 'Due for late returns' : 'Clean record'}
              </p>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E0D5C7] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#7C6959] uppercase tracking-wider">
                  Fines Paid
                </span>
                <DollarSign className="w-4 h-4 text-[#15803D]" />
              </div>
              <p className="text-2xl font-bold text-[#1D1611] mt-2">
                ${member.totalFinesPaid.toFixed(2)}
              </p>
              <p className="text-[11px] text-[#8C7A6B] mt-0.5">Settled historical balance</p>
            </div>
          </div>

          {/* Tabs: Active Loans vs Circulation History */}
          <div className="bg-[#FAF7F2] rounded-2xl border border-[#E0D5C7] shadow-xs overflow-hidden">
            <div className="px-6 py-3.5 bg-[#F5EFE6] border-b border-[#EAE0D5] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('current')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'current'
                      ? 'bg-[#764B24] text-white shadow-xs'
                      : 'text-[#7C6959] hover:text-[#1D1611]'
                  }`}
                >
                  Current Borrowed Books ({member.activeLoans.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-[#764B24] text-white shadow-xs'
                      : 'text-[#7C6959] hover:text-[#1D1611]'
                  }`}
                >
                  Reading History ({member.returnedHistory.length})
                </button>
              </div>

              {activeTab === 'current' && member.activeLoans.length > 0 && (
                <span className="text-[11px] font-medium text-[#7C6959]">
                  {member.activeLoans.filter((l) => l.status === 'Overdue').length > 0 ? (
                    <span className="text-[#DC2626] font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Attention: Overdue books pending return
                    </span>
                  ) : (
                    'All borrowed items within return grace period'
                  )}
                </span>
              )}
            </div>

            {/* Tab 1: Current Borrowed Books */}
            {activeTab === 'current' && (
              <div className="p-6">
                {member.activeLoans.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-10 h-10 text-[#15803D] mx-auto mb-2" />
                    <p className="text-sm font-semibold text-[#1D1611]">
                      No active loans currently checked out
                    </p>
                    <p className="text-xs text-[#7C6959] mt-0.5">
                      This patron has returned all previously borrowed volumes.
                    </p>
                    <button
                      type="button"
                      onClick={() => setQuickActionModal('issue')}
                      className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#764B24] text-white hover:bg-[#5C3919] transition cursor-pointer"
                    >
                      Issue a Book to {member.fullName}
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#1D1611]">
                      <thead className="bg-[#F5EFE6] border-b border-[#EAE0D5] text-[#7C6959] uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-4 py-2.5 font-semibold">Book Title</th>
                          <th className="px-4 py-2.5 font-semibold">Category</th>
                          <th className="px-4 py-2.5 font-semibold">Issue Date</th>
                          <th className="px-4 py-2.5 font-semibold">Due Date</th>
                          <th className="px-4 py-2.5 font-semibold">Status / Fine</th>
                          <th className="px-4 py-2.5 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAE0D5]">
                        {member.activeLoans.map((loan) => (
                          <tr key={loan.id} className="hover:bg-[#F3ECE1] transition">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {loan.bookCover && (
                                  <img
                                    src={loan.bookCover}
                                    alt={loan.bookTitle}
                                    className="w-8 h-11 object-cover rounded-md border border-[#DED4C8] shrink-0"
                                  />
                                )}
                                <div>
                                  <Link
                                    to={`/books/${loan.bookId}`}
                                    className="font-semibold text-xs text-[#1D1611] hover:text-[#764B24] transition block"
                                  >
                                    {loan.bookTitle}
                                  </Link>
                                  <span className="text-[10.5px] font-mono text-[#8C7A6B]">
                                    Loan #{loan.id}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[#5C4B3E]">
                              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-[#EFE7DC] text-[#764B24]">
                                {loan.bookCategory}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[#5C4B3E]">
                              {formatDisplayDate(loan.issueDate)}
                            </td>
                            <td className="px-4 py-3 text-[#5C4B3E]">
                              {formatDisplayDate(loan.dueDate)}
                            </td>
                            <td className="px-4 py-3">
                              {loan.status === 'Overdue' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FEE2E2] text-[#DC2626]">
                                  <AlertTriangle className="w-3 h-3" />
                                  Overdue ({loan.overdueDays}d late - $
                                  {Number(loan.calculatedFine).toFixed(2)})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#DCFCE7] text-[#15803D]">
                                  Active (Due in {loan.dueDate})
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => returnBook(loan.id, true)}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#15803D] text-white hover:bg-[#166534] transition cursor-pointer shadow-xs"
                              >
                                Return Book
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Reading History */}
            {activeTab === 'history' && (
              <div className="p-6">
                {member.returnedHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-10 h-10 text-[#8C7A6B] mx-auto mb-2" />
                    <p className="text-sm font-semibold text-[#1D1611]">
                      No previous return history recorded
                    </p>
                    <p className="text-xs text-[#7C6959] mt-0.5">
                      Completed loans and returned volumes will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#1D1611]">
                      <thead className="bg-[#F5EFE6] border-b border-[#EAE0D5] text-[#7C6959] uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-4 py-2.5 font-semibold">Book Title</th>
                          <th className="px-4 py-2.5 font-semibold">Category</th>
                          <th className="px-4 py-2.5 font-semibold">Borrowed Date</th>
                          <th className="px-4 py-2.5 font-semibold">Returned Date</th>
                          <th className="px-4 py-2.5 font-semibold">Status</th>
                          <th className="px-4 py-2.5 font-semibold text-right">Fine Paid</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAE0D5]">
                        {member.returnedHistory.map((item) => (
                          <tr key={item.id} className="hover:bg-[#F3ECE1] transition">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {item.bookCover && (
                                  <img
                                    src={item.bookCover}
                                    alt={item.bookTitle}
                                    className="w-8 h-11 object-cover rounded-md border border-[#DED4C8] shrink-0"
                                  />
                                )}
                                <div>
                                  <Link
                                    to={`/books/${item.bookId}`}
                                    className="font-semibold text-xs text-[#1D1611] hover:text-[#764B24] transition block"
                                  >
                                    {item.bookTitle}
                                  </Link>
                                  <span className="text-[10.5px] font-mono text-[#8C7A6B]">
                                    Loan #{item.id}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[#5C4B3E]">
                              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-[#EFE7DC] text-[#764B24]">
                                {item.bookCategory}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[#5C4B3E]">
                              {formatDisplayDate(item.issueDate)}
                            </td>
                            <td className="px-4 py-3 text-[#5C4B3E]">
                              {formatDisplayDate(item.returnDate)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#EAE0D5] text-[#5C4B3E]">
                                <CheckCircle2 className="w-3 h-3 text-[#15803D]" />
                                Returned
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-[#1D1611]">
                              {item.paidFineAmount && item.paidFineAmount > 0 ? (
                                <span className="text-[#DC2626]">
                                  ${item.paidFineAmount.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-[#15803D]">$0.00</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <MemberFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        initialData={member}
      />

      <DeleteMemberConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        member={member}
        onConfirm={handleDeleteSuccess}
      />

      <QuickActionModals
        activeModal={quickActionModal}
        onClose={() => setQuickActionModal(null)}
      />
    </div>
  );
}
