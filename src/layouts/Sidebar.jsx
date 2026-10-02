import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  DollarSign,
  Wrench,
  BarChart3,
  Files,
  Settings,
  Home,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import SettingsModal from '../components/SettingsModal';

const navItems = [
  { label: 'Dashboard',   icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Properties',  icon: Building2,       path: '/properties' },
  { label: 'Tenants',     icon: Users,           path: '/tenants' },
  { label: 'Leases',      icon: FileText,        path: '/leases' },
  { label: 'Payments',    icon: DollarSign,      path: '/payments' },
  { label: 'Maintenance', icon: Wrench,          path: '/maintenance' },
  { label: 'Reports',     icon: BarChart3,       path: '/reports' },
  // { label: 'Documents',   icon: Files,           path: '/documents' },
];

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openSettings = () => {
    setSettingsOpen(true);
    onClose(); // close mobile drawer if open
  };

  return (
    <>
      {/* Mobile backdrop — full screen, darker for clarity */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      <aside
        className={cn(
          // 👇 Fixed positioning + full dvh height + responsive width
          'fixed top-0 left-0 z-50 flex h-dvh flex-col',
          'w-72 max-w-[85vw] lg:w-64 lg:max-w-none',
          'bg-white dark:bg-slate-900',
          'border-r border-gray-200 dark:border-slate-800',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ willChange: 'transform' }}
      >
        {/* ============================================ */}
        {/* Logo Header — fixed at top                   */}
        {/* ============================================ */}
        <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-6 pb-5 lg:px-6 lg:pt-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 shadow-sm shadow-emerald-200 dark:shadow-none">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold leading-tight text-gray-900 dark:text-white lg:text-lg">
                RealEstate Pro
              </h1>
              <p className="mt-0.5 truncate text-xs font-medium text-gray-500 dark:text-slate-400">
                Rental Management
              </p>
            </div>
          </div>

          {/* Close button (mobile only) */}
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ============================================ */}
        {/* Navigation — scrolls if too many items       */}
        {/* ============================================ */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4 lg:px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 lg:px-4 lg:py-3',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'h-4.5 w-4.5 shrink-0 lg:h-5 lg:w-5',
                      isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-400 dark:text-slate-500'
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Settings — opens modal */}
          <button
            onClick={openSettings}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100 lg:px-4 lg:py-3"
          >
            <Settings className="h-4.5 w-4.5 shrink-0 text-gray-400 dark:text-slate-500 lg:h-5 lg:w-5" />
            <span className="truncate">Settings</span>
          </button>
        </nav>

        {/* ============================================ */}
        {/* User profile + Logout — fixed at bottom      */}
        {/* ============================================ */}
        <div className="shrink-0 border-t border-gray-100 p-3 lg:p-4 dark:border-slate-800">
          {/* User info */}
          <div className="mb-2 flex items-center gap-3 rounded-xl p-2 lg:mb-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-300 bg-gray-200 dark:border-slate-700">
              <img
                src={user?.avatar || 'https://i.pravatar.cc/150?u=james'}
                alt={user?.name || 'User'}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {user?.name || 'James Anderson'}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-slate-400">
                {user?.email || 'james@example.com'}
              </p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Settings Modal */}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  );
};

export default Sidebar;