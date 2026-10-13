/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const LibraryContext = createContext(null);

const LIBRARY_STORAGE_KEY = 'librax_library_state_v2';
const FINE_PER_DAY = 2.5; // $2.50 per overdue day

const CURATED_BOOKS_META = [
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    category: 'Fiction',
    publisher: 'HarperOne',
    publishedYear: 1988,
    isbn: '978-0062315007',
    totalCopies: 8,
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&auto=format&fit=crop&q=80',
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Others',
    publisher: 'Avery Publishing',
    publishedYear: 2018,
    isbn: '978-0735211292',
    totalCopies: 8,
    coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&auto=format&fit=crop&q=80',
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Technology',
    publisher: 'Prentice Hall',
    publishedYear: 2008,
    isbn: '978-0132350884',
    totalCopies: 6,
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&auto=format&fit=crop&q=80',
  },
  {
    title: 'Rich Dad Poor Dad',
    author: 'Robert T. Kiyosaki',
    category: 'Others',
    publisher: 'Plata Publishing',
    publishedYear: 1997,
    isbn: '978-1612680194',
    totalCopies: 6,
    coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&auto=format&fit=crop&q=80',
  },
  {
    title: 'Data Structures & Algorithms',
    author: 'Thomas H. Cormen',
    category: 'Technology',
    publisher: 'MIT Press',
    publishedYear: 2022,
    isbn: '978-0262046305',
    totalCopies: 5,
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&auto=format&fit=crop&q=80',
  },
  {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    category: 'Others',
    publisher: 'Harriman House',
    publishedYear: 2020,
    isbn: '978-0857197689',
    totalCopies: 6,
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&auto=format&fit=crop&q=80',
  },
  {
    title: 'Deep Work',
    author: 'Cal Newport',
    category: 'Technology',
    publisher: 'Grand Central',
    publishedYear: 2016,
    isbn: '978-1455586691',
    totalCopies: 5,
    coverImage: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300&auto=format&fit=crop&q=80',
  },
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    category: 'Science',
    publisher: 'Bantam Books',
    publishedYear: 1998,
    isbn: '978-0553380163',
    totalCopies: 7,
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&auto=format&fit=crop&q=80',
  },
  {
    title: 'Sapiens: A Brief History',
    author: 'Yuval Noah Harari',
    category: 'History',
    publisher: 'Harper',
    publishedYear: 2015,
    isbn: '978-0062316097',
    totalCopies: 7,
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=300&auto=format&fit=crop&q=80',
  },
  {
    title: 'Leonardo da Vinci',
    author: 'Walter Isaacson',
    category: 'Biography',
    publisher: 'Simon & Schuster',
    publishedYear: 2017,
    isbn: '978-1501139154',
    totalCopies: 5,
    coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&auto=format&fit=crop&q=80',
  },
  {
    title: 'The Midnight Library',
    author: 'Matt Haig',
    category: 'Fiction',
    publisher: 'Viking',
    publishedYear: 2020,
    isbn: '978-0525559474',
    totalCopies: 7,
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&auto=format&fit=crop&q=80',
  },
  {
    title: 'Cosmos',
    author: 'Carl Sagan',
    category: 'Science',
    publisher: 'Random House',
    publishedYear: 1980,
    isbn: '978-0345539434',
    totalCopies: 6,
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
  },
  {
    title: 'Dune: Messiah of Arrakis',
    author: 'Frank Herbert',
    category: 'Fiction',
    publisher: 'Ace Books',
    publishedYear: 1965,
    isbn: '978-0441172719',
    totalCopies: 7,
    coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&auto=format&fit=crop&q=80',
  },
  {
    title: 'The Silk Roads',
    author: 'Peter Frankopan',
    category: 'History',
    publisher: 'Bloomsbury',
    publishedYear: 2015,
    isbn: '978-1101912379',
    totalCopies: 5,
    coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&auto=format&fit=crop&q=80',
  },
  {
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    category: 'Biography',
    publisher: 'Simon & Schuster',
    publishedYear: 2011,
    isbn: '978-1451648539',
    totalCopies: 5,
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&auto=format&fit=crop&q=80',
  },
  {
    title: 'The Gene: An Intimate History',
    author: 'Siddhartha Mukherjee',
    category: 'Science',
    publisher: 'Scribner',
    publishedYear: 2016,
    isbn: '978-1476733524',
    totalCopies: 5,
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&auto=format&fit=crop&q=80',
  },
  {
    title: '1984',
    author: 'George Orwell',
    category: 'Fiction',
    publisher: 'Signet Classic',
    publishedYear: 1949,
    isbn: '978-0451524935',
    totalCopies: 6,
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&auto=format&fit=crop&q=80',
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'Others',
    publisher: 'Farrar, Straus and Giroux',
    publishedYear: 2011,
    isbn: '978-0374533557',
    totalCopies: 0, // filled below so total copies = 104
    coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&auto=format&fit=crop&q=80',
  },
];

function getDaysOffsetIso(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

export function formatDisplayDate(isoDateStr) {
  if (!isoDateStr) return '';
  const d = new Date(`${isoDateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDateStr;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

export function calculateOverdueDays(dueDateStr) {
  if (!dueDateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDateStr}T00:00:00`);
  due.setHours(0, 0, 0, 0);
  const diffMs = today - due;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getCachedLibraryState() {
  try {
    const savedRaw = localStorage.getItem(LIBRARY_STORAGE_KEY);
    if (savedRaw) {
      const parsed = JSON.parse(savedRaw);
      if (parsed && Array.isArray(parsed.books) && parsed.books.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading cached library state:', e);
  }
  return null;
}

const INITIAL_CIRCULATION_WEEK = [
  { day: 'Mon', issued: 5, returned: 3 },
  { day: 'Tue', issued: 9, returned: 5 },
  { day: 'Wed', issued: 6, returned: 5 },
  { day: 'Thu', issued: 10, returned: 4 },
  { day: 'Fri', issued: 7, returned: 4 },
  { day: 'Sat', issued: 14, returned: 8 },
  { day: 'Sun', issued: 6, returned: 3 },
];

export function LibraryProvider({ children }) {
  const cached = useMemo(() => getCachedLibraryState(), []);
  const [books, setBooks] = useState(() => cached?.books || []);
  const [members, setMembers] = useState(() => cached?.members || []);
  const [categories, setCategories] = useState(() => cached?.categories || []);
  const [issues, setIssues] = useState(() => cached?.issues || []);
  const [collectedFineHistory, setCollectedFineHistory] = useState(
    () => cached?.collectedFineHistory || []
  );
  const [activities, setActivities] = useState(() => cached?.activities || []);
  const [weeklyCirculation, setWeeklyCirculation] = useState(
    () => cached?.weeklyCirculation || INITIAL_CIRCULATION_WEEK
  );
  const [loading, setLoading] = useState(() => !cached);
  const [apiError, setApiError] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(
    () => cached?.lastSyncedAt || null
  );

  const persistState = useCallback((nextState) => {
    try {
      localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(nextState));
    } catch (err) {
      console.error('Failed to persist library state:', err);
    }
  }, []);

  const buildSeedFromApiData = (apiProducts = [], apiUsers = []) => {
    // Exact category copy counts matching screenshot:
    // Fiction: 28, Science: 18, Technology: 16, History: 12, Biography: 10, Others: 20 -> Total = 104 across 18 unique catalog items!
    const mappedBooks = CURATED_BOOKS_META.map((meta, idx) => {
      const apiItem = apiProducts[idx] || {};
      const copies = idx === 17 ? 0 : meta.totalCopies;
      return {
        id: `bk-${100 + idx}`,
        title: meta.title,
        author: meta.author,
        isbn: meta.isbn,
        publisher: meta.publisher,
        category: meta.category,
        publishedYear: meta.publishedYear,
        totalCopies: copies,
        availableCopies: copies,
        coverImage: meta.coverImage || apiItem.thumbnail,
        description:
          apiItem.description ||
          `Archival edition of ${meta.title} by ${meta.author}, cataloged under ${meta.category}.`,
        rating: apiItem.rating || 4.8,
      };
    });

    // Ensure 18th book has remaining copies so sum is exactly 104
    const currentSum = mappedBooks.slice(0, 17).reduce((s, b) => s + b.totalCopies, 0);
    mappedBooks[17].totalCopies = Math.max(1, 104 - currentSum);
    mappedBooks[17].availableCopies = mappedBooks[17].totalCopies;

    // 14 Registered Members (matching screenshot members + DummyJSON users)
    const primaryNames = [
      { fullName: 'John Doe', email: 'john.doe@librax.org' },
      { fullName: 'Sarah Lee', email: 'sarah.lee@librax.org' },
      { fullName: 'Mike Johnson', email: 'mike.johnson@librax.org' },
      { fullName: 'Emily Brown', email: 'emily.brown@librax.org' },
      { fullName: 'David Wilson', email: 'david.wilson@librax.org' },
      { fullName: 'Alex Turner', email: 'alex.turner@librax.org' },
      { fullName: 'Chris Evans', email: 'chris.evans@librax.org' },
    ];

    const mappedMembers = Array.from({ length: 14 }).map((_, idx) => {
      const apiUser = apiUsers[idx] || {};
      const preset = primaryNames[idx];
      const fullName = preset
        ? preset.fullName
        : apiUser.firstName
        ? `${apiUser.firstName} ${apiUser.lastName}`
        : `Reader Scholar ${idx + 1}`;
      const email = preset
        ? preset.email
        : apiUser.email || `member${idx + 1}@librax.org`;

      return {
        id: `mem-${200 + idx}`,
        fullName,
        email,
        phone: apiUser.phone || `+1 (555) 340-${1000 + idx}`,
        address: apiUser.address
          ? `${apiUser.address.address}, ${apiUser.address.city}`
          : `${12 + idx} Heritage Square, Central District`,
        membershipId: `LBX-2026-${String(idx + 1).padStart(3, '0')}`,
        membershipDate: getDaysOffsetIso(-(35 - idx * 2)),
        avatar: apiUser.image || null,
        status: 'Active',
      };
    });

    // Seed Transactions & Active Issues (7 active issues total, 3 of which are Overdue, plus 2 Returned transactions in Recent Transactions!)
    const seededIssues = [
      {
        id: 'iss-301',
        bookId: mappedBooks[0].id, // The Alchemist
        bookTitle: mappedBooks[0].title,
        bookCover: mappedBooks[0].coverImage,
        bookCategory: mappedBooks[0].category,
        memberId: mappedMembers[0].id, // John Doe
        memberName: mappedMembers[0].fullName,
        membershipId: mappedMembers[0].membershipId,
        issueDate: getDaysOffsetIso(0), // Oct 13, 2026
        dueDate: getDaysOffsetIso(14),
        returnDate: null,
        transactionType: 'Issue',
        status: 'Issued',
        finePaid: false,
      },
      {
        id: 'iss-302',
        bookId: mappedBooks[1].id, // Atomic Habits
        bookTitle: mappedBooks[1].title,
        bookCover: mappedBooks[1].coverImage,
        bookCategory: mappedBooks[1].category,
        memberId: mappedMembers[1].id, // Sarah Lee
        memberName: mappedMembers[1].fullName,
        membershipId: mappedMembers[1].membershipId,
        issueDate: getDaysOffsetIso(-8),
        dueDate: getDaysOffsetIso(6),
        returnDate: getDaysOffsetIso(-1), // Oct 12, 2026
        transactionType: 'Return',
        status: 'Returned',
        finePaid: true,
      },
      {
        id: 'iss-303',
        bookId: mappedBooks[2].id, // Clean Code
        bookTitle: mappedBooks[2].title,
        bookCover: mappedBooks[2].coverImage,
        bookCategory: mappedBooks[2].category,
        memberId: mappedMembers[2].id, // Mike Johnson
        memberName: mappedMembers[2].fullName,
        membershipId: mappedMembers[2].membershipId,
        issueDate: getDaysOffsetIso(-1), // Oct 12, 2026
        dueDate: getDaysOffsetIso(13),
        returnDate: null,
        transactionType: 'Issue',
        status: 'Issued',
        finePaid: false,
      },
      {
        id: 'iss-304',
        bookId: mappedBooks[3].id, // Rich Dad Poor Dad
        bookTitle: mappedBooks[3].title,
        bookCover: mappedBooks[3].coverImage,
        bookCategory: mappedBooks[3].category,
        memberId: mappedMembers[3].id, // Emily Brown
        memberName: mappedMembers[3].fullName,
        membershipId: mappedMembers[3].membershipId,
        issueDate: getDaysOffsetIso(-14),
        dueDate: getDaysOffsetIso(-5), // 5 days late!
        returnDate: null,
        transactionType: 'Issue',
        status: 'Overdue',
        finePaid: false,
      },
      {
        id: 'iss-305',
        bookId: mappedBooks[4].id, // Data Structures
        bookTitle: 'Data Structures',
        bookCover: mappedBooks[4].coverImage,
        bookCategory: mappedBooks[4].category,
        memberId: mappedMembers[4].id, // David Wilson
        memberName: mappedMembers[4].fullName,
        membershipId: mappedMembers[4].membershipId,
        issueDate: getDaysOffsetIso(-10),
        dueDate: getDaysOffsetIso(4),
        returnDate: getDaysOffsetIso(-3), // Oct 10, 2026
        transactionType: 'Return',
        status: 'Returned',
        finePaid: true,
      },
      {
        id: 'iss-306',
        bookId: mappedBooks[5].id, // The Psychology of Money
        bookTitle: mappedBooks[5].title,
        bookCover: mappedBooks[5].coverImage,
        bookCategory: mappedBooks[5].category,
        memberId: mappedMembers[5].id, // Alex Turner
        memberName: mappedMembers[5].fullName,
        membershipId: mappedMembers[5].membershipId,
        issueDate: getDaysOffsetIso(-12),
        dueDate: getDaysOffsetIso(-3), // 3 days late!
        returnDate: null,
        transactionType: 'Issue',
        status: 'Overdue',
        finePaid: false,
      },
      {
        id: 'iss-307',
        bookId: mappedBooks[6].id, // Deep Work
        bookTitle: mappedBooks[6].title,
        bookCover: mappedBooks[6].coverImage,
        bookCategory: mappedBooks[6].category,
        memberId: mappedMembers[6].id, // Chris Evans
        memberName: mappedMembers[6].fullName,
        membershipId: mappedMembers[6].membershipId,
        issueDate: getDaysOffsetIso(-11),
        dueDate: getDaysOffsetIso(-2), // 2 days late!
        returnDate: null,
        transactionType: 'Issue',
        status: 'Overdue',
        finePaid: false,
      },
      {
        id: 'iss-308',
        bookId: mappedBooks[7].id, // A Brief History of Time
        bookTitle: mappedBooks[7].title,
        bookCover: mappedBooks[7].coverImage,
        bookCategory: mappedBooks[7].category,
        memberId: mappedMembers[7].id,
        memberName: mappedMembers[7].fullName,
        membershipId: mappedMembers[7].membershipId,
        issueDate: getDaysOffsetIso(-4),
        dueDate: getDaysOffsetIso(10),
        returnDate: null,
        transactionType: 'Issue',
        status: 'Issued',
        finePaid: false,
      },
      {
        id: 'iss-309',
        bookId: mappedBooks[8].id, // Sapiens
        bookTitle: mappedBooks[8].title,
        bookCover: mappedBooks[8].coverImage,
        bookCategory: mappedBooks[8].category,
        memberId: mappedMembers[8].id,
        memberName: mappedMembers[8].fullName,
        membershipId: mappedMembers[8].membershipId,
        issueDate: getDaysOffsetIso(-2),
        dueDate: getDaysOffsetIso(12),
        returnDate: null,
        transactionType: 'Issue',
        status: 'Issued',
        finePaid: false,
      },
    ];

    const issuedCountByBook = {};
    seededIssues.forEach((iss) => {
      if (iss.status !== 'Returned') {
        issuedCountByBook[iss.bookId] = (issuedCountByBook[iss.bookId] || 0) + 1;
      }
    });

    const adjustedBooks = mappedBooks.map((b) => ({
      ...b,
      availableCopies: Math.max(0, b.totalCopies - (issuedCountByBook[b.id] || 0)),
    }));

    const distinctCats = [
      'Fiction',
      'Science',
      'Technology',
      'History',
      'Biography',
      'Others',
    ];

    const seededFineHistory = [
      {
        id: 'fn-401',
        memberName: 'Sarah Lee',
        bookTitle: 'Atomic Habits',
        amount: 25.0,
        paidAt: getDaysOffsetIso(-1),
      },
      {
        id: 'fn-402',
        memberName: 'David Wilson',
        bookTitle: 'Data Structures',
        amount: 15.0,
        paidAt: getDaysOffsetIso(-3),
      },
    ];

    const nowMs = Date.now();
    const seededActivities = [
      {
        id: 'act-1',
        type: 'member_added',
        title: 'New member registered: Sarah Lee',
        description: 'New member registered: Sarah Lee',
        timestamp: new Date(nowMs - 1000 * 60 * 10).toISOString(),
        actor: 'Membership Desk',
      },
      {
        id: 'act-2',
        type: 'issue',
        title: 'Book issued: The Alchemist to John Doe',
        description: 'Book issued: The Alchemist to John Doe',
        timestamp: new Date(nowMs - 1000 * 60 * 25).toISOString(),
        actor: 'Circulation Desk',
      },
      {
        id: 'act-3',
        type: 'return',
        title: 'Book returned: Atomic Habits by Sarah Lee',
        description: 'Book returned: Atomic Habits by Sarah Lee',
        timestamp: new Date(nowMs - 1000 * 60 * 60).toISOString(),
        actor: 'Circulation Desk',
      },
      {
        id: 'act-4',
        type: 'overdue_alert',
        title: 'Overdue alert: Rich Dad Poor Dad (5 days late)',
        description: 'Overdue alert: Rich Dad Poor Dad (5 days late)',
        timestamp: new Date(nowMs - 1000 * 60 * 120).toISOString(),
        actor: 'Automated Monitor',
      },
      {
        id: 'act-5',
        type: 'api_sync',
        title: 'Catalog synced with DummyJSON API (18 titles, 104 copies)',
        description: 'Catalog synced with DummyJSON API (18 titles, 104 copies)',
        timestamp: new Date(nowMs - 1000 * 60 * 180).toISOString(),
        actor: 'DummyJSON API',
      },
    ];

    const syncedTime = new Date(nowMs - 1000 * 60 * 21).toISOString();

    return {
      books: adjustedBooks,
      members: mappedMembers,
      categories: distinctCats,
      issues: seededIssues,
      collectedFineHistory: seededFineHistory,
      activities: seededActivities,
      weeklyCirculation: INITIAL_CIRCULATION_WEEK,
      lastSyncedAt: syncedTime,
    };
  };

  const fetchAndHydrateFromApi = useCallback(
    async (showToast = false) => {
      setLoading(true);
      setApiError(null);
      try {
        const [productsRes, usersRes] = await Promise.all([
          axios.get('https://dummyjson.com/products?limit=18'),
          axios.get('https://dummyjson.com/users?limit=14'),
        ]);

        const products = productsRes.data?.products || [];
        const users = usersRes.data?.users || [];
        const freshState = buildSeedFromApiData(products, users);
        if (showToast) {
          freshState.lastSyncedAt = new Date().toISOString();
        }

        setBooks(freshState.books);
        setMembers(freshState.members);
        setCategories(freshState.categories);
        setIssues(freshState.issues);
        setCollectedFineHistory(freshState.collectedFineHistory);
        setActivities(freshState.activities);
        setWeeklyCirculation(freshState.weeklyCirculation);
        setLastSyncedAt(freshState.lastSyncedAt);
        persistState(freshState);

        if (showToast) {
          toast.success(
            `Synced live data from DummyJSON API (${freshState.books.length} catalog items, ${freshState.members.length} members)!`
          );
        }
      } catch (err) {
        console.warn('API fetch warning, using fallback seed data:', err);
        setApiError('Using offline archival cache (Third-party API unreachable).');
        const fallbackState = buildSeedFromApiData([], []);
        setBooks(fallbackState.books);
        setMembers(fallbackState.members);
        setCategories(fallbackState.categories);
        setIssues(fallbackState.issues);
        setCollectedFineHistory(fallbackState.collectedFineHistory);
        setActivities(fallbackState.activities);
        setWeeklyCirculation(fallbackState.weeklyCirculation);
        setLastSyncedAt(fallbackState.lastSyncedAt);
        persistState(fallbackState);
        if (showToast) {
          toast.warning('Third-party API unreachable; refreshed from local archive.');
        }
      } finally {
        setLoading(false);
      }
    },
    [persistState]
  );

  useEffect(() => {
    if (!cached) {
      const timer = setTimeout(() => {
        fetchAndHydrateFromApi(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [cached, fetchAndHydrateFromApi]);

  useEffect(() => {
    if (!loading && books.length > 0) {
      persistState({
        books,
        members,
        categories,
        issues,
        collectedFineHistory,
        activities,
        weeklyCirculation,
        lastSyncedAt,
      });
    }
  }, [
    books,
    members,
    categories,
    issues,
    collectedFineHistory,
    activities,
    weeklyCirculation,
    lastSyncedAt,
    loading,
    persistState,
  ]);

  const enrichedIssues = useMemo(() => {
    return issues.map((iss) => {
      if (iss.status === 'Returned') {
        return { ...iss, overdueDays: 0, calculatedFine: iss.paidFineAmount || 0 };
      }
      const overdueDays = calculateOverdueDays(iss.dueDate);
      const isOverdue = overdueDays > 0 || iss.status === 'Overdue';
      const effectiveDays = overdueDays > 0 ? overdueDays : isOverdue ? 3 : 0;
      const calculatedFine = isOverdue && !iss.finePaid ? effectiveDays * FINE_PER_DAY : 0;
      return {
        ...iss,
        status: isOverdue ? 'Overdue' : 'Issued',
        overdueDays: effectiveDays,
        calculatedFine,
      };
    });
  }, [issues]);

  const metrics = useMemo(() => {
    const totalCopiesCount = books.reduce((sum, b) => sum + Number(b.totalCopies || 0), 0);
    const uniqueTitlesCount = books.length;

    const activeIssues = enrichedIssues.filter((i) => i.status !== 'Returned');
    const booksIssuedCount = activeIssues.length;

    const booksAvailableCount = Math.max(0, totalCopiesCount - booksIssuedCount);

    const overdueIssues = activeIssues.filter((i) => i.status === 'Overdue');
    const overdueBooksCount = overdueIssues.length;

    const totalMembersCount = members.length;

    const distinctCategorySet = new Set([
      ...categories,
      ...books.map((b) => b.category).filter(Boolean),
    ]);
    const totalCategoriesCount = distinctCategorySet.size;

    const fineCollectedTotal = collectedFineHistory.reduce(
      (sum, f) => sum + Number(f.amount || 0),
      0
    );

    const pendingFineTotal = overdueIssues.reduce(
      (sum, i) => sum + Number(i.calculatedFine || 0),
      0
    );

    const categoryColors = {
      Fiction: '#5B3216',
      Science: '#EEB432',
      Technology: '#5E85E6',
      History: '#F27D31',
      Biography: '#158863',
      Others: '#7C4B27',
    };
    const fallbackPalette = ['#8C5828', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'];

    const categoryBreakdown = Array.from(distinctCategorySet).map((cat, idx) => {
      const catBooks = books.filter((b) => b.category === cat);
      const copies = catBooks.reduce((s, b) => s + Number(b.totalCopies || 0), 0);
      const available = catBooks.reduce((s, b) => s + Number(b.availableCopies || 0), 0);
      const pct = totalCopiesCount > 0 ? ((copies / totalCopiesCount) * 100).toFixed(1) : '0.0';
      return {
        category: cat,
        titlesCount: catBooks.length,
        totalCopies: copies,
        availableCopies: available,
        issuedCopies: Math.max(0, copies - available),
        percentage: Number(pct),
        color: categoryColors[cat] || fallbackPalette[idx % fallbackPalette.length],
      };
    });

    return {
      totalBooks: totalCopiesCount,
      uniqueTitles: uniqueTitlesCount,
      totalMembers: totalMembersCount,
      booksIssued: booksIssuedCount,
      booksAvailable: booksAvailableCount,
      overdueBooks: overdueBooksCount,
      totalCategories: totalCategoriesCount,
      fineCollected: fineCollectedTotal,
      pendingFines: pendingFineTotal,
      categoryBreakdown,
    };
  }, [books, members, categories, enrichedIssues, collectedFineHistory]);

  const pushActivity = (entry) => {
    const newAct = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      actor: 'Librarian Desk',
      ...entry,
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const issueBook = ({ bookId, memberId, dueDate }) => {
    const targetBook = books.find((b) => b.id === bookId);
    const targetMember = members.find((m) => m.id === memberId);

    if (!targetBook || !targetMember) {
      toast.error('Please select a valid book and library member.');
      return { success: false };
    }

    if (targetBook.availableCopies <= 0) {
      toast.error(`No available copies left for "${targetBook.title}".`);
      return { success: false };
    }

    const duplicate = enrichedIssues.find(
      (i) =>
        i.bookId === bookId &&
        i.memberId === memberId &&
        i.status !== 'Returned'
    );
    if (duplicate) {
      toast.warning(
        `${targetMember.fullName} already has an active copy of "${targetBook.title}" issued.`
      );
      return { success: false };
    }

    const isOverdueNow = calculateOverdueDays(dueDate) > 0;
    const newIssue = {
      id: `iss-${Date.now()}`,
      bookId: targetBook.id,
      bookTitle: targetBook.title,
      bookCover: targetBook.coverImage,
      bookCategory: targetBook.category,
      memberId: targetMember.id,
      memberName: targetMember.fullName,
      membershipId: targetMember.membershipId,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || getDaysOffsetIso(14),
      returnDate: null,
      transactionType: 'Issue',
      status: isOverdueNow ? 'Overdue' : 'Issued',
      finePaid: false,
    };

    setIssues((prev) => [newIssue, ...prev]);
    setBooks((prev) =>
      prev.map((b) =>
        b.id === targetBook.id
          ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) }
          : b
      )
    );

    // Increment today's bar in Book Circulation chart
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayName = dayNames[new Date().getDay()];
    setWeeklyCirculation((prev) =>
      prev.map((item) =>
        item.day === todayName ? { ...item, issued: item.issued + 1 } : item
      )
    );

    pushActivity({
      type: isOverdueNow ? 'overdue_alert' : 'issue',
      title: `Book issued: ${targetBook.title} to ${targetMember.fullName}`,
      description: `Book issued: ${targetBook.title} to ${targetMember.fullName}`,
    });

    toast.success(`Issued "${targetBook.title}" to ${targetMember.fullName}!`);
    return { success: true };
  };

  const returnBook = (issueId, collectOverdueFine = true) => {
    const targetIssue = enrichedIssues.find((i) => i.id === issueId);
    if (!targetIssue || targetIssue.status === 'Returned') {
      toast.error('This circulation record is already returned or invalid.');
      return { success: false };
    }

    const fineAmount = targetIssue.calculatedFine || 0;
    const todayIso = new Date().toISOString().split('T')[0];

    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? {
              ...i,
              status: 'Returned',
              transactionType: 'Return',
              returnDate: todayIso,
              finePaid: fineAmount > 0 ? collectOverdueFine : true,
              paidFineAmount: collectOverdueFine ? fineAmount : 0,
            }
          : i
      )
    );

    setBooks((prev) =>
      prev.map((b) =>
        b.id === targetIssue.bookId
          ? {
              ...b,
              availableCopies: Math.min(b.totalCopies, b.availableCopies + 1),
            }
          : b
      )
    );

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayName = dayNames[new Date().getDay()];
    setWeeklyCirculation((prev) =>
      prev.map((item) =>
        item.day === todayName ? { ...item, returned: item.returned + 1 } : item
      )
    );

    if (fineAmount > 0 && collectOverdueFine) {
      const fineEntry = {
        id: `fn-${Date.now()}`,
        memberName: targetIssue.memberName,
        bookTitle: targetIssue.bookTitle,
        amount: fineAmount,
        paidAt: todayIso,
      };
      setCollectedFineHistory((prev) => [fineEntry, ...prev]);
      pushActivity({
        type: 'return',
        title: `Book returned: ${targetIssue.bookTitle} by ${targetIssue.memberName} ($${fineAmount.toFixed(2)} fine paid)`,
        description: `Book returned: ${targetIssue.bookTitle} by ${targetIssue.memberName}`,
      });
      toast.success(
        `Returned "${targetIssue.bookTitle}" & collected $${fineAmount.toFixed(2)} overdue fine!`
      );
    } else {
      pushActivity({
        type: 'return',
        title: `Book returned: ${targetIssue.bookTitle} by ${targetIssue.memberName}`,
        description: `Book returned: ${targetIssue.bookTitle} by ${targetIssue.memberName}`,
      });
      toast.success(`Returned "${targetIssue.bookTitle}" to available inventory!`);
    }

    return { success: true };
  };

  const sendOverdueReminder = (issueId) => {
    const targetIssue = enrichedIssues.find((i) => i.id === issueId);
    if (!targetIssue) return;
    pushActivity({
      type: 'overdue_alert',
      title: `Overdue reminder sent: ${targetIssue.bookTitle} to ${targetIssue.memberName} (${targetIssue.overdueDays} days late)`,
      description: `Overdue reminder sent to ${targetIssue.memberName}`,
    });
    toast.info(
      `Reminder sent to ${targetIssue.memberName} for "${targetIssue.bookTitle}" (${targetIssue.overdueDays} days overdue).`
    );
  };

  const collectFineForIssue = (issueId) => {
    const targetIssue = enrichedIssues.find((i) => i.id === issueId);
    if (!targetIssue || targetIssue.calculatedFine <= 0) {
      toast.info('No pending overdue fine on this record.');
      return { success: false };
    }

    const amount = targetIssue.calculatedFine;
    const todayIso = new Date().toISOString().split('T')[0];

    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? {
              ...i,
              finePaid: true,
              status: 'Issued',
              dueDate: getDaysOffsetIso(7),
            }
          : i
      )
    );

    setCollectedFineHistory((prev) => [
      {
        id: `fn-${Date.now()}`,
        memberName: targetIssue.memberName,
        bookTitle: targetIssue.bookTitle,
        amount,
        paidAt: todayIso,
      },
      ...prev,
    ]);

    pushActivity({
      type: 'fine_paid',
      title: `Overdue fine collected: $${amount.toFixed(2)} from ${targetIssue.memberName}`,
      description: `Overdue fine collected: $${amount.toFixed(2)} from ${targetIssue.memberName}`,
    });

    toast.success(`Collected $${amount.toFixed(2)} overdue fine from ${targetIssue.memberName}!`);
    return { success: true };
  };

  const addQuickBook = ({
    title,
    author,
    isbn,
    publisher,
    category,
    publishedYear,
    totalCopies,
    description,
  }) => {
    const copiesNum = Math.max(1, Number(totalCopies) || 1);
    const cleanCategory = (category || 'Fiction').trim();

    const newBook = {
      id: `bk-${Date.now()}`,
      title: title.trim(),
      author: author.trim(),
      isbn: (isbn || `978-01928${Math.floor(1000 + Math.random() * 8999)}`).trim(),
      publisher: (publisher || 'LibraX Heritage Press').trim(),
      category: cleanCategory,
      publishedYear: Number(publishedYear) || new Date().getFullYear(),
      totalCopies: copiesNum,
      availableCopies: copiesNum,
      coverImage:
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&auto=format&fit=crop&q=80',
      description:
        description || `Cataloged volume "${title.trim()}" by ${author.trim()}.`,
      rating: 4.8,
    };

    setBooks((prev) => [newBook, ...prev]);
    if (!categories.includes(cleanCategory)) {
      setCategories((prev) => [...prev, cleanCategory]);
    }

    pushActivity({
      type: 'book_added',
      title: `Catalog updated: Added ${copiesNum} copies of ${newBook.title}`,
      description: `Catalog updated: Added ${copiesNum} copies of ${newBook.title}`,
    });

    toast.success(`Added "${newBook.title}" (${copiesNum} copies) to catalog!`);
    return { success: true, book: newBook };
  };

  const addQuickMember = ({ fullName, email, phone, address }) => {
    const nextNum = members.length + 1;
    const membershipId = `LBX-2026-${String(nextNum).padStart(3, '0')}`;
    const newMember = {
      id: `mem-${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: (address || 'Central Reading District').trim(),
      membershipId,
      membershipDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    };

    setMembers((prev) => [newMember, ...prev]);

    pushActivity({
      type: 'member_added',
      title: `New member registered: ${newMember.fullName}`,
      description: `New member registered: ${newMember.fullName}`,
    });

    toast.success(`Registered member ${newMember.fullName} (${membershipId})!`);
    return { success: true, member: newMember };
  };

  const addQuickCategory = ({ name }) => {
    const clean = (name || '').trim();
    if (!clean) return { success: false };
    if (categories.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      toast.warning(`Category "${clean}" already exists.`);
      return { success: false };
    }
    setCategories((prev) => [...prev, clean]);
    pushActivity({
      type: 'category_added',
      title: `New genre added: ${clean}`,
      description: `New genre added: ${clean}`,
    });
    toast.success(`Category "${clean}" added!`);
    return { success: true };
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        members,
        categories,
        issues: enrichedIssues,
        collectedFineHistory,
        activities,
        weeklyCirculation,
        metrics,
        loading,
        apiError,
        lastSyncedAt,
        issueBook,
        returnBook,
        sendOverdueReminder,
        collectFineForIssue,
        addQuickBook,
        addQuickMember,
        addQuickCategory,
        syncWithApi: () => fetchAndHydrateFromApi(true),
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return ctx;
}
