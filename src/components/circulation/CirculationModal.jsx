import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  X,
  BookUp,
  RotateCcw,
  Calendar,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { useLibrary, formatDisplayDate, calculateOverdueDays } from '../../context/LibraryContext';

export function IssueBookModal({ isOpen, onClose, preselectedBookId = null, preselectedMemberId = null }) {
  const { books, members, issues, issueBook } = useLibrary();

  const [bookSearch, setBookSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');

  const todayIso = new Date().toISOString().split('T')[0];
  const defaultDueIso = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      bookId: preselectedBookId || '',
      memberId: preselectedMemberId || '',
      issueDate: todayIso,
      dueDate: defaultDueIso(),
    },
  });

  const selectedBookId = watch('bookId');
  const selectedMemberId = watch('memberId');
  const watchedIssueDate = watch('issueDate');

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      if (!bookSearch.trim()) return true;
      const q = bookSearch.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        (b.isbn || '').toLowerCase().includes(q)
      );
    });
  }, [books, bookSearch]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (!memberSearch.trim()) return true;
      const q = memberSearch.toLowerCase();
      return (
        m.fullName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.membershipId || '').toLowerCase().includes(q) ||
        (m.phone || '').toLowerCase().includes(q)
      );
    });
  }, [members, memberSearch]);

  const selectedBook = books.find((b) => b.id === selectedBookId);
  const selectedMember = members.find((m) => m.id === selectedMemberId);

  // Duplicate active issue check
  const duplicateActiveIssue = useMemo(() => {
    if (!selectedBookId || !selectedMemberId) return null;
    return issues.find(
      (i) =>
        i.bookId === selectedBookId &&
        i.memberId === selectedMemberId &&
        i.status !== 'Returned'
    );
  }, [issues, selectedBookId, selectedMemberId]);

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    setBookSearch('');
    setMemberSearch('');
    onClose();
  };

  const onSubmit = (formData) => {
    if (duplicateActiveIssue) return;
    const res = issueBook({
      bookId: formData.bookId,
      memberId: formData.memberId,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
    });
    if (res.success) {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1D1611]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-2xl w-full max-w-xl border border-[#E0D5C7] shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-[#F5EFE6] border-b border-[#EAE0D5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E57338] to-[#993A11] text-white flex items-center justify-center shadow-xs">
              <BookUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[16px] text-[#1D1611]">Issue Library Book</h3>
              <p className="text-[12px] text-[#7C6959]">
                Circulate a book to a registered library patron
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#7C6959] hover:bg-[#EAE0D5] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Select Patron / Member */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
              Select Member <span className="text-[#C53030]">*</span>
            </label>
            <div className="space-y-1.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8C7A6B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search patron by name, email, or membership ID..."
                  className="w-full pl-8.5 pr-3 py-1.5 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none"
                />
              </div>

              <select
                {...register('memberId', { required: 'Please select a library member' })}
                className="w-full px-3 py-2 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none cursor-pointer"
              >
                <option value="">-- Choose a Registered Patron --</option>
                {filteredMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.membershipId}) — {m.email}
                  </option>
                ))}
              </select>
            </div>
            {errors.memberId && (
              <p className="text-[11px] text-[#C53030] mt-1 font-medium">
                {errors.memberId.message}
              </p>
            )}

            {/* Selected Member Preview Card */}
            {selectedMember && (
              <div className="mt-2 p-2.5 bg-white rounded-xl border border-[#EAE0D5] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#EAE0D5] text-[#764B24] font-bold text-xs flex items-center justify-center shrink-0">
                    {selectedMember.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1D1611] truncate">{selectedMember.fullName}</p>
                    <p className="text-[11px] text-[#7C6959] font-mono">{selectedMember.membershipId}</p>
                  </div>
                </div>
                <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D]">
                  {selectedMember.status}
                </span>
              </div>
            )}
          </div>

          {/* Select Book */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
              Select Book <span className="text-[#C53030]">*</span>
            </label>
            <div className="space-y-1.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8C7A6B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  placeholder="Search book by title, author, category, ISBN..."
                  className="w-full pl-8.5 pr-3 py-1.5 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none"
                />
              </div>

              <select
                {...register('bookId', { required: 'Please select a catalog book' })}
                className="w-full px-3 py-2 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none cursor-pointer"
              >
                <option value="">-- Choose a Catalog Book --</option>
                {filteredBooks.map((b) => (
                  <option
                    key={b.id}
                    value={b.id}
                    disabled={b.availableCopies <= 0}
                  >
                    {b.title} by {b.author} [{b.availableCopies} available / {b.totalCopies} total]
                    {b.availableCopies <= 0 ? ' (Out of Stock)' : ''}
                  </option>
                ))}
              </select>
            </div>
            {errors.bookId && (
              <p className="text-[11px] text-[#C53030] mt-1 font-medium">
                {errors.bookId.message}
              </p>
            )}

            {/* Selected Book Preview Card */}
            {selectedBook && (
              <div className="mt-2 p-2.5 bg-white rounded-xl border border-[#EAE0D5] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  {selectedBook.coverImage && (
                    <img
                      src={selectedBook.coverImage}
                      alt={selectedBook.title}
                      className="w-7 h-10 object-cover rounded shadow-xs shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1D1611] truncate">{selectedBook.title}</p>
                    <p className="text-[11px] text-[#7C6959]">{selectedBook.author} • {selectedBook.category}</p>
                  </div>
                </div>
                <span
                  className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                    selectedBook.availableCopies > 0
                      ? 'bg-[#DCFCE7] text-[#15803D]'
                      : 'bg-[#FEE2E2] text-[#B91C1C]'
                  }`}
                >
                  {selectedBook.availableCopies}/{selectedBook.totalCopies} Available
                </span>
              </div>
            )}
          </div>

          {/* Duplicate Active Loan Warning */}
          {duplicateActiveIssue && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-start gap-2.5 text-xs text-[#991B1B]">
              <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Duplicate Issue Prevented</p>
                <p className="text-[11px] mt-0.5 text-[#B91C1C]">
                  <strong>{selectedMember?.fullName}</strong> already has an active checked-out
                  copy of <strong>&quot;{selectedBook?.title}&quot;</strong> (Loan #{duplicateActiveIssue.id}). A patron cannot borrow duplicate copies of the same book simultaneously.
                </p>
              </div>
            </div>
          )}

          {/* Dates: Issue Date & Return Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                Issue Date <span className="text-[#C53030]">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-2.5" />
                <input
                  type="date"
                  {...register('issueDate', { required: 'Issue date is required' })}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none"
                />
              </div>
              {errors.issueDate && (
                <p className="text-[11px] text-[#C53030] mt-1 font-medium">
                  {errors.issueDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                Return Due Date <span className="text-[#C53030]">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-2.5" />
                <input
                  type="date"
                  min={watchedIssueDate || todayIso}
                  {...register('dueDate', {
                    required: 'Return due date is required',
                    validate: (value) =>
                      !watchedIssueDate ||
                      value >= watchedIssueDate ||
                      'Due date must be after or on issue date',
                  })}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none"
                />
              </div>
              {errors.dueDate && (
                <p className="text-[11px] text-[#C53030] mt-1 font-medium">
                  {errors.dueDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Quick Grace Period Buttons */}
          <div className="flex items-center gap-2 pt-1 text-[11px] text-[#7C6959]">
            <span className="font-medium">Quick duration:</span>
            <button
              type="button"
              onClick={() => {
                const d = new Date(watchedIssueDate || todayIso);
                d.setDate(d.getDate() + 7);
                setValue('dueDate', d.toISOString().split('T')[0]);
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#DED4C8] hover:bg-[#EFE7DC] transition cursor-pointer"
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => {
                const d = new Date(watchedIssueDate || todayIso);
                d.setDate(d.getDate() + 14);
                setValue('dueDate', d.toISOString().split('T')[0]);
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#DED4C8] hover:bg-[#EFE7DC] transition cursor-pointer font-semibold text-[#764B24]"
            >
              14 Days (Standard)
            </button>
            <button
              type="button"
              onClick={() => {
                const d = new Date(watchedIssueDate || todayIso);
                d.setDate(d.getDate() + 30);
                setValue('dueDate', d.toISOString().split('T')[0]);
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#DED4C8] hover:bg-[#EFE7DC] transition cursor-pointer"
            >
              30 Days
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAE0D5]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#7C6959] hover:bg-[#EAE0D5] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || Boolean(duplicateActiveIssue) || (selectedBook && selectedBook.availableCopies <= 0)}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#E57338] to-[#B84E18] text-white shadow-sm hover:brightness-110 transition cursor-pointer disabled:opacity-50"
            >
              Confirm Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ReturnBookModal({ isOpen, onClose, issueRecord }) {
  const { returnBook } = useLibrary();

  const [collectFine, setCollectFine] = useState(true);
  const todayIso = new Date().toISOString().split('T')[0];
  const [returnDate, setReturnDate] = useState(todayIso);

  if (!isOpen || !issueRecord) return null;

  const overdueDays = calculateOverdueDays(issueRecord.dueDate);
  const fineAmount = overdueDays > 0 ? overdueDays * 5.0 : 0;

  const handleConfirmReturn = () => {
    returnBook(issueRecord.id, collectFine, returnDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1D1611]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF7F2] rounded-2xl w-full max-w-md border border-[#E0D5C7] shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EAE0D5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#15803D] text-white flex items-center justify-center shadow-xs">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[15px] text-[#1D1611]">Process Book Return</h3>
              <p className="text-[11.5px] text-[#7C6959]">Loan #{issueRecord.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#7C6959] hover:bg-[#EAE0D5] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Loan Details */}
        <div className="my-4 space-y-3">
          {/* Book Info */}
          <div className="p-3 bg-white rounded-xl border border-[#EAE0D5] flex items-center gap-3">
            {issueRecord.bookCover && (
              <img
                src={issueRecord.bookCover}
                alt={issueRecord.bookTitle}
                className="w-10 h-14 object-cover rounded shadow-2xs shrink-0"
              />
            )}
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-[#1D1611] truncate">{issueRecord.bookTitle}</h4>
              <p className="text-[11px] text-[#7C6959] mt-0.5">{issueRecord.bookCategory}</p>
              <p className="text-[11px] text-[#5C4B3E] mt-1">
                Patron: <strong className="text-[#1D1611]">{issueRecord.memberName}</strong> (
                <span className="font-mono text-[#764B24]">{issueRecord.membershipId}</span>)
              </p>
            </div>
          </div>

          {/* Dates Comparison */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-white rounded-xl border border-[#EAE0D5]">
              <span className="text-[10.5px] text-[#7C6959] block">Borrowed Date</span>
              <strong className="text-[#1D1611] text-xs">
                {formatDisplayDate(issueRecord.issueDate)}
              </strong>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-[#EAE0D5]">
              <span className="text-[10.5px] text-[#7C6959] block">Return Due Date</span>
              <strong className={`text-xs ${overdueDays > 0 ? 'text-[#DC2626]' : 'text-[#1D1611]'}`}>
                {formatDisplayDate(issueRecord.dueDate)}
              </strong>
            </div>
          </div>

          {/* Actual Return Date Picker */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
              Actual Return Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-2.5" />
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none"
              />
            </div>
          </div>

          {/* Overdue Calculation Banner */}
          {overdueDays > 0 ? (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#991B1B] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
                  Overdue Loan ({overdueDays} Days Late)
                </span>
                <span className="text-sm font-bold text-[#DC2626]">
                  ${fineAmount.toFixed(2)} Fine
                </span>
              </div>
              <label className="flex items-center gap-2 text-xs text-[#5C4B3E] cursor-pointer pt-1 border-t border-[#FCA5A5]/40">
                <input
                  type="checkbox"
                  checked={collectFine}
                  onChange={(e) => setCollectFine(e.target.checked)}
                  className="rounded text-[#15803D] focus:ring-0 cursor-pointer"
                />
                <span>Collect and settle overdue fine now</span>
              </label>
            </div>
          ) : (
            <div className="p-2.5 bg-[#DCFCE7]/60 border border-[#86EFAC] rounded-xl text-xs text-[#166534] flex items-center gap-2">
              <span className="font-semibold">Returned on time!</span>
              <span>No overdue charges apply.</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-[#EAE0D5]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[#7C6959] hover:bg-[#EAE0D5] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmReturn}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#16A34A] text-white hover:bg-[#15803D] transition cursor-pointer shadow-sm"
          >
            Confirm Return
          </button>
        </div>
      </div>
    </div>
  );
}
