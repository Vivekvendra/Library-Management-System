import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  LayoutGrid,
  BookOpen,
  Users,
  BookUp,
  Clock,
  RotateCcw,
  Plus,
  UserPlus,
  LogOut,
  X,
  DollarSign,
  Shapes,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { LibraXLogo } from './LibraXLogo';
import QuickActionModals from '../dashboard/QuickActionModals';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { metrics, activities } = useLibrary();

  const [activeModal, setActiveModal] = useState(null);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      path: '/dashboard',
      icon: LayoutGrid,
      isActive: location.pathname === '/dashboard' && !location.hash,
    },
    {
      id: 'books',
      label: 'Book Management',
      path: '/books',
      icon: BookOpen,
      badge: metrics?.uniqueTitles || 0,
      isActive: location.pathname.startsWith('/books'),
    },
    {
      id: 'members',
      label: 'Member Management',
      path: '/members',
      icon: Users,
      badge: metrics?.totalMembers || 0,
      isActive: location.pathname.startsWith('/members'),
    },
    {
      id: 'circulation',
      label: 'Circulation & Issues',
      path: '/circulation',
      icon: BookUp,
      badge: metrics?.booksIssued || 0,
      isActive: location.pathname.startsWith('/circulation'),
    },
    {
      id: 'fines',
      label: 'Fine Management',
      path: '/fines',
      icon: DollarSign,
      badge: metrics?.overdueBooks || 0,
      isActive: location.pathname.startsWith('/fines'),
    },
    {
      id: 'categories',
      label: 'Search & Categories',
      path: '/categories',
      icon: Shapes,
      badge: metrics?.totalCategories || 0,
      isActive: location.pathname.startsWith('/categories'),
    },
    {
      id: 'activities',
      label: 'Recent Activity Feed',
      path: '/dashboard#activities',
      icon: Clock,
      badge: activities?.length || 0,
      isActive: location.pathname === '/dashboard' && location.hash === '#activities',
    },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleOpenModal = (modalName) => {
    setActiveModal(modalName);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sticky Sidebar */}
      <aside
        className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-56 h-screen bg-[#221209] text-[#F5EBE1] flex flex-col justify-between shrink-0 select-none transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="relative z-10 flex flex-col">
          {/* Brand Header */}
          <div className="px-4 py-4 flex items-center justify-between border-b border-[#351C0E]">
            <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2">
              <LibraXLogo size="sm" lightText />
            </Link>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden text-[#B89F88] hover:text-white p-1 cursor-pointer"
                title="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Primary Navigation Items */}
          <nav className="px-3 pt-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[12.5px] font-medium transition cursor-pointer ${
                    item.isActive
                      ? 'bg-gradient-to-r from-[#8D5424] to-[#6E3F19] text-white shadow-sm font-semibold'
                      : 'text-[#D4C3B3] hover:bg-[#311C10] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10.5px] min-w-[22px] h-4.5 px-1.5 rounded-full font-semibold flex items-center justify-center shrink-0 ${
                        item.isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#382214] text-[#D4C3B3]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Actions Section */}
            <div className="pt-4 pb-1">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#9A826C] mb-1.5">
                QUICK ACTIONS
              </p>

              <button
                type="button"
                onClick={() => handleOpenModal('issue')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-normal text-[#DFD0C1] hover:bg-[#311C10] hover:text-white transition cursor-pointer"
              >
                <BookUp className="w-3.5 h-3.5 text-[#E57338] shrink-0" />
                <span className="truncate">Quick Issue Book</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenModal('return')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-normal text-[#DFD0C1] hover:bg-[#311C10] hover:text-white transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#25A567] shrink-0" />
                <span className="truncate">Quick Return Book</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenModal('addBook')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-normal text-[#DFD0C1] hover:bg-[#311C10] hover:text-white transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#EAB308] border border-[#EAB308] rounded-full p-0.5 shrink-0" />
                <span className="truncate">Add New Catalog Book</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenModal('addMember')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-normal text-[#DFD0C1] hover:bg-[#311C10] hover:text-white transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#3898FF] shrink-0" />
                <span className="truncate">Enroll New Member</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom Vintage Library Banner with Sign Out */}
        <div className="relative mt-auto pt-3">
          <div className="relative h-36 w-full overflow-hidden">
            <img
              src="/library-bg.png"
              alt="Library Heritage Books"
              className="w-full h-full object-cover object-left-bottom brightness-90 contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#221209] via-[#221209]/30 to-black/75" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-center gap-1.5 bg-black/60 hover:bg-red-900/80 backdrop-blur-xs text-[#F5EBE1] text-[11px] font-medium py-1.5 px-2.5 rounded-lg border border-white/15 transition cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out ({user?.fullName ? user.fullName.split(' ')[0] : 'Librarian'})</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Quick Action Modals mounted globally via Sidebar */}
      <QuickActionModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
}
