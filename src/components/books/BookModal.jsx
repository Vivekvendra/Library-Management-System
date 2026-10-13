import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, BookOpen, AlertTriangle } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export function BookFormModal({ isOpen, onClose, initialData = null }) {
  const { categories, addQuickBook, editBook } = useLibrary();
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      author: '',
      category: 'Fiction',
      isbn: '',
      publisher: '',
      publishedYear: new Date().getFullYear(),
      totalCopies: 5,
      coverImage: '',
      description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        author: initialData.author || '',
        category: initialData.category || 'Fiction',
        isbn: initialData.isbn || '',
        publisher: initialData.publisher || '',
        publishedYear: initialData.publishedYear || new Date().getFullYear(),
        totalCopies: initialData.totalCopies || 5,
        coverImage: initialData.coverImage || '',
        description: initialData.description || '',
      });
    } else {
      reset({
        title: '',
        author: '',
        category: 'Fiction',
        isbn: '',
        publisher: '',
        publishedYear: new Date().getFullYear(),
        totalCopies: 5,
        coverImage: '',
        description: '',
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data) => {
    if (isEditing) {
      const res = editBook({
        id: initialData.id,
        ...data,
      });
      if (res.success) handleClose();
    } else {
      const res = addQuickBook(data);
      if (res.success) handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FBF7F2] border border-[#E5DACB] rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative my-6 max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#EFE7DC] hover:bg-[#E2D4C3] flex items-center justify-center text-[#3D2715] cursor-pointer transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#764B24]/15 text-[#764B24] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1E140C]">
              {isEditing ? `Edit "${initialData.title}"` : 'Add New Book to Catalog'}
            </h2>
            <p className="text-xs text-[#6E6259]">
              {isEditing
                ? 'Update book details, copies, and catalog classification'
                : 'Enter book specifications to add a new volume to the library'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Title and Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                Book Title *
              </label>
              <input
                type="text"
                placeholder="e.g. The Great Gatsby"
                {...register('title', { required: 'Book title is required' })}
                className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3 py-2 text-xs text-[#1D1611] outline-none"
              />
              {errors.title && (
                <p className="text-[11px] text-red-600 mt-0.5">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                Author Name *
              </label>
              <input
                type="text"
                placeholder="e.g. F. Scott Fitzgerald"
                {...register('author', { required: 'Author name is required' })}
                className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3 py-2 text-xs text-[#1D1611] outline-none"
              />
              {errors.author && (
                <p className="text-[11px] text-red-600 mt-0.5">{errors.author.message}</p>
              )}
            </div>
          </div>

          {/* Category and Total Copies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                Category / Genre *
              </label>
              <input
                type="text"
                list="category-options-list"
                placeholder="Select or enter category"
                {...register('category', { required: 'Category is required' })}
                className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3 py-2 text-xs text-[#1D1611] outline-none"
              />
              <datalist id="category-options-list">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {errors.category && (
                <p className="text-[11px] text-red-600 mt-0.5">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                Total Copies *
              </label>
              <input
                type="number"
                min="1"
                max="200"
                {...register('totalCopies', {
                  required: 'Copies required',
                  min: { value: 1, message: 'Minimum 1 copy' },
                })}
                className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3 py-2 text-xs text-[#1D1611] outline-none"
              />
              {errors.totalCopies && (
                <p className="text-[11px] text-red-600 mt-0.5">{errors.totalCopies.message}</p>
              )}
            </div>
          </div>

          {/* ISBN, Publisher, Published Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                ISBN Number
              </label>
              <input
                type="text"
                placeholder="978-0-7432-7356-5"
                {...register('isbn')}
                className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3 py-2 text-xs text-[#1D1611] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                Publisher
              </label>
              <input
                type="text"
                placeholder="Scribner"
                {...register('publisher')}
                className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3 py-2 text-xs text-[#1D1611] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
                Published Year
              </label>
              <input
                type="number"
                min="1400"
                max={new Date().getFullYear() + 1}
                {...register('publishedYear')}
                className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3 py-2 text-xs text-[#1D1611] outline-none"
              />
            </div>
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
              Cover Image URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/cover.jpg (optional)"
              {...register('coverImage')}
              className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3 py-2 text-xs text-[#1D1611] outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5C4B3E] mb-1">
              Book Description
            </label>
            <textarea
              rows={2}
              placeholder="Enter synopsis or catalog notes..."
              {...register('description')}
              className="w-full bg-white border border-[#DED4C8] focus:border-[#764B24] rounded-xl px-3 py-2 text-xs text-[#1D1611] outline-none resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-[#EAE0D5]">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-2 rounded-xl border border-[#D8CBB8] text-xs font-medium text-[#5A493B] hover:bg-[#EFE7DC] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#764B24] hover:bg-[#5E3A1B] text-white text-xs font-semibold shadow-xs cursor-pointer transition"
            >
              {isEditing ? 'Save Changes' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteConfirmModal({ isOpen, onClose, book, onConfirm }) {
  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FBF7F2] border border-[#E5DACB] rounded-2xl max-w-sm w-full p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#EFE7DC] hover:bg-[#E2D4C3] flex items-center justify-center text-[#3D2715] cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <h3 className="text-center font-bold text-base text-[#1D1611]">
          Delete Book Record?
        </h3>
        <p className="text-center text-xs text-[#6E6259] mt-1 mb-4 leading-relaxed">
          Are you sure you want to remove{' '}
          <span className="font-semibold text-[#1D1611]">"{book.title}"</span> from the catalog? This will delete all catalog entries for this volume.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-[#D8CBB8] text-xs font-medium text-[#5A493B] hover:bg-[#EFE7DC] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(book.id);
              onClose();
            }}
            className="flex-1 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-semibold shadow-xs cursor-pointer transition"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
