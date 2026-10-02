import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  DollarSign, Clock, AlertCircle, TrendingUp, Search, Plus, 
  MoreVertical, Pencil, Trash2, AlertTriangle, X, Loader2, 
  Download, ChevronDown, Check 
} from 'lucide-react';

const initialPayments = [
  { id: 1, tenant: 'Sarah Johnson', property: 'Modern Downtown Loft', amount: '$2,500', dueDate: 'Jan 15, 2025', status: 'Paid', method: 'Bank Transfer' },
  { id: 2, tenant: 'Michael Brown', property: 'Lakeside Villa', amount: '$2,850', dueDate: 'Feb 1, 2025', status: 'Paid', method: 'Credit Card' },
  { id: 3, tenant: 'Emily Davis', property: 'Urban Penthouse', amount: '$3,500', dueDate: 'Feb 10, 2025', status: 'Pending', method: '-' },
  { id: 4, tenant: 'David Wilson', property: 'Suburban Smart Home', amount: '$2,200', dueDate: 'Feb 5, 2025', status: 'Overdue', method: '-' },
  { id: 5, tenant: 'Jessica Taylor', property: 'Luxury Waterfront Apt', amount: '$2,200', dueDate: 'Jan 20, 2025', status: 'Paid', method: 'PayPal' },
];

const PaymentsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterPos, setFilterPos] = useState({ top: 0, left: 0, width: 176 });
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

  const [formData, setFormData] = useState({ tenant: '', property: '', amount: '', dueDate: '', status: 'Pending', method: '' });

  const [payments, setPayments] = useState(() => {
    try { 
      const s = localStorage.getItem('realEstatePayments'); 
      return s ? JSON.parse(s) : initialPayments; 
    } catch { 
      return initialPayments; 
    }
  });

  useEffect(() => { 
    localStorage.setItem('realEstatePayments', JSON.stringify(payments)); 
  }, [payments]);

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
    setFilterPos(computePosition(filterButtonRef.current, 176));
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
        setFilterPos(computePosition(filterButtonRef.current, 176));
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

  const reset = () => setFormData({ tenant: '', property: '', amount: '', dueDate: '', status: 'Pending', method: '' });

  const handleSave = () => {
    if (!formData.tenant || !formData.amount || !formData.dueDate) { 
      alert('Please fill required fields'); 
      return; 
    }
    setIsSaving(true);
    setIsStatusOpen(false);
    setTimeout(() => {
      const data = {
        id: editing ? editing.id : Date.now(),
        tenant: formData.tenant,
        property: formData.property || 'N/A',
        amount: formData.amount.startsWith('$') ? formData.amount : `$${Number(formData.amount).toLocaleString()}`,
        dueDate: formData.dueDate,
        status: formData.status,
        method: formData.method || '-',
      };
      if (editing) setPayments(prev => prev.map(p => p.id === data.id ? data : p));
      else setPayments(prev => [data, ...prev]);
      setIsSaving(false); 
      setIsModalOpen(false); 
      reset();
    }, 600);
  };

  const handleExport = () => {
    const headers = ['Tenant', 'Property', 'Amount', 'Due Date', 'Status', 'Method'];
    const rows = filtered.map(p => [p.tenant, p.property, p.amount, p.dueDate, p.status, p.method].map(v => `"${v}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = `payments_${Date.now()}.csv`; 
    a.click();
  };

  const filtered = payments.filter(p => {
    const q = searchQuery.toLowerCase();
    const match = p.tenant.toLowerCase().includes(q) || p.property.toLowerCase().includes(q);
    const st = statusFilter === 'All' || p.status === statusFilter;
    return match && st;
  });

  const totalCollected = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + Number(p.amount.replace(/[^0-9.]/g, '')), 0);
  const pending = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + Number(p.amount.replace(/[^0-9.]/g, '')), 0);
  const overdue = payments.filter(p => p.status === 'Overdue').reduce((sum, p) => sum + Number(p.amount.replace(/[^0-9.]/g, '')), 0);

  const stats = [
    { label: 'Total Collected', value: `$${totalCollected.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Pending', value: `$${pending.toLocaleString()}`, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: 'Overdue', value: `$${overdue.toLocaleString()}`, icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
    { label: 'Total Payments', value: payments.length, icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  ];

  const badge = (s) => s === 'Paid' 
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
    : s === 'Pending' 
    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';

  const dotColor = (s) => s === 'Paid' ? 'bg-emerald-500' : s === 'Pending' ? 'bg-amber-500' : 'bg-red-500';

  const filterOptions = ['All', 'Paid', 'Pending', 'Overdue'];
  const statusOptions = ['Paid', 'Pending', 'Overdue'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Track rent payments and invoices</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder="Search payments..." 
              className="w-56 rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-9 text-sm text-gray-700 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" 
            />
          </div>
          <button 
            onClick={handleExport} 
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Download className="h-4 w-4" /> Export
          </button>
          <button 
            onClick={() => { reset(); setEditing(null); setIsStatusOpen(false); setIsModalOpen(true); }} 
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 dark:shadow-none"
          >
            <Plus className="h-4 w-4" /> Record Payment
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
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">All Payments</h2>

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
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Due Date</th>
                <th className="px-6 py-4 font-medium">Method</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{p.tenant}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-slate-300">{p.property}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{p.amount}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-slate-300">{p.dueDate}</td>
                  <td className="px-6 py-4 text-xs text-gray-500 dark:text-slate-400">{p.method}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${badge(p.status)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${dotColor(p.status)}`} />
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)} 
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenuId === p.id && (
                        <div className="absolute right-0 z-50 mt-1 w-36 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                          <button 
                            onClick={() => { 
                              setFormData({ 
                                tenant: p.tenant, 
                                property: p.property, 
                                amount: p.amount.replace(/[^0-9.]/g, ''), 
                                dueDate: p.dueDate, 
                                status: p.status, 
                                method: p.method 
                              }); 
                              setEditing(p); 
                              setIsStatusOpen(false);
                              setIsModalOpen(true); 
                              setOpenMenuId(null); 
                            }} 
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button 
                            onClick={() => { setDeleteTarget(p); setOpenMenuId(null); }} 
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
            <div className="py-16 text-center">
              <p className="text-gray-500 dark:text-slate-400">No payments found</p>
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
                {editing ? 'Edit Payment' : 'Record Payment'}
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
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Property</label>
                <input 
                  value={formData.property} 
                  onChange={e => setFormData({ ...formData, property: e.target.value })} 
                  placeholder="e.g. Modern Downtown Loft" 
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Amount *</label>
                <input 
                  type="number" 
                  value={formData.amount} 
                  onChange={e => setFormData({ ...formData, amount: e.target.value })} 
                  placeholder="2500" 
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Due Date *</label>
                <input 
                  value={formData.dueDate} 
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })} 
                  placeholder="Feb 1, 2025" 
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Payment Method</label>
                <input 
                  value={formData.method} 
                  onChange={e => setFormData({ ...formData, method: e.target.value })} 
                  placeholder="Bank Transfer / Credit Card / PayPal" 
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
                  editing ? 'Update Payment' : 'Save Payment'
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
              <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Delete Payment?</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                This will remove the payment record for <strong className="text-gray-900 dark:text-white">{deleteTarget.tenant}</strong>.
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
                onClick={() => { setPayments(prev => prev.filter(p => p.id !== deleteTarget.id)); setDeleteTarget(null); }} 
                className="w-full rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-600 sm:w-auto"
              >
                Delete Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;