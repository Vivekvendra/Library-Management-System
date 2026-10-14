import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Eye,
  BookUp,
  Menu,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Table as TableIcon,
  LayoutGrid,
  X,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import Sidebar from '../components/common/Sidebar';
import { BookFormModal, DeleteConfirmModal } from '../components/books/BookModal';
import QuickActionModals from '../components/dashboard/QuickActionModals';

export default function BookManagementPage() {
  const {
    books,
    categories,
    loading,
    deleteBook,
    syncWithApi,
  } = useLibrary();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAuthor, setSelectedAuthor] = useState('All');
  const [sortBy, setSortBy] = useState('title-asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Modals state
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deletingBook, setDeletingBook] = useState(null);
  const [quickActionModal, setQuickActionModal] = useState(null);

  // Extract distinct authors
  const uniqueAuthors = useMemo(() => {
    return Array.from(new Set(books.map((b) => b.author).filter(Boolean))).sort();
  }, [books]);

  // Filter & Sort logic
  const filteredAndSortedBooks = useMemo(() => {
    let list = books.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.isbn && b.isbn.toLowerCase().includes(q)) ||
        (b.publisher && b.publisher.toLowerCase().includes(q)) ||
        b.category.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === 'All' || b.category === selectedCategory;

      const matchesAuth =
        selectedAuthor === 'All' || b.author === selectedAuthor;

      return matchesSearch && matchesCat && matchesAuth;
    });

    list.sort((a, b) => {
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
      if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
      if (sortBy === 'year-desc') return b.publishedYear - a.publishedYear;
      if (sortBy === 'year-asc') return a.publishedYear - b.publishedYear;
      if (sortBy === 'copies-desc') return b.totalCopies - a.totalCopies;
      if (sortBy === 'avail-desc') return b.availableCopies - a.availableCopies;
      return 0;
    });

    return list;
  }, [books, searchQuery, selectedCategory, selectedAuthor, sortBy]);

  // Pagination slice
  const totalItems = filteredAndSortedBooks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedBooks = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return filteredAndSortedBooks.slice(start, start + itemsPerPage);
  }, [filteredAndSortedBooks, safeCurrentPage, itemsPerPage]);

  const handleEdit = (book) => {
    setEditingBook(book);
    setBookModalOpen(true);
  };

  const handleCreate = () => {
    setEditingBook(null);
    setBookModalOpen(true);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedAuthor('All');
    setSortBy('title-asc');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== 'All' || selectedAuthor !== 'All' || sortBy !== 'title-asc';

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1D1611] font-sans flex">
      {/* SHARED STICKY SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* MAIN CONTENT AREA */}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#F6EFE6]/95 backdrop-blur-md px-4 sm:px-6 pt-3.5 pb-2.5 border-b border-[#E6DCD0]/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-[1360px] mx-auto w-full">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-xl bg-white border border-[#E6DCD0] text-[#221209] cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-[22px] font-bold text-[#1D1611]">
                    Book Management
                  </h1>
                  <span className="text-[11px] font-semibold bg-[#F3E5D7] text-[#7D4E24] px-2.5 py-0.5 rounded-full">
                    Module 3 Active
                  </span>
                </div>
                <p className="text-[11.5px] sm:text-xs text-[#6E6259]">
                  {books.length} Catalog Titles • {books.reduce((s, b) => s + b.totalCopies, 0)} Total Copies Across {categories.length} Genres
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={syncWithApi}
                disabled={loading}
                title="Sync from DummyJSON API"
                className="inline-flex items-center gap-1.5 bg-white border border-[#E8DFD5] hover:bg-[#FAF6F0] text-[#4A3E35] text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync API</span>
              </button>

              <button
                type="button"
                onClick={handleCreate}
                className="inline-flex items-center gap-1.5 bg-[#764922] hover:bg-[#5E391A] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Book</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 px-4 sm:px-6 pb-6 pt-3 space-y-3.5 max-w-[1360px] w-full mx-auto">
          {/* SEARCH, FILTERS & CONTROLS BAR */}
          <div className="bg-[#FDFBF9] border border-[#ECE3D8] rounded-2xl p-3.5 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
              {/* Search input (5 cols) */}
              <div className="md:col-span-5 relative">
                <Search className="w-3.5 h-3.5 text-[#8C7E71] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by Title, Author, ISBN, Publisher..."
                  className="w-full bg-white border border-[#E8DFD5] focus:border-[#764922] rounded-xl pl-8.5 pr-8 py-2 text-xs text-[#1D1611] placeholder-[#8C7E71] outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C7E71] hover:text-[#1D1611] p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Filter by Category (2.5 cols) */}
              <div className="md:col-span-3 flex items-center gap-1.5 bg-white border border-[#E8DFD5] rounded-xl px-2.5 py-1.5">
                <Filter className="w-3.5 h-3.5 text-[#764922] shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-transparent text-xs text-[#1D1611] outline-none cursor-pointer"
                >
                  <option value="All">All Categories ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Author (2.5 cols) */}
              <div className="md:col-span-2.5 flex items-center gap-1.5 bg-white border border-[#E8DFD5] rounded-xl px-2.5 py-1.5">
                <select
                  value={selectedAuthor}
                  onChange={(e) => {
                    setSelectedAuthor(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-transparent text-xs text-[#1D1611] outline-none cursor-pointer truncate"
                >
                  <option value="All">All Authors ({uniqueAuthors.length})</option>
                  {uniqueAuthors.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort by Title / Field (1.5 cols) */}
              <div className="md:col-span-1.5 flex items-center gap-1.5 bg-white border border-[#E8DFD5] rounded-xl px-2 py-1.5">
                <ArrowUpDown className="w-3 h-3 text-[#764922] shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#1D1611] outline-none cursor-pointer truncate"
                >
                  <option value="title-asc">Title: A-Z</option>
                  <option value="title-desc">Title: Z-A</option>
                  <option value="year-desc">Year: Newest</option>
                  <option value="year-asc">Year: Oldest</option>
                  <option value="copies-desc">Copies: High-Low</option>
                  <option value="avail-desc">Available First</option>
                </select>
              </div>
            </div>

            {/* Active filters pill & View Mode toggle row */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F2ECE4]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[#6E6259]">
                  Showing <strong className="text-[#1D1611]">{filteredAndSortedBooks.length}</strong> of{' '}
                  <strong className="text-[#1D1611]">{books.length}</strong> books
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-[#764922] hover:underline font-semibold text-[11px] cursor-pointer"
                  >
                    Reset all filters
                  </button>
                )}
              </div>

              {/* Grid vs Table View mode toggle */}
              <div className="flex items-center gap-1 bg-[#F4EDE4] p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Card Grid View"
                  className={`p-1 rounded-md transition cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#764922] shadow-2xs font-semibold'
                      : 'text-[#6E6259] hover:text-[#1D1611]'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  title="Compact Table View"
                  className={`p-1 rounded-md transition cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-[#764922] shadow-2xs font-semibold'
                      : 'text-[#6E6259] hover:text-[#1D1611]'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* LOADING SKELETON */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#EAE0D5] rounded-2xl p-4 h-64"
                />
              ))}
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && paginatedBooks.length === 0 && (
            <div className="bg-[#FDFBF9] border border-[#ECE3D8] rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#F4E8DC] text-[#764922] flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-[#1D1611]">
                No books match your criteria
              </h2>
              <p className="text-xs text-[#6E6259] max-w-sm mx-auto">
                Try adjusting your search terms, author, or category filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="bg-[#764922] hover:bg-[#5E391A] text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* VIEW MODE 1: GRID CARDS VIEW */}
          {!loading && viewMode === 'grid' && paginatedBooks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {paginatedBooks.map((book) => {
                const isOutOfStock = book.availableCopies <= 0;
                return (
                  <div
                    key={book.id}
                    className="bg-[#FDFBF9] border border-[#ECE3D8] hover:border-[#764922] rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top: Cover + Title + Category */}
                      <div className="flex items-start gap-3">
                        <Link
                          to={`/books/${book.id}`}
                          className="shrink-0 group-hover:scale-102 transition"
                        >
                          <img
                            src={
                              book.coverImage ||
                              'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&auto=format&fit=crop&q=80'
                            }
                            alt={book.title}
                            className="w-16 h-22 object-cover rounded-lg shadow-xs bg-[#EFE7DC]"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <span className="inline-block text-[10px] font-semibold bg-[#F3E5D7] text-[#7D4E24] px-2 py-0.5 rounded-full mb-1">
                            {book.category}
                          </span>
                          <Link
                            to={`/books/${book.id}`}
                            className="font-bold text-xs text-[#1D1611] hover:text-[#764922] line-clamp-2 leading-snug block"
                          >
                            {book.title}
                          </Link>
                          <p className="text-[11px] text-[#6E6259] truncate mt-0.5">
                            {book.author}
                          </p>
                          <p className="text-[10px] text-[#8C7E71] mt-0.5 truncate">
                            {book.publisher} • {book.publishedYear}
                          </p>
                        </div>
                      </div>

                      {/* Description excerpt */}
                      <p className="text-[11px] text-[#5A4D41] line-clamp-2 mt-2 leading-relaxed">
                        {book.description}
                      </p>

                      {/* Stock Pill & ISBN */}
                      <div className="mt-2.5 pt-2 border-t border-[#F1EAE1] flex items-center justify-between text-[11px]">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-md ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-700'
                              : 'bg-[#DCF5E7] text-[#17824C]'
                          }`}
                        >
                          {book.availableCopies} / {book.totalCopies} Available
                        </span>
                        <span className="text-[10px] text-[#8C7E71] font-mono">
                          {book.isbn ? `ISBN ${book.isbn.slice(-7)}` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Actions Row: Details, Edit, Delete, Issue */}
                    <div className="mt-3 pt-2.5 border-t border-[#F1EAE1] flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/books/${book.id}`}
                          title="View Book Details"
                          className="p-1.5 rounded-lg bg-white border border-[#E8DFD5] text-[#5A4D41] hover:text-[#764922] transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleEdit(book)}
                          title="Edit Book"
                          className="p-1.5 rounded-lg bg-white border border-[#E8DFD5] text-[#5A4D41] hover:text-[#764922] transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingBook(book)}
                          title="Delete Book"
                          className="p-1.5 rounded-lg bg-white border border-[#E8DFD5] text-[#5A4D41] hover:text-red-700 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setQuickActionModal('issue')}
                        disabled={isOutOfStock}
                        className="inline-flex items-center gap-1 bg-[#764922] hover:bg-[#5E391A] disabled:opacity-40 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        <BookUp className="w-3 h-3" />
                        <span>Issue</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW MODE 2: TABLE VIEW */}
          {!loading && viewMode === 'table' && paginatedBooks.length > 0 && (
            <div className="bg-[#FDFBF9] border border-[#ECE3D8] rounded-2xl p-3.5 shadow-2xs overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F6EFE7] text-[#5A4D41] text-[11px] font-semibold">
                    <th className="py-2.5 px-3 rounded-l-lg">Cover</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Author</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">ISBN</th>
                    <th className="py-2.5 px-3">Publisher</th>
                    <th className="py-2.5 px-3">Year</th>
                    <th className="py-2.5 px-3">Available / Total</th>
                    <th className="py-2.5 px-3 rounded-r-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1EAE1] text-[11.5px]">
                  {paginatedBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-[#FAF5EE]/60 transition">
                      <td className="py-2 px-3">
                        <img
                          src={
                            book.coverImage ||
                            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=120&auto=format&fit=crop&q=80'
                          }
                          alt={book.title}
                          className="w-6 h-8 object-cover rounded shadow-2xs bg-[#EFE7DC]"
                        />
                      </td>
                      <td className="py-2 px-3 font-bold text-[#1D1611]">
                        <Link
                          to={`/books/${book.id}`}
                          className="hover:text-[#764922] truncate block max-w-[180px]"
                        >
                          {book.title}
                        </Link>
                      </td>
                      <td className="py-2 px-3 text-[#5A4D41] whitespace-nowrap">
                        {book.author}
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-[10px] font-semibold bg-[#F3E5D7] text-[#7D4E24] px-2 py-0.5 rounded-full whitespace-nowrap">
                          {book.category}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[#6E6259] font-mono text-[10.5px] whitespace-nowrap">
                        {book.isbn || '—'}
                      </td>
                      <td className="py-2 px-3 text-[#6E6259] whitespace-nowrap">
                        {book.publisher || '—'}
                      </td>
                      <td className="py-2 px-3 text-[#6E6259]">
                        {book.publishedYear}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-md ${
                            book.availableCopies > 0
                              ? 'bg-[#DCF5E7] text-[#17824C]'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {book.availableCopies} / {book.totalCopies}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/books/${book.id}`}
                            title="Details"
                            className="p-1 rounded-md bg-white border border-[#E8DFD5] text-[#5A4D41] hover:text-[#764922]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleEdit(book)}
                            title="Edit"
                            className="p-1 rounded-md bg-white border border-[#E8DFD5] text-[#5A4D41] hover:text-[#764922]"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingBook(book)}
                            title="Delete"
                            className="p-1 rounded-md bg-white border border-[#E8DFD5] text-[#5A4D41] hover:text-red-700"
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
          )}

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="bg-[#FDFBF9] border border-[#ECE3D8] rounded-xl px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-[#6E6259]">
                <span>Items per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-[#E8DFD5] rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
                >
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={16}>16</option>
                </select>
                <span className="hidden sm:inline">
                  • Page <strong className="text-[#1D1611]">{safeCurrentPage}</strong> of{' '}
                  <strong className="text-[#1D1611]">{totalPages}</strong>
                </span>
              </div>

              {/* Prev / Page Numbers / Next */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg bg-white border border-[#E8DFD5] hover:bg-[#FAF6F0] disabled:opacity-40 transition cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  const isActive = pNum === safeCurrentPage;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setCurrentPage(pNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        isActive
                          ? 'bg-[#764922] text-white shadow-2xs'
                          : 'bg-white border border-[#E8DFD5] text-[#4A3E35] hover:bg-[#FAF6F0]'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg bg-white border border-[#E8DFD5] hover:bg-[#FAF6F0] disabled:opacity-40 transition cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Book Modal */}
      <BookFormModal
        isOpen={bookModalOpen}
        onClose={() => {
          setBookModalOpen(false);
          setEditingBook(null);
        }}
        initialData={editingBook}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingBook)}
        onClose={() => setDeletingBook(null)}
        book={deletingBook}
        onConfirm={(id) => deleteBook(id)}
      />

      {/* Quick Action Circulation Modals */}
      <QuickActionModals
        activeModal={quickActionModal}
        onClose={() => setQuickActionModal(null)}
      />
    </div>
  );
}
