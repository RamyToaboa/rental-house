import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';   // 👈 ADD THIS
import { 
  Wrench, Clock, CheckCircle2, AlertCircle, Search, Plus, 
  MoreVertical, Pencil, Trash2, AlertTriangle, X, Loader2, 
  ChevronDown, Check 
} from 'lucide-react';

const initialRequests = [
  { id: 1, issue: 'Leaky Faucet', property: 'Modern Downtown Loft', unit: 'Unit 101', priority: 'Medium', status: 'In Progress', date: 'Feb 1, 2025', assignedTo: 'John Smith' },
  { id: 2, issue: 'AC Not Working', property: 'Lakeside Villa', unit: 'Unit 3B', priority: 'High', status: 'Pending', date: 'Feb 3, 2025', assignedTo: '-' },
  { id: 3, issue: 'Broken Window', property: 'Urban Penthouse', unit: 'Unit PH2', priority: 'High', status: 'Completed', date: 'Jan 28, 2025', assignedTo: 'Mike Ross' },
  { id: 4, issue: 'Paint Touch-up', property: 'Suburban Smart Home', unit: 'Unit 12A', priority: 'Low', status: 'Pending', date: 'Feb 5, 2025', assignedTo: '-' },
];

const MaintenancePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterButtonRef = useRef(null);
  const filterMenuRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusButtonRef = useRef(null);
  const statusMenuRef = useRef(null);

  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const priorityButtonRef = useRef(null);
  const priorityMenuRef = useRef(null);

  const [formData, setFormData] = useState({ issue: '', property: '', unit: '', priority: 'Medium', status: 'Pending', date: '', assignedTo: '' });

  const [requests, setRequests] = useState(() => {
    try { 
      const s = localStorage.getItem('realEstateMaintenance'); 
      return s ? JSON.parse(s) : initialRequests; 
    } catch { 
      return initialRequests; 
    }
  });

  useEffect(() => { localStorage.setItem('realEstateMaintenance', JSON.stringify(requests)); }, [requests]);

  // Global click-outside for all three dropdowns
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
      if (priorityButtonRef.current && !priorityButtonRef.current.contains(e.target) &&
          priorityMenuRef.current && !priorityMenuRef.current.contains(e.target)) {
        setIsPriorityOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on scroll/resize
  useEffect(() => {
    const handler = () => {
      setIsFilterOpen(false);
      setIsStatusOpen(false);
      setIsPriorityOpen(false);
    };
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, []);

  const reset = () => setFormData({ issue: '', property: '', unit: '', priority: 'Medium', status: 'Pending', date: '', assignedTo: '' });

  const handleSave = () => {
    if (!formData.issue || !formData.property) { alert('Please fill required fields'); return; }
    setIsSaving(true);
    setIsStatusOpen(false);
    setIsPriorityOpen(false);
    setTimeout(() => {
      const data = { 
        id: editing ? editing.id : Date.now(), 
        ...formData, 
        date: formData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
        assignedTo: formData.assignedTo || '-' 
      };
      if (editing) setRequests(prev => prev.map(r => r.id === data.id ? data : r));
      else setRequests(prev => [data, ...prev]);
      setIsSaving(false); setIsModalOpen(false); reset();
    }, 600);
  };

  const filtered = requests.filter(r => {
    const q = searchQuery.toLowerCase();
    const match = r.issue.toLowerCase().includes(q) || r.property.toLowerCase().includes(q);
    const st = statusFilter === 'All' || r.status === statusFilter;
    return match && st;
  });

  const stats = [
    { label: 'Total Requests', value: requests.length, icon: Wrench, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Pending', value: requests.filter(r => r.status === 'Pending').length, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: 'In Progress', value: requests.filter(r => r.status === 'In Progress').length, icon: AlertCircle, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Completed', value: requests.filter(r => r.status === 'Completed').length, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  ];

  const badge = (s) => s === 'Completed' 
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
    : s === 'Pending' 
    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
    : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';

  const statusDot = (s) => s === 'Completed' ? 'bg-emerald-500' : s === 'Pending' ? 'bg-amber-500' : 'bg-blue-500';
  const priorityTextColor = (p) => p === 'High' ? 'text-red-600 dark:text-red-400' : p === 'Medium' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-slate-400';
  const priorityDot = (p) => p === 'High' ? 'bg-red-500' : p === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500';

  const filterOptions = ['All', 'Pending', 'In Progress', 'Completed'];
  const statusOptions = ['Pending', 'In Progress', 'Completed'];
  const priorityOptions = ['Low', 'Medium', 'High'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Track and manage maintenance requests</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder="Search requests..." 
              className="w-64 rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-9 text-sm text-gray-700 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" 
            />
          </div>
          <button 
            onClick={() => { reset(); setEditing(null); setIsModalOpen(true); }} 
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4" /> New Request
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
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">All Requests</h2>
          <button
            ref={filterButtonRef}
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
                <th className="px-6 py-4 font-medium">Issue</th>
                <th className="px-6 py-4 font-medium">Property</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium">Assigned To</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{r.issue}</td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900 dark:text-white">{r.property}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{r.unit}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 font-medium ${priorityTextColor(r.priority)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${priorityDot(r.priority)}`} />
                      {r.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-slate-300">{r.assignedTo}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-slate-300">{r.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${badge(r.status)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDot(r.status)}`} />
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)} 
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenuId === r.id && (
                        <div className="absolute right-0 z-50 mt-1 w-36 rounded-lg border border-gray-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                          <button 
                            onClick={() => { setFormData(r); setEditing(r); setIsModalOpen(true); setOpenMenuId(null); }} 
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button 
                            onClick={() => { setDeleteTarget(r); setOpenMenuId(null); }} 
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
          {filtered.length === 0 && <div className="py-16 text-center text-gray-500 dark:text-slate-400">No requests found</div>}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 p-0 backdrop-blur-sm sm:p-4">
          <div className="flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-900 sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-slate-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editing ? 'Edit Request' : 'New Request'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-5 overflow-y-auto p-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Issue *</label>
                <input value={formData.issue} onChange={e => setFormData({ ...formData, issue: e.target.value })} placeholder="e.g. Leaky Faucet" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Property *</label>
                <input value={formData.property} onChange={e => setFormData({ ...formData, property: e.target.value })} placeholder="e.g. Modern Downtown Loft" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Unit</label>
                <input value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} placeholder="e.g. Unit 4B" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>

              {/* Priority button */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Priority</label>
                <button
                  ref={priorityButtonRef}
                  type="button"
                  onClick={() => setIsPriorityOpen(v => !v)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${priorityDot(formData.priority)}`} />
                    {formData.priority}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isPriorityOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Status button */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Status</label>
                <button
                  ref={statusButtonRef}
                  type="button"
                  onClick={() => setIsStatusOpen(v => !v)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${statusDot(formData.status)}`} />
                    {formData.status}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">Assigned To</label>
                <input value={formData.assignedTo} onChange={e => setFormData({ ...formData, assignedTo: e.target.value })} placeholder="Technician name" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-70">
                {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : editing ? 'Update Request' : 'Save Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 👇 FILTER DROPDOWN — rendered in document.body via createPortal */}
      {isFilterOpen && filterButtonRef.current && createPortal(
        <FloatingDropdown
          buttonRef={filterButtonRef}
          onClose={() => setIsFilterOpen(false)}
          alignRight
        >
          {filterOptions.map(option => (
            <DropdownItem
              key={option}
              selected={statusFilter === option}
              onClick={() => { setStatusFilter(option); setIsFilterOpen(false); }}
            >
              {option}
            </DropdownItem>
          ))}
        </FloatingDropdown>,
        document.body
      )}

      {/* 👇 PRIORITY DROPDOWN */}
      {isPriorityOpen && priorityButtonRef.current && createPortal(
        <FloatingDropdown buttonRef={priorityButtonRef} onClose={() => setIsPriorityOpen(false)}>
          {priorityOptions.map(option => (
            <DropdownItem
              key={option}
              selected={formData.priority === option}
              onClick={() => { setFormData({ ...formData, priority: option }); setIsPriorityOpen(false); }}
            >
              <span className={`h-2 w-2 rounded-full ${priorityDot(option)}`} />
              {option}
            </DropdownItem>
          ))}
        </FloatingDropdown>,
        document.body
      )}

      {/* 👇 STATUS DROPDOWN */}
      {isStatusOpen && statusButtonRef.current && createPortal(
        <FloatingDropdown buttonRef={statusButtonRef} onClose={() => setIsStatusOpen(false)}>
          {statusOptions.map(option => (
            <DropdownItem
              key={option}
              selected={formData.status === option}
              onClick={() => { setFormData({ ...formData, status: option }); setIsStatusOpen(false); }}
            >
              <span className={`h-2 w-2 rounded-full ${statusDot(option)}`} />
              {option}
            </DropdownItem>
          ))}
        </FloatingDropdown>,
        document.body
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center dark:bg-slate-900">
            <div className="mx-auto inline-flex rounded-full bg-red-100 p-4 dark:bg-red-500/20">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Delete Request?</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">This will remove <strong>{deleteTarget.issue}</strong>.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm dark:border-slate-700 dark:text-slate-300">Cancel</button>
              <button onClick={() => { setRequests(prev => prev.filter(r => r.id !== deleteTarget.id)); setDeleteTarget(null); }} className="rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   HELPER COMPONENTS — reusable across all pages
   ============================================================ */

function FloatingDropdown({ buttonRef, onClose, alignRight, children }) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  useLayoutEffect(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 176;
    const left = alignRight ? rect.right - menuWidth : rect.left;
    setPos({
      top: rect.bottom + 8,
      left,
      width: alignRight ? menuWidth : rect.width,
    });
  }, [buttonRef, alignRight]);

  return (
    <div
      style={{
        position: 'fixed',
        top: `${pos.top}px`,
        left: `${pos.left}px`,
        width: `${pos.width}px`,
        zIndex: 9999,
      }}
      className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      {children}
    </div>
  );
}

function DropdownItem({ children, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
    >
      <span className="flex items-center gap-2">{children}</span>
      {selected && <Check className="h-4 w-4 text-emerald-500" />}
    </button>
  );
}

export default MaintenancePage;