import React, { useState } from 'react';
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

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex w-full flex-col lg:pl-64">
        <Topbar 
          onMenuClick={() => setSidebarOpen(true)} 
          title={currentInfo.title} 
          subtitle={currentInfo.subtitle} 
        />
        
        <main className="flex-1 overflow-y-auto overscroll-contain p-4 pb-6 sm:p-6 sm:pb-6 lg:p-8 lg:pb-6">
          {/* 👇 Widened from 7xl to 8xl */}
          <div className="mx-auto max-w-8xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;