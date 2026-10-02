import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const pageInfo = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Welcome back, James!' },
  '/properties': { title: 'Properties', subtitle: 'Manage and view all your property listings' },
  '/tenants': { title: 'Tenants', subtitle: 'Manage your tenants and applications' },
  '/leases': { title: 'Leases', subtitle: 'Track lease agreements and renewals' },
  '/payments': { title: 'Payments', subtitle: 'Monitor rent payments and invoices' },
  '/maintenance': { title: 'Maintenance', subtitle: 'Manage maintenance requests' },
  '/messages': { title: 'Messages', subtitle: 'Chat with tenants and staff' },
  '/reports': { title: 'Reports', subtitle: 'View analytics and business insights' },
  '/documents': { title: 'Documents', subtitle: 'Store and manage your files' },
  '/settings': { title: 'Settings', subtitle: 'Manage your account and preferences' },
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentInfo = pageInfo[location.pathname] || { title: '', subtitle: '' };

  // 👇 Auto-close mobile sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // 👇 Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">

      {/* Sidebar (fixed on desktop, drawer on mobile) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main column */}
      <div className="flex h-dvh w-full flex-col overflow-hidden lg:pl-64">

        {/* Top bar — sticky within the column */}
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          title={currentInfo.title}
          subtitle={currentInfo.subtitle}
        />

        {/* Scrollable content area */}
        <main
          id="main-scroll"
          className="
            flex-1 overflow-y-auto overscroll-contain
            p-4 pb-8
            sm:p-6 sm:pb-10
            lg:p-8 lg:pb-12
            [-webkit-overflow-scrolling:touch]
          "
        >
          <div className="mx-auto w-full max-w-8xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;