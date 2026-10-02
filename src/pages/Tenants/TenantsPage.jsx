import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, FileText, UserPlus, Calendar, Search, Bell, Plus, 
  MoreVertical, Pencil, Trash2, AlertTriangle, X, 
  ChevronDown, Check, Filter, Download
} from 'lucide-react';
import AddTenantModal from './AddTenantModal'; 

const initialMockTenants = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.johnson@email.com', avatar: 'https://i.pravatar.cc/150?u=sarah', property: 'Modern Downtown Loft', unit: 'Unit 101', leaseStart: 'Jan 15, 2024', leaseEnd: 'Jan 14, 2025', rent: '$2,500', rentPeriod: 'Monthly', status: 'Active', phone: '(555) 123-4567' },
  { id: 2, name: 'Michael Brown', email: 'michael.brown@email.com', avatar: 'https://i.pravatar.cc/150?u=michael', property: 'Lakeside Villa', unit: 'Unit 3B', leaseStart: 'Mar 1, 2024', leaseEnd: 'Feb 28, 2025', rent: '$2,850', rentPeriod: 'Monthly', status: 'Active', phone: '(555) 234-5678' },
  { id: 3, name: 'Emily Davis', email: 'emily.davis@email.com', avatar: 'https://i.pravatar.cc/150?u=emily', property: 'Urban Penthouse', unit: 'Unit PH2', leaseStart: 'Feb 10, 2024', leaseEnd: 'Feb 9, 2025', rent: '$3,500', rentPeriod: 'Monthly', status: 'Active', phone: '(555) 345-6789' },
  { id: 4, name: 'David Wilson', email: 'david.wilson@email.com', avatar: 'https://i.pravatar.cc/150?u=david', property: 'Suburban Smart Home', unit: 'Unit 12A', leaseStart: 'Apr 5, 2024', leaseEnd: 'Apr 4, 2025', rent: '$2,200', rentPeriod: 'Monthly', status: 'Active', phone: '(555) 456-7890' },
  { id: 5, name: 'Jessica Taylor', email: 'jessica.taylor@email.com', avatar: 'https://i.pravatar.cc/150?u=jessica', property: 'Luxury Waterfront Apt', unit: 'Unit 8C', leaseStart: 'May 20, 2024', leaseEnd: 'May 19, 2025', rent: '$2,200', rentPeriod: 'Monthly', status: 'Pending', phone: '(555) 567-8901' },
  { id: 6, name: 'Daniel Martinez', email: 'daniel.martinez@email.com', avatar: 'https://i.pravatar.cc/150?u=daniel', property: 'Executive Business Condo', unit: 'Unit 5A', leaseStart: 'Jun 1, 2024', leaseEnd: 'May 31, 2025', rent: '$1,500', rentPeriod: 'Monthly', status: 'Inactive', phone: '(555) 678-9012' },
  { id: 7, name: 'Olivia Anderson', email: 'olivia.anderson@email.com', avatar: 'https://i.pravatar.cc/150?u=olivia', property: 'Riverside Luxury Condo', unit: 'Unit 2D', leaseStart: 'Jul 10, 2024', leaseEnd: 'Jul 9, 2025', rent: '$2,450', rentPeriod: 'Monthly', status: 'Active', phone: '(555) 789-0123' },
];

const TenantsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterPos, setFilterPos] = useState({ top: 0, left: 0, width: 0 });
  const filterButtonRef = useRef(null);
  const filterMenuRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tenantToEdit, setTenantToEdit] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [tenantToDelete, setTenantToDelete] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const [tenants, setTenants] = useState(() => {
    try {
      const saved = localStorage.getItem('realEstateTenants');
      return saved ? JSON.parse(saved) : initialMockTenants;
    } catch {
      return initialMockTenants;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('realEstateTenants', JSON.stringify(tenants));
    } catch (error) {
      console.error("Failed to save tenants:", error);
    }
  }, [tenants]);

  // Position filter dropdown
  useLayoutEffect(() => {
    if (!isFilterOpen || !filterButtonRef.current) return;
    const rect = filterButtonRef.current.getBoundingClientRect();
    const padding = 12;
    const width = 176;
    let left = rect.right - width;
    left = Math.max(padding, Math.min(left, window.innerWidth - width - padding));
    const spaceBelow = window.innerHeight - rect.bottom;
    const approxHeight = 200;
    const top = spaceBelow < approxHeight && rect.top > approxHeight
      ? rect.top - 8 - approxHeight
      : rect.bottom + 8;
    setFilterPos({ top, left, width });
  }, [isFilterOpen]);

  useEffect(() => {
    if (!isFilterOpen) return;
    const handleResize = () => {
      if (!filterButtonRef.current) return;
      const rect = filterButtonRef.current.getBoundingClientRect();
      const padding = 12;
      const width = 176;
      let left = rect.right - width;
      left = Math.max(padding, Math.min(left, window.innerWidth - width - padding));
      setFilterPos(prev => ({ ...prev, left }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFilterOpen]);

  useEffect(() => {
    if (!isFilterOpen) return;
    const handleClickOutside = (e) => {
      if (
        filterButtonRef.current && !filterButtonRef.current.contains(e.target) &&
        filterMenuRef.current && !filterMenuRef.current.contains(e.target)
      ) setIsFilterOpen(false);
    };
    const handleScroll = (e) => {
      if (filterMenuRef.current && filterMenuRef.current.contains(e.target)) return;
      setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isFilterOpen]);

  useEffect(() => {
    if (!openMenuId) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-menu-trigger]') && !e.target.closest('[data-menu-content]')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const handleSaveTenant = (tenantData) => {
    if (tenantToEdit) setTenants(prev => prev.map(t => t.id === tenantData.id ? tenantData : t));
    else setTenants(prev => [tenantData, ...prev]);
    setTenantToEdit(null);
  };

  const handleDeleteConfirm = () => {
    if (tenantToDelete) {
      setTenants(prev => prev.filter(t => t.id !== tenantToDelete.id));
      setSelectedIds(prev => prev.filter(id => id !== tenantToDelete.id));
      setTenantToDelete(null);
    }
  };

  const handleBulkDelete = () => {
    setTenants(prev => prev.filter(t => !selectedIds.includes(t.id)));
    setSelectedIds([]);
    setShowBulkDeleteConfirm(false);
  };

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const openEditModal = (t) => { setTenantToEdit(t); setIsModalOpen(true); setOpenMenuId(null); };
  const openDeleteModal = (t) => { setTenantToDelete(t); setOpenMenuId(null); };
  const openAddModal = () => { setTenantToEdit(null); setIsModalOpen(true); };

  const handleExport = () => {
    const dataToExport = filteredTenants;
    if (dataToExport.length === 0) { alert("No tenants to export."); return; }
    const headers = ['Name', 'Email', 'Phone', 'Property', 'Unit', 'Lease Start', 'Lease End', 'Rent', 'Status'];
    const csvRows = dataToExport.map(t => [
      `"${t.name.replace(/"/g, '""')}"`, `"${t.email.replace(/"/g, '""')}"`,
      `"${t.phone.replace(/"/g, '""')}"`, `"${t.property.replace(/"/g, '""')}"`,
      `"${t.unit.replace(/"/g, '""')}"`, `"${t.leaseStart.replace(/"/g, '""')}"`,
      `"${t.leaseEnd.replace(/"/g, '""')}"`, `"${t.rent.replace(/"/g, '""')}"`,
      `"${t.status.replace(/"/g, '""')}"`
    ].join(','));
    const csvString = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tenants_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = 
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.phone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const allVisibleSelected = filteredTenants.length > 0 && filteredTenants.every(t => selectedIds.includes(t.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(prev => prev.filter(id => !filteredTenants.some(t => t.id === id)));
    } else {
      const visibleIds = filteredTenants.map(t => t.id);
      setSelectedIds(prev => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
      case 'Inactive': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500';
      case 'Pending': return 'bg-amber-500';
      case 'Inactive': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filterOptions = ['All', 'Active', 'Pending', 'Inactive'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tenants</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Manage your tenants and applications</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tenant name, email, or phone..."
              className="w-80 rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-9 text-sm text-gray-700 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" />
          </div>
          <button className="relative rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">3</span>
          </button>
          <button onClick={openAddModal} className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600 dark:shadow-none">
            <Plus className="h-4 w-4" /> Add Tenant
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Tenants', value: tenants.length, change: '+8% from last month', icon: Users, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Active Tenants', value: tenants.filter(t => t.status === 'Active').length, change: '85% of total tenants', icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Pending Applications', value: tenants.filter(t => t.status === 'Pending').length, change: 'View pending requests', icon: UserPlus, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10', isLink: true },
          { label: 'Lease Expiring Soon', value: '7', change: 'Within next 60 days', icon: Calendar, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', isLink: true },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className={`inline-flex rounded-lg p-3 ${stat.bg}`}><stat.icon className={`h-6 w-6 ${stat.color}`} /></div>
            <p className="mt-4 text-sm font-medium text-gray-500 dark:text-slate-400">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className={`mt-2 text-xs font-medium ${stat.isLink ? 'text-blue-600 dark:text-blue-400 cursor-pointer hover:underline' : 'text-emerald-600 dark:text-emerald-400'}`}>{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">All Tenants</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button ref={filterButtonRef} onClick={() => setIsFilterOpen(v => !v)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter !== 'All' 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30' 
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}>
              <Filter className="h-4 w-4" /> 
              {statusFilter === 'All' ? 'Filter' : `Filter: ${statusFilter}`}
              <ChevronDown className={`h-3 w-3 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            <button onClick={handleExport} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
              <Download className="h-4 w-4" /> Export
            </button>
            {selectedIds.length > 0 && (
              <button onClick={() => setShowBulkDeleteConfirm(true)} className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20">
                <Trash2 className="h-4 w-4" /> Delete ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between border-b border-gray-100 bg-emerald-50/50 px-4 py-2 dark:border-slate-800 dark:bg-emerald-500/5">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{selectedIds.length} tenant{selectedIds.length > 1 ? 's' : ''} selected</p>
            <button onClick={() => setSelectedIds([])} className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200">
              <X className="h-3 w-3" /> Clear selection
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4"><input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} className="cursor-pointer rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" /></th>
                <th className="px-6 py-4 font-medium">Tenant</th>
                <th className="px-6 py-4 font-medium">Property</th>
                <th className="px-6 py-4 font-medium">Lease Dates</th>
                <th className="px-6 py-4 font-medium">Rent Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredTenants.map((tenant) => {
                const isSelected = selectedIds.includes(tenant.id);
                return (
                  <tr key={tenant.id} className={`transition-colors ${isSelected ? 'bg-emerald-50/50 dark:bg-emerald-500/5' : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}>
                    <td className="px-6 py-4"><input type="checkbox" checked={isSelected} onChange={() => toggleSelect(tenant.id)} className="cursor-pointer rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={tenant.avatar} alt={tenant.name} loading="lazy" decoding="async" className="h-9 w-9 rounded-full border border-gray-200 object-cover dark:border-slate-700" onError={(e) => { e.target.src = `https://i.pravatar.cc/150?u=${tenant.id}`; }} />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{tenant.name}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{tenant.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><p className="font-medium text-gray-900 dark:text-white">{tenant.property}</p><p className="text-xs text-gray-500 dark:text-slate-400">{tenant.unit}</p></td>
                    <td className="px-6 py-4"><p className="text-gray-900 dark:text-white">{tenant.leaseStart}</p><p className="text-xs text-gray-500 dark:text-slate-400">– {tenant.leaseEnd}</p></td>
                    <td className="px-6 py-4"><p className="font-semibold text-gray-900 dark:text-white">{tenant.rent}</p><p className="text-xs text-gray-500 dark:text-slate-400">{tenant.rentPeriod}</p></td>
                    <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusBadge(tenant.status)}`}><span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(tenant.status)}`} />{tenant.status}</span></td>
                    <td className="px-6 py-4"><p className="text-gray-900 dark:text-white">{tenant.phone}</p><p className="text-xs text-gray-500 dark:text-slate-400">{tenant.email}</p></td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <button data-menu-trigger onClick={() => setOpenMenuId(openMenuId === tenant.id ? null : tenant.id)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700 dark:hover:text-slate-200">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenuId === tenant.id && (
                          <div data-menu-content className="absolute right-0 z-50 mt-1 w-36 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                            <button onClick={() => openEditModal(tenant)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700/50">
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button onClick={() => openDeleteModal(tenant)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredTenants.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-medium text-gray-900 dark:text-white">No tenants found</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Try adjusting your search or filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <AddTenantModal 
          key={tenantToEdit ? `edit-${tenantToEdit.id}` : 'new-tenant'}
          onClose={() => { setIsModalOpen(false); setTenantToEdit(null); }} 
          onSave={handleSaveTenant}
          tenantToEdit={tenantToEdit}
        />
      )}

      {/* 👇 Filter Dropdown — via portal, no clipping */}
      {isFilterOpen && createPortal(
        <div ref={filterMenuRef} style={{ position: 'fixed', top: `${filterPos.top}px`, left: `${filterPos.left}px`, width: `${filterPos.width}px`, zIndex: 9999 }}
          className="animate-dropdown-in overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800 dark:ring-black/20">
          <div className="border-b border-gray-50 px-4 py-2 dark:border-slate-700/60">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">Filter by status</p>
          </div>
          <div className="py-1">
            {filterOptions.map(option => {
              const isSelected = statusFilter === option;
              return (
                <button key={option} onClick={() => { setStatusFilter(option); setIsFilterOpen(false); }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                    isSelected ? 'bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                  }`}>
                  <span className="flex items-center gap-2">
                    {option !== 'All' && <span className={`h-2 w-2 rounded-full ${getStatusDot(option)}`} />}
                    {option}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}

      {/* Single Delete Confirmation — z-[10000] is CORRECT */}
      {tenantToDelete && (
        <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex flex-col items-center px-6 pt-8 text-center">
              <div className="rounded-full bg-red-100 p-4 dark:bg-red-500/20"><AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" /></div>
              <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Delete Tenant</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{tenantToDelete.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="mt-8 flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6">
              <button onClick={() => setTenantToDelete(null)} className="w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:w-auto">Cancel</button>
              <button onClick={handleDeleteConfirm} className="w-full rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-600 sm:w-auto">Delete Tenant</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation — z-[10000] is CORRECT */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex flex-col items-center px-6 pt-8 text-center">
              <div className="rounded-full bg-red-100 p-4 dark:bg-red-500/20"><AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" /></div>
              <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Delete {selectedIds.length} Tenant{selectedIds.length > 1 ? 's' : ''}?</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                You are about to delete <span className="font-semibold text-red-600 dark:text-red-400">{selectedIds.length} tenant{selectedIds.length > 1 ? 's' : ''}</span>. This action cannot be undone.
              </p>
            </div>
            <div className="mt-8 flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6">
              <button onClick={() => setShowBulkDeleteConfirm(false)} className="w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:w-auto">Cancel</button>
              <button onClick={handleBulkDelete} className="w-full rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-600 sm:w-auto">Delete {selectedIds.length} Tenant{selectedIds.length > 1 ? 's' : ''}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantsPage;