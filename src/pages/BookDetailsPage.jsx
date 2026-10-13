import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Edit2,
  Trash2,
  BookUp,
  Calendar,
  Building2,
  Barcode,
  AlertTriangle,
  Clock,
  Star,
  Layers,
  LayoutGrid,
  Menu,
  X,
  LogOut,
  UserPlus,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLibrary, formatDisplayDate } from '../context/LibraryContext';
import { LibraXLogo } from '../components/common/LibraXLogo';
import { BookFormModal, DeleteConfirmModal } from '../components/books/BookModal';
import QuickActionModals from '../components/dashboard/QuickActionModals';

export default function BookDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    getBookById,
    issues,
    deleteBook,
    returnBook,
  } = useLibrary();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quickActionModal, setQuickActionModal] = useState(null);

  const book = useMemo(() => getBookById(id), [getBookById, id]);

  const bookCirculationHistory = useMemo(() => {
    return issues.filter((i) => i.bookId === id);
  }, [issues, id]);

  if (!book) {
    return (
      <div className="min-h-screen bg-[#F6EFE6] text-[#1D1611] font-sans flex items-center justify-center p-6">
        <div className="bg-[#FDFBF9] border border-[#ECE3D8] rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-md">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#1D1611]">Book Not Found</h2>
          <p className="text-xs text-[#6E6259]">
            The requested book ID does not exist in the catalog inventory or may have been deleted.
          </p>
          <Link
            to="/books"
            className="inline-flex items-center gap-1.5 bg-[#764922] hover:bg-[#5E391A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Book Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = book.availableCopies <= 0;
  const issuedCopiesCount = book.totalCopies - book.availableCopies;

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1D1611] font-sans flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* STICKY LEFT SIDEBAR */}
      <aside
        className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-56 h-screen bg-[#221209] text-[#F5EBE1] flex flex-col justify-between shrink-0 select-none transition-transform duration-300 ease-in-out overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="relative z-10">
          <div className="px-4 py-4 flex items-center justify-between">
            <LibraXLogo size="sm" lightText />
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-[#B89F88] hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="px-3 pt-1 space-y-1">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12.5px] font-medium text-[#D4C3B3] hover:bg-[#311C10] hover:text-white transition cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4 shrink-0" />
              <span>Dashboard Overview</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/books')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12.5px] font-medium bg-gradient-to-r from-[#8D5424] to-[#6E3F19] text-white shadow-sm transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Book Management</span>
            </button>

            <div className="pt-4 pb-1">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#9A826C] mb-1.5">
                QUICK ACTIONS
              </p>

              <button
                type="button"
                onClick={() => setQuickActionModal('issue')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-normal text-[#DFD0C1] hover:bg-[#311C10] hover:text-white transition cursor-pointer"
              >
                <BookUp className="w-3.5 h-3.5 text-[#E57338] shrink-0" />
                <span className="truncate">Quick Issue Book</span>
              </button>

              <button
                type="button"
                onClick={() => setQuickActionModal('return')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-normal text-[#DFD0C1] hover:bg-[#311C10] hover:text-white transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#25A567] shrink-0" />
                <span className="truncate">Quick Return Book</span>
              </button>

              <button
                type="button"
                onClick={() => setQuickActionModal('addBook')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-normal text-[#DFD0C1] hover:bg-[#311C10] hover:text-white transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#EAB308] border border-[#EAB308] rounded-full p-0.5 shrink-0" />
                <span className="truncate">Add New Catalog Book</span>
              </button>

              <button
                type="button"
                onClick={() => setQuickActionModal('addMember')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-normal text-[#DFD0C1] hover:bg-[#311C10] hover:text-white transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#3898FF] shrink-0" />
                <span className="truncate">Enroll New Member</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom Vintage Stacked Books Image */}
        <div className="relative mt-auto pt-3">
          <div className="relative h-40 w-full overflow-hidden">
            <img
              src="/library-bg.png"
              alt="Library Heritage Books"
              className="w-full h-full object-cover object-left-bottom brightness-90 contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#221209] via-[#221209]/30 to-black/70" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-center gap-1.5 bg-black/55 hover:bg-red-900/80 backdrop-blur-xs text-[#F5EBE1] text-[11px] font-medium py-1.5 px-2.5 rounded-lg border border-white/15 transition cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out ({user?.username || 'Librarian'})</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#F6EFE6]/95 backdrop-blur-md px-4 sm:px-6 pt-3.5 pb-2.5 border-b border-[#E6DCD0]/60">
          <div className="flex items-center justify-between gap-3 max-w-[1280px] mx-auto w-full">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-xl bg-white border border-[#E6DCD0] text-[#221209] cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link
                to="/books"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#764922] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Catalog
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-white border border-[#E8DFD5] hover:bg-[#FAF6F0] text-[#4A3E35] text-xs font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </header>

        {/* Book Details Body */}
        <main className="flex-1 px-4 sm:px-6 pb-6 pt-3 space-y-4 max-w-[1280px] w-full mx-auto">
          {/* Top Hero Card */}
          <div className="bg-[#FDFBF9] border border-[#ECE3D8] rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Cover Image */}
              <div className="shrink-0 mx-auto md:mx-0">
                <img
                  src={
                    book.coverImage ||
                    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80'
                  }
                  alt={book.title}
                  className="w-36 sm:w-44 h-52 sm:h-64 object-cover rounded-xl shadow-md border border-[#E8DFD5] bg-[#EFE7DC]"
                />
              </div>

              {/* Info Details */}
              <div className="flex-1 min-w-0 space-y-3.5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-xs font-semibold bg-[#F3E5D7] text-[#7D4E24] px-2.5 py-0.5 rounded-full">
                      {book.category}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        isOutOfStock
                          ? 'bg-red-100 text-red-700'
                          : 'bg-[#DCF5E7] text-[#17824C]'
                      }`}
                    >
                      {isOutOfStock ? 'Out of Stock' : `${book.availableCopies} Copies In Stock`}
                    </span>
                    {book.rating && (
                      <span className="text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {book.rating}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1611] tracking-tight">
                    {book.title}
                  </h1>
                  <p className="text-sm font-medium text-[#5A4D41] mt-0.5">
                    by <span className="font-semibold text-[#1D1611]">{book.author}</span>
                  </p>
                </div>

                {/* Key Specifications Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="bg-[#FAF6F1] border border-[#EFE7DD] rounded-xl p-2.5">
                    <span className="text-[10px] font-semibold uppercase text-[#8C7E71] flex items-center gap-1">
                      <Barcode className="w-3 h-3" /> ISBN Number
                    </span>
                    <p className="text-xs font-bold text-[#1D1611] font-mono mt-0.5 truncate">
                      {book.isbn || 'N/A'}
                    </p>
                  </div>

                  <div className="bg-[#FAF6F1] border border-[#EFE7DD] rounded-xl p-2.5">
                    <span className="text-[10px] font-semibold uppercase text-[#8C7E71] flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> Publisher
                    </span>
                    <p className="text-xs font-bold text-[#1D1611] mt-0.5 truncate">
                      {book.publisher || 'Heritage Press'}
                    </p>
                  </div>

                  <div className="bg-[#FAF6F1] border border-[#EFE7DD] rounded-xl p-2.5">
                    <span className="text-[10px] font-semibold uppercase text-[#8C7E71] flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Published Year
                    </span>
                    <p className="text-xs font-bold text-[#1D1611] mt-0.5">
                      {book.publishedYear}
                    </p>
                  </div>

                  <div className="bg-[#FAF6F1] border border-[#EFE7DD] rounded-xl p-2.5">
                    <span className="text-[10px] font-semibold uppercase text-[#8C7E71] flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Available / Total
                    </span>
                    <p className="text-xs font-bold text-[#1D1611] mt-0.5">
                      {book.availableCopies} of {book.totalCopies} copies
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C4B3E] mb-1">
                    Book Synopsis & Archival Notes
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#4A3E35] leading-relaxed">
                    {book.description ||
                      'Standard library reference volume cataloged in the institutional archive.'}
                  </p>
                </div>

                {/* Quick Action Button */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickActionModal('issue')}
                    disabled={isOutOfStock}
                    className="inline-flex items-center gap-1.5 bg-[#764922] hover:bg-[#5E391A] disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    <BookUp className="w-3.5 h-3.5" />
                    <span>Issue This Copy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditModalOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-white border border-[#E8DFD5] hover:bg-[#FAF6F0] text-[#4A3E35] text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Volume</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Issues & Circulation History for this Book */}
          <div className="bg-[#FDFBF9] border border-[#ECE3D8] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#F0E8DE] pb-2.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#764922]" />
                <h2 className="text-sm font-bold text-[#1D1611]">
                  Circulation History for this Title ({bookCirculationHistory.length} Records)
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-[#6E6259]">
                {issuedCopiesCount} active checkout(s)
              </span>
            </div>

            {bookCirculationHistory.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6E6259]">
                No checkouts or returns recorded for this title yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F6EFE7] text-[#5A4D41] text-[11px] font-semibold">
                      <th className="py-2 px-3 rounded-l-lg">Borrower</th>
                      <th className="py-2 px-3">Membership ID</th>
                      <th className="py-2 px-3">Issue Date</th>
                      <th className="py-2 px-3">Due Date</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 rounded-r-lg text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1EAE1] text-[11.5px]">
                    {bookCirculationHistory.map((iss) => (
                      <tr key={iss.id} className="hover:bg-[#FAF5EE]/60 transition">
                        <td className="py-2.5 px-3 font-semibold text-[#1D1611]">
                          {iss.memberName}
                        </td>
                        <td className="py-2.5 px-3 text-[#6E6259] font-mono text-[10.5px]">
                          {iss.membershipId}
                        </td>
                        <td className="py-2.5 px-3 text-[#6E6259]">
                          {formatDisplayDate(iss.issueDate)}
                        </td>
                        <td className="py-2.5 px-3 text-[#6E6259]">
                          {formatDisplayDate(iss.dueDate)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                              iss.status === 'Issued'
                                ? 'bg-[#DCF5E7] text-[#17824C]'
                                : iss.status === 'Returned'
                                ? 'bg-[#E3EEFF] text-[#2563EB]'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {iss.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {iss.status !== 'Returned' ? (
                            <button
                              type="button"
                              onClick={() => returnBook(iss.id, true)}
                              className="text-[11px] font-semibold text-[#764922] hover:underline cursor-pointer"
                            >
                              Return Copy
                            </button>
                          ) : (
                            <span className="text-[#8C7E71] text-[11px]">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      <BookFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        initialData={book}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        book={book}
        onConfirm={(id) => {
          const res = deleteBook(id);
          if (res.success) {
            navigate('/books');
          }
        }}
      />

      {/* Quick Action Modal */}
      <QuickActionModals
        activeModal={quickActionModal}
        onClose={() => setQuickActionModal(null)}
      />
    </div>
  );
}
