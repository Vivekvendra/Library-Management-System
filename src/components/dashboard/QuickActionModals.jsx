import { useForm } from 'react-hook-form';
import {
  X,
  BookOpen,
  UserPlus,
  BookUp,
  BookDown,
  FolderPlus,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export default function QuickActionModals({ activeModal, onClose }) {
  const {
    books,
    members,
    categories,
    issues,
    issueBook,
    returnBook,
    collectFineForIssue,
    addQuickBook,
    addQuickMember,
    addQuickCategory,
  } = useLibrary();

  const availableBooks = books.filter((b) => b.availableCopies > 0);
  const activeIssuedList = issues.filter((i) => i.status !== 'Returned');
  const overdueList = activeIssuedList.filter((i) => i.status === 'Overdue');

  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  if (!activeModal) return null;

  const handleClose = () => {
    reset();
    onClose();
  };

  const onIssueSubmit = (data) => {
    const res = issueBook({
      bookId: data.bookId,
      memberId: data.memberId,
      dueDate: data.dueDate,
    });
    if (res.success) handleClose();
  };

  const onAddBookSubmit = (data) => {
    const res = addQuickBook(data);
    if (res.success) handleClose();
  };

  const onAddMemberSubmit = (data) => {
    const res = addQuickMember(data);
    if (res.success) handleClose();
  };

  const onAddCategorySubmit = (data) => {
    const res = addQuickCategory({ name: data.categoryName });
    if (res.success) handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FBF7F2] border border-[#E5DACB] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#EFE7DC] hover:bg-[#E2D4C3] flex items-center justify-center text-[#3D2715] cursor-pointer transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* MODAL 1: QUICK ISSUE BOOK */}
        {activeModal === 'issue' && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-[#764B24]/15 text-[#764B24] flex items-center justify-center">
                <BookUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-sans text-2xl font-bold text-[#1E140C]">
                  Issue Book to Member
                </h3>
                <p className="text-xs text-[#6E6259]">
                  Dynamically updates Books Issued, Books Available & Recent Activities
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onIssueSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1.5">
                  Select Available Book *
                </label>
                <select
                  {...register('bookId', { required: 'Please select a book' })}
                  className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3.5 py-2.5 text-sm text-[#231710] outline-none"
                >
                  <option value="">-- Choose a book from available stock --</option>
                  {availableBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} — {b.author} ({b.availableCopies} avail)
                    </option>
                  ))}
                </select>
                {errors.bookId && (
                  <p className="text-xs text-red-600 mt-1">{errors.bookId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1.5">
                  Select Registered Member *
                </label>
                <select
                  {...register('memberId', { required: 'Please select a member' })}
                  className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3.5 py-2.5 text-sm text-[#231710] outline-none"
                >
                  <option value="">-- Choose a library member --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.membershipId})
                    </option>
                  ))}
                </select>
                {errors.memberId && (
                  <p className="text-xs text-red-600 mt-1">{errors.memberId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1.5">
                  Return Due Date * (Pick a past date to test Overdue & Fine calculation!)
                </label>
                <input
                  type="date"
                  defaultValue={defaultDueDate()}
                  {...register('dueDate', { required: 'Due date is required' })}
                  className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3.5 py-2.5 text-sm text-[#231710] outline-none"
                />
                {errors.dueDate && (
                  <p className="text-xs text-red-600 mt-1">{errors.dueDate.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl border border-[#D8CBB8] text-sm font-medium text-[#5A493B] hover:bg-[#EFE7DC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#764B24] hover:bg-[#5E3A1B] text-white text-sm font-semibold shadow-md cursor-pointer transition"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL 2: QUICK RETURN BOOK */}
        {activeModal === 'return' && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-700/15 text-emerald-800 flex items-center justify-center">
                <BookDown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-sans text-2xl font-bold text-[#1E140C]">
                  Return Issued Book
                </h3>
                <p className="text-xs text-[#6E6259]">
                  Restores book availability & settles any overdue fine automatically
                </p>
              </div>
            </div>

            {activeIssuedList.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-[#EAE0D5]">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#231710]">
                  All issued books have been returned!
                </p>
                <p className="text-xs text-[#6E6259] mt-1">
                  Use "Quick Issue Book" to issue a book to a member.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {activeIssuedList.map((iss) => (
                  <div
                    key={iss.id}
                    className="bg-white border border-[#E6DDD2] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#231710]">
                          {iss.bookTitle}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            iss.status === 'Overdue'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {iss.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#6E6259] mt-0.5">
                        Member: <span className="font-medium text-[#231710]">{iss.memberName}</span> ({iss.membershipId}) • Due: {iss.dueDate}
                      </p>
                      {iss.calculatedFine > 0 && (
                        <p className="text-xs font-semibold text-red-600 mt-1">
                          Overdue Fine: ${iss.calculatedFine.toFixed(2)} ({iss.overdueDays} days late)
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => returnBook(iss.id, true)}
                      className="shrink-0 bg-[#764B24] hover:bg-[#5E3A1B] text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer transition"
                    >
                      {iss.calculatedFine > 0
                        ? `Return & Collect $${iss.calculatedFine.toFixed(2)}`
                        : 'Mark Returned'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL 3: QUICK ADD NEW BOOK */}
        {activeModal === 'addBook' && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-[#764B24]/15 text-[#764B24] flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-sans text-2xl font-bold text-[#1E140C]">
                  Add New Book to Catalog
                </h3>
                <p className="text-xs text-[#6E6259]">
                  Increments Total Books, Books Available & Categories in real time
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onAddBookSubmit)} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. The Brothers Karamazov"
                    {...register('title', { required: 'Book title is required' })}
                    className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  />
                  {errors.title && (
                    <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                    Author Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fyodor Dostoevsky"
                    {...register('author', { required: 'Author is required' })}
                    className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  />
                  {errors.author && (
                    <p className="text-xs text-red-600 mt-1">{errors.author.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    list="dashboard-category-list"
                    placeholder="Select or type new category"
                    {...register('category', { required: 'Category is required' })}
                    className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  />
                  <datalist id="dashboard-category-list">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                  {errors.category && (
                    <p className="text-xs text-red-600 mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                    Total Copies *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    defaultValue={5}
                    {...register('totalCopies', {
                      required: 'Copies required',
                      min: { value: 1, message: 'At least 1 copy' },
                    })}
                    className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                    ISBN Number
                  </label>
                  <input
                    type="text"
                    placeholder="978-0-14-044924-2"
                    {...register('isbn')}
                    className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                    Publisher
                  </label>
                  <input
                    type="text"
                    placeholder="Penguin Classics"
                    {...register('publisher')}
                    className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl border border-[#D8CBB8] text-sm font-medium text-[#5A493B] hover:bg-[#EFE7DC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#764B24] hover:bg-[#5E3A1B] text-white text-sm font-semibold shadow-md cursor-pointer transition"
                >
                  Add Book to Catalog
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL 4: QUICK REGISTER MEMBER */}
        {activeModal === 'addMember' && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-[#764B24]/15 text-[#764B24] flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-sans text-2xl font-bold text-[#1E140C]">
                  Enroll Library Member
                </h3>
                <p className="text-xs text-[#6E6259]">
                  Dynamically increments Total Members & logs enrollment activity
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onAddMemberSubmit)} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Clara Kensington"
                  {...register('fullName', { required: 'Full name is required' })}
                  className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3.5 py-2.5 text-sm outline-none"
                />
                {errors.fullName && (
                  <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="clara@university.edu"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Valid email required',
                      },
                    })}
                    className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 489-2031"
                    {...register('phone', { required: 'Mobile number is required' })}
                    className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  placeholder="24 Kensington Gardens, Reading District"
                  {...register('address')}
                  className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3.5 py-2.5 text-sm outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl border border-[#D8CBB8] text-sm font-medium text-[#5A493B] hover:bg-[#EFE7DC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#764B24] hover:bg-[#5E3A1B] text-white text-sm font-semibold shadow-md cursor-pointer transition"
                >
                  Register Member
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL 5: ADD CATEGORY & SETTLE FINES */}
        {activeModal === 'finesAndCategories' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-700/15 text-amber-800 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-display text-xl font-bold text-[#1E140C]">
                    Overdue Fines & Category Manager
                  </h3>
                  <p className="text-xs text-[#6E6259]">
                    Collect overdue fines ($2.50/day) or add a new catalog category
                  </p>
                </div>
              </div>

              {overdueList.length === 0 ? (
                <div className="bg-white border border-[#E6DDD2] rounded-2xl p-4 text-xs text-[#6E6259] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  No unpaid overdue book fines at the moment!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {overdueList.map((ov) => (
                    <div
                      key={ov.id}
                      className="bg-white border border-red-200 rounded-2xl p-3.5 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-xs font-bold text-[#231710] flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          {ov.bookTitle}
                        </p>
                        <p className="text-[11px] text-[#6E6259]">
                          {ov.memberName} • {ov.overdueDays} days overdue •{' '}
                          <span className="font-bold text-red-600">
                            Fine: ${ov.calculatedFine.toFixed(2)}
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => collectFineForIssue(ov.id)}
                        className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl cursor-pointer transition"
                      >
                        Collect ${ov.calculatedFine.toFixed(2)}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-[#E6DDD2] pt-5">
              <form
                onSubmit={handleSubmit(onAddCategorySubmit)}
                className="space-y-3"
              >
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4B3E]">
                  Create New Library Category
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. World Mythology & Folklore"
                    {...register('categoryName', {
                      required: 'Category name is required',
                    })}
                    className="flex-1 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 bg-[#764B24] hover:bg-[#5E3A1B] text-white text-sm font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition"
                  >
                    <FolderPlus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                {errors.categoryName && (
                  <p className="text-xs text-red-600">{errors.categoryName.message}</p>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
