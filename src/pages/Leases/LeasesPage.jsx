import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FileText, Clock, CheckCircle2, XCircle, Search, Plus, 
  MoreVertical, Pencil, Trash2, AlertTriangle, X, Loader2, 
  ChevronDown, Check 
} from 'lucide-react';

const initialLeases = [
  { id: 1, tenant: 'Sarah Johnson', property: 'Modern Downtown Loft', unit: 'Unit 101', start: 'Jan 15, 2024', end: 'Jan 14, 2025', rent: '$2,500', status: 'Active' },
  { id: 2, tenant: 'Michael Brown', property: 'Lakeside Villa', unit: 'Unit 3B', start: 'Mar 1, 2024', end: 'Feb 28, 2025', rent: '$2,850', status: 'Active' },
  { id: 3, tenant: 'Emily Davis', property: 'Urban Penthouse', unit: 'Unit PH2', start: 'Feb 10, 2024', end: 'Feb 9, 2025', rent: '$3,500', status: 'Expiring Soon' },
  { id: 4, tenant: 'David Wilson', property: 'Suburban Smart Home', unit: 'Unit 12A', start: 'Apr 5, 2024', end: 'Apr 4, 2025', rent: '$2,200', status: 'Active' },
  { id: 5, tenant: 'Jessica Taylor', property: 'Luxury Waterfront Apt', unit: 'Unit 8C', start: 'May 20, 2023', end: 'May 19, 2024', rent: '$2,200', status: 'Expired' },
];

const LeasesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterPos, setFilterPos] = useState({ top: 0, left: 0, width: 190 });
  const filterButtonRef = useRef(null);
  const filterMenuRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Status dropdown in modal
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [statusPos, setStatusPos] = useState({ top: 0, left: 0, width: 0 });
  const statusButtonRef = useRef(null);
  const statusMenuRef = useRef(null);

  const [leases, setLeases] = useState(() => {
    try { 
      const s = localStorage.getItem('realEstateLeases'); 
      return s ? JSON.parse(s) : initialLeases; 
    } catch { 
      return initialLeases; 
    }
  });

  const [formData, setFormData] = useState({ 
    tenant: '', property: '', unit: '', start: '', end: '', rent: '', status: 'Active' 
  });

  useEffect(() => { 
    localStorage.setItem('realEstateLeases', JSON.stringify(leases)); 
  }, [leases]);

  /* ============================================================
     Position calculation — viewport-aware clamping
     ============================================================ */
  const computePosition = (buttonEl, width) => {
    const rect = buttonEl.getBoundingClientRect();
    const padding = 12;
    const isMobile = window.innerWidth < 640;
    const finalWidth = isMobile ? Math.min(window.innerWidth - padding * 2, width) : width;

    let left = isMobile ? padding : rect.right - finalWidth;
    left = Math.max(padding, Math.min(left, window.innerWidth - finalWidth - padding));

    const spaceBelow = window.innerHeight - rect.bottom;
    const approxHeight = 200;
    const top = spaceBelow < approxHeight && rect.top > approxHeight
      ? rect.top - 8 - approxHeight
      : rect.bottom + 8;

    return { top, left, width: finalWidth };
  };

  /* Filter dropdown positioning */
  useLayoutEffect(() => {
    if (!isFilterOpen || !filterButtonRef.current) return;
    setFilterPos(computePosition(filterButtonRef.current, 190));
  }, [isFilterOpen]);

  /* Status dropdown positioning */
  useLayoutEffect(() => {
    if (!isStatusOpen || !statusButtonRef.current) return;
    setStatusPos(computePosition(statusButtonRef.current, statusButtonRef.current.offsetWidth || 300));
  }, [isStatusOpen]);

  /* Reposition on resize */
  useEffect(() => {
    const handleResize = () => {
      if (isFilterOpen && filterButtonRef.current) {
        setFilterPos(computePosition(filterButtonRef.current, 190));
      }
      if (isStatusOpen && statusButtonRef.current) {
        setStatusPos(computePosition(statusButtonRef.current, statusButtonRef.current.offsetWidth || 300));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFilterOpen, isStatusOpen]);

  /* Click outside + scroll close */
  useEffect(() => {
    const handler = (e) => {
      if (filterButtonRef.current && !filterButtonRef.current.contains(e.target) &&
          filterMenuRef.current && !filterMenuRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
      if (statusButtonRef.current && !statusButtonRef.current.contains(e.target) &&
          statusMenuRef.current && !statusMenuRef.current.contains(e.target)) {
        setIsStatusOpen(false);
      }
    };
    const close = () => { setIsFilterOpen(false); setIsStatusOpen(false); };
    document.addEventListener('mousedown', handler);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('scroll', close, true);
    };
  }, []);

  const resetForm = () => setFormData({ tenant: '', property: '', unit: '', start: '', end: '', rent: '', status: 'Active' });

  const openAdd = () => { 
    resetForm(); 
    setEditing(null); 
    setIsStatusOpen(false);
    setIsModalOpen(true); 
  };

  const openEdit = (lease) => {
    setFormData({ 
      tenant: lease.tenant, 
      property: lease.property, 
      unit: lease.unit, 
      start: lease.start, 
      end: lease.end, 
      rent: lease.rent.replace(/[^0-9.]/g, ''), 
      status: lease.status 
    });
    setEditing(lease); 
    setIsStatusOpen(false);
    setIsModalOpen(true); 
    setOpenMenuId(null);
  };

  const handleSave = () => {
    if (!formData.tenant || !formData.property || !formData.start || !formData.end) { 
      alert('Please fill in all required fields'); 
      return; 
    }
    setIsSaving(true);
    setIsStatusOpen(false);
    setTimeout(() => {
      const leaseData = {
        id: editing ? editing.id : Date.now(),
        tenant: formData.tenant,
        property: formData.property,
        unit: formData.unit || 'N/A',
        start: formData.start,
        end: formData.end,
        rent: formData.rent ? `$${Number(formData.rent).toLocaleString()}` : '$0',
        status: formData.status,
      };
      if (editing) setLeases(prev => prev.map(l => l.id === leaseData.id ? leaseData : l));
      else setLeases(prev => [leaseData, ...prev]);
      setIsSaving(false); 
      setIsModalOpen(false); 
      resetForm();
    }, 600);
  };

  const confirmDelete = () => { 
    setLeases(prev => prev.filter(l => l.id !== deleteTarget.id)); 
    setDeleteTarget(null); 
  };

  const filtered = leases.filter(l => {
    const q = searchQuery.toLowerCase();
    const match = l.tenant.toLowerCase().includes(q) || l.property.toLowerCase().includes(q);
    const st = statusFilter === 'All' || l.status === statusFilter;
    return match && st;
  });

  const stats = [
    { label: 'Total Leases', value: leases.length, icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Active', value: leases.filter(l => l.status === 'Active').length, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Expiring Soon', value: leases.filter(l => l.status === 'Expiring Soon').length, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: 'Expired', value: leases.filter(l => l.status === 'Expired').length, icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
  ];

  const badge = (s) => s === 'Active' 
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
    : s === 'Expiring Soon' 
    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';

  const dotColor = (s) => s === 'Active' ? 'bg-emerald-500' : s === 'Expiring Soon' ? 'bg-amber-500' : 'bg-red-500';

  const filterOptions = ['All', 'Active', 'Expiring Soon', 'Expired'];
  const statusOptions = ['Active', 'Expiring Soon', 'Expired'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leases</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Manage all lease agreements</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder="Search leases..." 
              className="w-64 rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-9 text-sm text-gray-700 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" 
            />
          </div>
          <button 
            onClick={openAdd} 
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 dark:shadow-none"
          >
            <Plus className="h-4 w-4" /> New Lease
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className={`inline-flex rounded-lg p-3 ${s.bg}`}>
              <s.icon className={`h-6 w-6 ${s.color}`} />
            </div>
            <p className="mt-4 text-sm font-medium text-gray-500 dark:text-slate-400">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">All Leases</h2>

          {/* Filter dropdown button */}
          <button
            ref={filterButtonRef}
            type="button"
            onClick={() => setIsFilterOpen(v => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter !== 'All'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {statusFilter === 'All' ? 'Filter' : `Filter: ${statusFilter}`}
            <ChevronDown className={`h-3 w-3 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Tenant</th>
                <th className="px-6 py-4 font-medium">Property</th>
                <th className="px-6 py-4 font-medium">Start</th>
                <th className="px-6 py-4 font-medium">End</th>
                <th className="px-6 py-4 font-medium">Rent</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{l.tenant}</td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900 dark:text-white">{l.property}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{l.unit}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{l.start}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{l.end}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{l.rent}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${badge(l.status)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${dotColor(l.status)}`} />
                      {l.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === l.id ? null : l.id)} 
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenuId === l.id && (
                        <div className="absolute right-0 z-50 mt-1 w-36 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                          <button 
                            onClick={() => openEdit(l)} 
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button 
                            onClick={() => { setDeleteTarget(l); setOpenMenuId(null); }} 
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-medium text-gray-900 dark:text-white">No leases found</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Try adjusting your filter or search query.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 p-0 backdrop-blur-sm sm:p-4">
          <div className="flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-900 sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-slate-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editing ? 'Edit Lease' : 'New Lease'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-5 overflow-y-auto p-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Tenant *</label>
                <input 
                  value={formData.tenant} 
                  onChange={e => setFormData({ ...formData, tenant: e.target.value })} 
                  placeholder="e.g. Sarah Johnson" 
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Property *</label>
                <input 
                  value={formData.property} 
                  onChange={e => setFormData({ ...formData, property: e.target.value })} 
                  placeholder="e.g. Modern Downtown Loft" 
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Unit</label>
                <input 
                  value={formData.unit} 
                  onChange={e => setFormData({ ...formData, unit: e.target.value })} 
                  placeholder="e.g. Unit 4B" 
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Rent</label>
                <input 
                  type="number" 
                  value={formData.rent} 
                  onChange={e => setFormData({ ...formData, rent: e.target.value })} 
                  placeholder="2500" 
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Start Date *</label>
                <input 
                  value={formData.start} 
                  onChange={e => setFormData({ ...formData, start: e.target.value })} 
                  placeholder="Jan 1, 2025" 
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">End Date *</label>
                <input 
                  value={formData.end} 
                  onChange={e => setFormData({ ...formData, end: e.target.value })} 
                  placeholder="Dec 31, 2025" 
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                />
              </div>

              {/* Status dropdown button */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Status</label>
                <button
                  ref={statusButtonRef}
                  type="button"
                  onClick={() => setIsStatusOpen(v => !v)}
                  className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-sm transition-all ${
                    isStatusOpen
                      ? 'border-emerald-500 bg-white text-gray-900 ring-2 ring-emerald-500/20 dark:border-emerald-500/60 dark:bg-slate-800 dark:text-white'
                      : 'border-gray-200 bg-gray-50 text-gray-900 hover:border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotColor(formData.status)}`} />
                    <span className="font-medium">{formData.status}</span>
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isStatusOpen ? 'rotate-180 text-emerald-500' : 'text-gray-400'}`} />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={isSaving} 
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-70"
              >
                {isSaving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  editing ? 'Update Lease' : 'Save Lease'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== Filter Dropdown ==================== */}
      {isFilterOpen && createPortal(
        <div
          ref={filterMenuRef}
          style={{
            position: 'fixed',
            top: `${filterPos.top}px`,
            left: `${filterPos.left}px`,
            width: `${filterPos.width}px`,
            zIndex: 9999,
          }}
          className="animate-dropdown-in overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800 dark:ring-black/20"
        >
          <div className="border-b border-gray-50 px-4 py-2 dark:border-slate-700/60">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Filter by status
            </p>
          </div>
          <div className="py-1">
            {filterOptions.map(option => {
              const isSelected = statusFilter === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => { setStatusFilter(option); setIsFilterOpen(false); }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {option !== 'All' && (
                      <span className={`h-2 w-2 rounded-full ${dotColor(option)}`} />
                    )}
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

      {/* ==================== Status Dropdown (in modal) ==================== */}
      {isStatusOpen && createPortal(
        <div
          ref={statusMenuRef}
          style={{
            position: 'fixed',
            top: `${statusPos.top}px`,
            left: `${statusPos.left}px`,
            width: `${statusPos.width}px`,
            zIndex: 9999,
          }}
          className="animate-dropdown-in overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800 dark:ring-black/20"
        >
          <div className="border-b border-gray-50 px-4 py-2 dark:border-slate-700/60">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Change status
            </p>
          </div>
          <div className="py-1">
            {statusOptions.map(option => {
              const isSelected = formData.status === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => { setFormData({ ...formData, status: option }); setIsStatusOpen(false); }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotColor(option)}`} />
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

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex flex-col items-center px-6 pt-8 text-center">
              <div className="rounded-full bg-red-100 p-4 dark:bg-red-500/20">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Delete Lease?</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                This will permanently remove the lease for <strong className="text-gray-900 dark:text-white">{deleteTarget.tenant}</strong>.
              </p>
            </div>
            <div className="mt-8 flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6">
              <button 
                onClick={() => setDeleteTarget(null)} 
                className="w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:w-auto"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="w-full rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-600 sm:w-auto"
              >
                Delete Lease
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeasesPage;