import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Shapes,
  Search,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  ArrowUpDown,
  ChevronRight,
  Menu,
  Tag,
  Grid,
  List,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import Sidebar from '../components/common/Sidebar';
import {
  CategoryFormModal,
  DeleteCategoryConfirmModal,
  GlobalSearchModal,
} from '../components/categories/CategoryModal';

export default function CategorySearchPage() {
  const {
    books,
    categories,
  } = useLibrary();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('ALL'); // 'ALL' | 'TITLE' | 'AUTHOR' | 'ISBN'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [sortBy, setSortBy] = useState('titleAsc'); // 'titleAsc' | 'authorAsc' | 'copiesDesc' | 'yearDesc'

  // Modals state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  // Category statistics breakdown
  const categoryStats = useMemo(() => {
    const totalLibraryCopies = books.reduce((s, b) => s + Number(b.totalCopies || 0), 0);

    return categories.map((catName) => {
      const catBooks = books.filter((b) => b.category === catName);
      const titlesCount = catBooks.length;
      const totalCopies = catBooks.reduce((s, b) => s + Number(b.totalCopies || 0), 0);
      const availableCopies = catBooks.reduce((s, b) => s + Number(b.availableCopies || 0), 0);
      const issuedCopies = Math.max(0, totalCopies - availableCopies);
      const percentage = totalLibraryCopies > 0
        ? ((totalCopies / totalLibraryCopies) * 100).toFixed(1)
        : '0.0';

      const colorMap = {
        Fiction: '#5B3216',
        Science: '#EEB432',
        Technology: '#5E85E6',
        History: '#F27D31',
        Biography: '#158863',
        Others: '#764B24',
      };

      return {
        name: catName,
        titlesCount,
        totalCopies,
        availableCopies,
        issuedCopies,
        percentage,
        color: colorMap[catName] || '#764B24',
      };
    });
  }, [categories, books]);

  // Filtered books matching Search (by Title, Author, ISBN) & Category
  const filteredBooks = useMemo(() => {
    return books
      .filter((b) => {
        // Category filter
        if (selectedCategory !== 'ALL' && b.category !== selectedCategory) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          if (searchField === 'TITLE') {
            return b.title.toLowerCase().includes(q);
          }
          if (searchField === 'AUTHOR') {
            return b.author.toLowerCase().includes(q);
          }
          if (searchField === 'ISBN') {
            return (b.isbn || '').toLowerCase().includes(q);
          }
          // 'ALL' scope
          const matchTitle = b.title.toLowerCase().includes(q);
          const matchAuthor = b.author.toLowerCase().includes(q);
          const matchIsbn = (b.isbn || '').toLowerCase().includes(q);
          const matchPublisher = (b.publisher || '').toLowerCase().includes(q);
          return matchTitle || matchAuthor || matchIsbn || matchPublisher;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'titleAsc') return a.title.localeCompare(b.title);
        if (sortBy === 'authorAsc') return a.author.localeCompare(b.author);
        if (sortBy === 'copiesDesc') return (b.totalCopies || 0) - (a.totalCopies || 0);
        if (sortBy === 'yearDesc') return (b.publishedYear || 0) - (a.publishedYear || 0);
        return 0;
      });
  }, [books, selectedCategory, searchQuery, searchField, sortBy]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1D1611] flex flex-col lg:flex-row antialiased font-normal">
      {/* Sticky Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EAE0D5] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
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
                <span className="text-[#1D1611] font-medium">Search & Categories</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1D1611] tracking-tight mt-0.5">
                Category Management & Catalog Search
              </h1>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setGlobalSearchOpen(true)}
              className="px-3.5 py-2 bg-white border border-[#EAE0D5] text-[#5C4B3E] hover:bg-[#FAF7F2] rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition flex items-center gap-2 cursor-pointer"
              title="Global Search"
            >
              <Search className="w-4 h-4 text-[#764B24]" />
              <span className="hidden sm:inline">Global Search</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#FAF7F2] border border-[#DED4C8] rounded text-[#8C7A6B]">
                Ctrl+K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingCategory(null);
                setCategoryModalOpen(true);
              }}
              className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-[#764B24] to-[#5B3216] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:brightness-110 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-4 sm:p-8 space-y-7 max-w-7xl w-full mx-auto">
          {/* Section 1: Category Management Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h2 className="text-base font-bold text-[#1D1611] flex items-center gap-2">
                  <Shapes className="w-4.5 h-4.5 text-[#764B24]" />
                  <span>Library Classifications & Genres ({categories.length})</span>
                </h2>
                <p className="text-xs text-[#7C6959] mt-0.5">
                  Organize volumes, manage classifications, and filter collection stock
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-[#221209] text-white border-[#221209]'
                    : 'bg-white text-[#764B24] border-[#EAE0D5] hover:bg-[#FAF7F2]'
                }`}
              >
                Show All ({books.length} Titles)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
              {categoryStats.map((cat) => {
                const isSelected = selectedCategory === cat.name;

                return (
                  <div
                    key={cat.name}
                    className={`bg-white rounded-2xl border p-4 shadow-xs transition hover:shadow-md flex flex-col justify-between cursor-pointer relative group ${
                      isSelected
                        ? 'border-[#764B24] ring-2 ring-[#764B24]/20 bg-gradient-to-b from-white to-[#FAF0E6]/30'
                        : 'border-[#EAE0D5]'
                    }`}
                    onClick={() => setSelectedCategory(cat.name)}
                  >
                    <div>
                      {/* Top Color Tag & Actions */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <div
                          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategory(cat.name);
                              setCategoryModalOpen(true);
                            }}
                            className="p-1 rounded-md text-[#7C6959] hover:bg-[#FAF7F2] hover:text-[#764B24]"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingCategory(cat.name)}
                            className="p-1 rounded-md text-[#7C6959] hover:bg-[#FEE2E2] hover:text-[#DC2626]"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-[#1D1611] truncate">{cat.name}</h3>
                      <p className="text-[11px] text-[#7C6959] mt-0.5">
                        {cat.titlesCount} unique titles
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#F0E6DC] text-[11px] text-[#5C4B3E] space-y-1">
                      <div className="flex justify-between">
                        <span>Total Stock:</span>
                        <strong className="text-[#1D1611]">{cat.totalCopies}</strong>
                      </div>
                      <div className="flex justify-between text-[10.5px]">
                        <span className="text-[#15803D]">{cat.availableCopies} available</span>
                        <span className="text-[#E57338]">{cat.issuedCopies} issued</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Targeted Search Controls & Filter Tabs */}
          <div className="bg-white rounded-2xl border border-[#EAE0D5] p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={
                    searchField === 'TITLE'
                      ? 'Search specifically by book title...'
                      : searchField === 'AUTHOR'
                      ? 'Search specifically by author name...'
                      : searchField === 'ISBN'
                      ? 'Search specifically by ISBN number...'
                      : 'Search by book title, author name, ISBN barcode...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2 bg-[#FAF7F2] border border-[#E0D5C7] focus:border-[#764B24] focus:bg-white rounded-xl text-xs sm:text-sm text-[#1D1611] placeholder:text-[#A08E80] outline-none transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-[#8C7A6B] hover:text-[#1D1611]"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Scope & Sort Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search Target Field */}
                <div className="relative flex items-center">
                  <Tag className="w-3.5 h-3.5 text-[#7C6959] absolute left-3 pointer-events-none" />
                  <select
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value)}
                    className="pl-8 pr-7 py-2 bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-xs text-[#1D1611] font-medium outline-none cursor-pointer hover:border-[#764B24] transition appearance-none"
                  >
                    <option value="ALL">Search All Fields</option>
                    <option value="TITLE">Search by Title Only</option>
                    <option value="AUTHOR">Search by Author Only</option>
                    <option value="ISBN">Search by ISBN Only</option>
                  </select>
                </div>

                {/* Sort Filter */}
                <div className="relative flex items-center">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#7C6959] absolute left-3 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-8 pr-7 py-2 bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-xs text-[#1D1611] font-medium outline-none cursor-pointer hover:border-[#764B24] transition appearance-none"
                  >
                    <option value="titleAsc">Sort by Title (A - Z)</option>
                    <option value="authorAsc">Sort by Author (A - Z)</option>
                    <option value="copiesDesc">Total Copies (Highest)</option>
                    <option value="yearDesc">Publication Year (Newest)</option>
                  </select>
                </div>

                {/* View Switcher */}
                <div className="flex items-center bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white text-[#764B24] shadow-2xs font-semibold'
                        : 'text-[#8C7A6B] hover:text-[#1D1611]'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-white text-[#764B24] shadow-2xs font-semibold'
                        : 'text-[#8C7A6B] hover:text-[#1D1611]'
                    }`}
                    title="Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F0E6DC]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7C6959] mr-1">
                Filter by Category:
              </span>

              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === 'ALL'
                    ? 'bg-[#221209] text-white shadow-xs font-semibold'
                    : 'bg-[#FAF7F2] text-[#5C4B3E] hover:bg-[#EAE0D5]'
                }`}
              >
                <span>All Books</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  {books.length}
                </span>
              </button>

              {categories.map((cat) => {
                const count = books.filter((b) => b.category === cat).length;
                const isSelected = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#764B24] text-white shadow-xs font-semibold'
                        : 'bg-[#FAF7F2] text-[#5C4B3E] hover:bg-[#EAE0D5]'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Filtered Books List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-[#7C6959]">
                Showing <strong className="text-[#1D1611]">{filteredBooks.length}</strong> matching books
                {selectedCategory !== 'ALL' && <span> in category &quot;{selectedCategory}&quot;</span>}
                {searchQuery && <span> for query &quot;{searchQuery}&quot;</span>}
              </p>
            </div>

            {filteredBooks.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#EAE0D5] p-12 text-center shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-[#FEF3EB] text-[#E57338] flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-[#1D1611]">No matching books found</h3>
                <p className="text-xs text-[#7C6959] max-w-sm mx-auto mt-1 mb-5">
                  Try adjusting your search criteria, switching the search scope, or selecting another category.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchField('ALL');
                    setSelectedCategory('ALL');
                  }}
                  className="px-4 py-2 rounded-xl border border-[#DED4C8] text-xs font-semibold text-[#764B24] hover:bg-[#FAF7F2] transition cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid Cards */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white rounded-2xl border border-[#EAE0D5] p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                  >
                    <div>
                      {/* Book Thumbnail & Category Badge */}
                      <div className="flex items-start gap-3 mb-3">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-14 h-20 object-cover rounded-xl shadow-xs shrink-0 group-hover:scale-102 transition"
                          />
                        ) : (
                          <div className="w-14 h-20 rounded-xl bg-[#FAF7F2] border border-[#E0D5C7] flex items-center justify-center text-[#764B24] shrink-0">
                            <BookOpen className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF0E6] text-[#764B24] inline-block mb-1">
                            {book.category}
                          </span>
                          <Link
                            to={`/books/${book.id}`}
                            className="font-bold text-xs text-[#1D1611] hover:text-[#764B24] transition line-clamp-2 block"
                            title={book.title}
                          >
                            {book.title}
                          </Link>
                          <p className="text-[11px] text-[#7C6959] mt-0.5 truncate">
                            by {book.author}
                          </p>
                        </div>
                      </div>

                      {/* ISBN & Year */}
                      <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE0D5] text-[11px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#7C6959]">ISBN:</span>
                          <span className="font-mono text-[#1D1611] text-[10.5px]">
                            {book.isbn || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#7C6959]">Published:</span>
                          <span className="text-[#1D1611]">{book.publishedYear}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stock & Link Footer */}
                    <div className="mt-3 pt-3 border-t border-[#F0E6DC] flex items-center justify-between">
                      <span
                        className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                          book.availableCopies > 0
                            ? 'bg-[#DCFCE7] text-[#15803D]'
                            : 'bg-[#FEE2E2] text-[#B91C1C]'
                        }`}
                      >
                        {book.availableCopies} of {book.totalCopies} Avail
                      </span>

                      <Link
                        to={`/books/${book.id}`}
                        className="text-xs font-semibold text-[#764B24] hover:underline flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Table View */
              <div className="bg-white rounded-2xl border border-[#EAE0D5] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAF7F2] border-b border-[#EAE0D5] text-[11px] font-semibold uppercase tracking-wider text-[#7C6959]">
                        <th className="py-3.5 px-4">Book Title & Cover</th>
                        <th className="py-3.5 px-4">Author</th>
                        <th className="py-3.5 px-4">ISBN Number</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Availability</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0E6DC]">
                      {filteredBooks.map((book) => (
                        <tr key={book.id} className="hover:bg-[#FAF7F2]/80 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {book.coverImage && (
                                <img
                                  src={book.coverImage}
                                  alt={book.title}
                                  className="w-8 h-11 object-cover rounded shadow-2xs shrink-0"
                                />
                              )}
                              <div className="min-w-0 max-w-[220px]">
                                <Link
                                  to={`/books/${book.id}`}
                                  className="font-semibold text-xs text-[#1D1611] hover:text-[#764B24] transition truncate block"
                                >
                                  {book.title}
                                </Link>
                                <span className="text-[10.5px] text-[#7C6959]">
                                  {book.publisher} • {book.publishedYear}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#5C4B3E] font-medium">{book.author}</td>
                          <td className="py-3 px-4 font-mono text-[#764B24]">{book.isbn}</td>
                          <td className="py-3 px-4">
                            <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-[#FAF0E6] text-[#764B24]">
                              {book.category}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                                book.availableCopies > 0
                                  ? 'bg-[#DCFCE7] text-[#15803D]'
                                  : 'bg-[#FEE2E2] text-[#B91C1C]'
                              }`}
                            >
                              {book.availableCopies}/{book.totalCopies} Available
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              to={`/books/${book.id}`}
                              className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE0D5] border border-[#DED4C8] text-[11px] font-semibold text-[#764B24] transition inline-flex items-center gap-1"
                            >
                              <span>View Details</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <CategoryFormModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        initialCategory={editingCategory}
      />

      <DeleteCategoryConfirmModal
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        categoryName={deletingCategory}
      />

      <GlobalSearchModal
        isOpen={globalSearchOpen}
        onClose={() => setGlobalSearchOpen(false)}
      />
    </div>
  );
}
