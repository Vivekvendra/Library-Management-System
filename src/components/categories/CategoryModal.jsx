import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  X,
  Shapes,
  AlertTriangle,
  BookOpen,
  Search,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';

const PRESET_COLORS = [
  '#764B24',
  '#5B3216',
  '#EEB432',
  '#5E85E6',
  '#F27D31',
  '#158863',
  '#8B5CF6',
  '#EC4899',
  '#0EA5E9',
  '#10B981',
];

export function CategoryFormModal({ isOpen, onClose, initialCategory = null }) {
  const { addCategory, editCategory } = useLibrary();

  const isEditing = Boolean(initialCategory);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      color: '#764B24',
    },
  });

  const currentColor = watch('color');

  useEffect(() => {
    if (initialCategory) {
      reset({
        name: typeof initialCategory === 'string' ? initialCategory : initialCategory.name || '',
        description: initialCategory.description || '',
        color: initialCategory.color || '#764B24',
      });
    } else {
      reset({
        name: '',
        description: '',
        color: '#764B24',
      });
    }
  }, [initialCategory, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    if (isEditing) {
      const oldName = typeof initialCategory === 'string' ? initialCategory : initialCategory.name;
      const res = editCategory(oldName, {
        name: data.name,
        description: data.description,
        color: data.color,
      });
      if (res.success) onClose();
    } else {
      const res = addCategory({
        name: data.name,
        description: data.description,
        color: data.color,
      });
      if (res.success) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1D1611]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF7F2] rounded-2xl w-full max-w-md border border-[#E0D5C7] shadow-2xl p-6">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EAE0D5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#764B24] to-[#5B3216] text-white flex items-center justify-center shadow-xs">
              <Shapes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[15px] text-[#1D1611]">
                {isEditing ? `Edit Category: ${typeof initialCategory === 'string' ? initialCategory : initialCategory.name}` : 'Create New Category'}
              </h3>
              <p className="text-[11.5px] text-[#7C6959]">
                {isEditing ? 'Update category classification & color' : 'Add category to library catalog'}
              </p>
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

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
              Category Name <span className="text-[#C53030]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Science Fiction, Philosophy, Economics"
              {...register('name', {
                required: 'Category name is required',
                minLength: { value: 2, message: 'Minimum 2 characters' },
              })}
              className="w-full px-3 py-2 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none"
            />
            {errors.name && (
              <p className="text-[11px] text-[#C53030] mt-1 font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
              Classification Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief description of this literary classification..."
              {...register('description')}
              className="w-full px-3 py-2 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none resize-none"
            />
          </div>

          {/* Color Tag Selection */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-2">
              Category Badge Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue('color', c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition cursor-pointer ${
                    currentColor === c
                      ? 'ring-2 ring-offset-2 ring-[#1D1611] scale-110'
                      : 'hover:scale-105'
                  }`}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAE0D5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#7C6959] hover:bg-[#EAE0D5] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#764B24] text-white shadow-xs hover:bg-[#5C3919] transition cursor-pointer"
            >
              {isEditing ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteCategoryConfirmModal({ isOpen, onClose, categoryName }) {
  const { categories, books, deleteCategory } = useLibrary();
  const [fallbackCategory, setFallbackCategory] = useState('Others');

  if (!isOpen || !categoryName) return null;

  const affectedBooks = books.filter((b) => b.category === categoryName);
  const otherCategories = categories.filter((c) => c !== categoryName);

  const handleDelete = () => {
    const res = deleteCategory(categoryName, fallbackCategory);
    if (res.success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1D1611]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF7F2] rounded-2xl w-full max-w-md border border-[#E0D5C7] shadow-2xl p-6">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EAE0D5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[15px] text-[#1D1611]">Delete Category</h3>
              <p className="text-[11.5px] text-[#7C6959]">{categoryName}</p>
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

        <div className="mt-4 space-y-3.5 text-xs">
          <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#991B1B] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Confirm Category Removal</p>
              <p className="mt-0.5 text-[11px] text-[#B91C1C]">
                Are you sure you want to remove <strong>&quot;{categoryName}&quot;</strong>?
                {affectedBooks.length > 0 && (
                  <span>
                    {' '}There are currently <strong>{affectedBooks.length} book(s)</strong> cataloged under this category.
                  </span>
                )}
              </p>
            </div>
          </div>

          {affectedBooks.length > 0 && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1.5">
                Reassign Existing Books To:
              </label>
              <select
                value={fallbackCategory}
                onChange={(e) => setFallbackCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl text-xs text-[#1D1611] outline-none"
              >
                {otherCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAE0D5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#7C6959] hover:bg-[#EAE0D5] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#DC2626] text-white shadow-xs hover:bg-[#B91C1C] transition cursor-pointer"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GlobalSearchModal({ isOpen, onClose }) {
  const { books, members, issues } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchEntity, setSearchEntity] = useState('ALL'); // 'ALL' | 'TITLE' | 'AUTHOR' | 'ISBN' | 'MEMBERS'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const q = searchTerm.toLowerCase().trim();

  // Matched Books
  const matchedBooks = books.filter((b) => {
    if (!q) return false;
    if (searchEntity === 'TITLE') return b.title.toLowerCase().includes(q);
    if (searchEntity === 'AUTHOR') return b.author.toLowerCase().includes(q);
    if (searchEntity === 'ISBN') return (b.isbn || '').toLowerCase().includes(q);
    if (searchEntity === 'MEMBERS') return false;
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      (b.isbn || '').toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    );
  });

  // Matched Members
  const matchedMembers = members.filter((m) => {
    if (!q) return false;
    if (searchEntity === 'TITLE' || searchEntity === 'AUTHOR' || searchEntity === 'ISBN') {
      return false;
    }
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.membershipId || '').toLowerCase().includes(q)
    );
  });

  // Matched Loans
  const matchedLoans = issues.filter((i) => {
    if (!q) return false;
    if (searchEntity !== 'ALL') return false;
    return (
      (i.id || '').toLowerCase().includes(q) ||
      (i.bookTitle || '').toLowerCase().includes(q) ||
      (i.memberName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#1D1611]/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div className="bg-[#FAF7F2] rounded-2xl w-full max-w-2xl border border-[#E0D5C7] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#EAE0D5] bg-white flex items-center gap-3">
          <Search className="w-5 h-5 text-[#764B24] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search catalog by title, author, ISBN, patron name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm text-[#1D1611] outline-none placeholder:text-[#A08E80]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-xs text-[#8C7A6B] hover:text-[#1D1611]"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7C6959] hover:bg-[#FAF7F2] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Entity Pills */}
        <div className="px-4 py-2.5 bg-[#FAF7F2] border-b border-[#EAE0D5] flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7C6959]">
            Search Scope:
          </span>
          {[
            { id: 'ALL', label: 'All Fields' },
            { id: 'TITLE', label: 'Book Title' },
            { id: 'AUTHOR', label: 'Author Name' },
            { id: 'ISBN', label: 'ISBN Number' },
            { id: 'MEMBERS', label: 'Patrons' },
          ].map((scope) => (
            <button
              key={scope.id}
              type="button"
              onClick={() => setSearchEntity(scope.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                searchEntity === scope.id
                  ? 'bg-[#764B24] text-white shadow-2xs font-semibold'
                  : 'bg-white border border-[#E0D5C7] text-[#5C4B3E] hover:bg-[#FAF7F2]'
              }`}
            >
              {scope.label}
            </button>
          ))}
        </div>

        {/* Search Results Area */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {!searchTerm.trim() ? (
            <div className="text-center py-8 text-xs text-[#7C6959]">
              Type a title, author name, ISBN barcode, or patron ID to search the library system.
            </div>
          ) : matchedBooks.length === 0 && matchedMembers.length === 0 && matchedLoans.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#7C6959]">
              No library records found matching &quot;{searchTerm}&quot; in scope &quot;{searchEntity}&quot;.
            </div>
          ) : (
            <>
              {/* Books Section */}
              {matchedBooks.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#7C6959] mb-2 flex items-center justify-between">
                    <span>Books ({matchedBooks.length})</span>
                    <span className="text-[10px] text-[#8C7A6B]">Search by Title / Author / ISBN</span>
                  </h4>
                  <div className="divide-y divide-[#EAE0D5] bg-white rounded-xl border border-[#EAE0D5]">
                    {matchedBooks.slice(0, 5).map((b) => (
                      <Link
                        key={b.id}
                        to={`/books/${b.id}`}
                        onClick={onClose}
                        className="p-3 flex items-center justify-between hover:bg-[#FAF7F2] transition group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {b.coverImage ? (
                            <img
                              src={b.coverImage}
                              alt={b.title}
                              className="w-8 h-11 object-cover rounded shadow-2xs shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-11 rounded bg-[#FAF7F2] flex items-center justify-center text-[#764B24] shrink-0">
                              <BookOpen className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-[#1D1611] group-hover:text-[#764B24] transition truncate">
                              {b.title}
                            </p>
                            <p className="text-[11px] text-[#7C6959] truncate">
                              by {b.author} • <span className="font-mono">{b.isbn}</span>
                            </p>
                          </div>
                        </div>
                        <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-[#FAF0E6] text-[#764B24] font-medium shrink-0">
                          {b.category}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Members Section */}
              {matchedMembers.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#7C6959] mb-2">
                    Patrons / Members ({matchedMembers.length})
                  </h4>
                  <div className="divide-y divide-[#EAE0D5] bg-white rounded-xl border border-[#EAE0D5]">
                    {matchedMembers.slice(0, 4).map((m) => (
                      <Link
                        key={m.id}
                        to={`/members/${m.id}`}
                        onClick={onClose}
                        className="p-3 flex items-center justify-between hover:bg-[#FAF7F2] transition group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#764B24] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {m.fullName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-[#1D1611] group-hover:text-[#764B24] transition truncate">
                              {m.fullName}
                            </p>
                            <p className="text-[11px] text-[#7C6959] truncate">
                              {m.email} • ID: <span className="font-mono text-[#764B24]">{m.membershipId}</span>
                            </p>
                          </div>
                        </div>
                        <span className="text-[10.5px] font-semibold text-[#15803D]">
                          Active Patron
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Loans Section */}
              {matchedLoans.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#7C6959] mb-2">
                    Circulation Loans ({matchedLoans.length})
                  </h4>
                  <div className="divide-y divide-[#EAE0D5] bg-white rounded-xl border border-[#EAE0D5]">
                    {matchedLoans.slice(0, 3).map((iss) => (
                      <Link
                        key={iss.id}
                        to="/circulation"
                        onClick={onClose}
                        className="p-3 flex items-center justify-between hover:bg-[#FAF7F2] transition group cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold text-xs text-[#1D1611] group-hover:text-[#764B24] transition">
                            {iss.bookTitle}
                          </p>
                          <p className="text-[11px] text-[#7C6959]">
                            Issued to {iss.memberName} • Loan #{iss.id}
                          </p>
                        </div>
                        <span
                          className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                            iss.status === 'Overdue'
                              ? 'bg-[#FEE2E2] text-[#DC2626]'
                              : iss.status === 'Returned'
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : 'bg-[#FEF3EB] text-[#C05621]'
                          }`}
                        >
                          {iss.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
