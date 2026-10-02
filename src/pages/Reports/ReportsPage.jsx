import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  BarChart3, TrendingUp, TrendingDown, Building2, Users, DollarSign,
  Search, Bell, ChevronDown, Plus, FileText, Download, Check,
  Loader2, CheckCircle, FileSpreadsheet
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

/* ============================================================
   Sample Data
   ============================================================ */
const activityData = [
  { date: 'May 1',  revenue: 1050, expenses: 620,  profit: 430,  newTenants: 210 },
  { date: 'May 8',  revenue: 1420, expenses: 780,  profit: 640,  newTenants: 320 },
  { date: 'May 15', revenue: 1380, expenses: 810,  profit: 570,  newTenants: 280 },
  { date: 'May 22', revenue: 1720, expenses: 890,  profit: 830,  newTenants: 420 },
  { date: 'May 29', revenue: 1650, expenses: 920,  profit: 730,  newTenants: 380 },
];

const propertyBreakdown = [
  { name: 'Apartments', value: 5250, percent: '42.2%', color: '#10b981' },
  { name: 'Villas',     value: 3150, percent: '25.3%', color: '#3b82f6' },
  { name: 'Condos',     value: 2350, percent: '18.9%', color: '#f59e0b' },
  { name: 'Townhouses', value: 1200, percent: '9.6%',  color: '#a855f7' },
  { name: 'Others',     value: 500,  percent: '4.0%',  color: '#94a3b8' },
];

const topUsers = [
  { name: 'Sarah Johnson',  role: 'Property Manager', value: 230, avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { name: 'Michael Brown',  role: 'Senior Agent',     value: 180, avatar: 'https://i.pravatar.cc/150?u=michael' },
  { name: 'Emily Davis',    role: 'Agent',            value: 145, avatar: 'https://i.pravatar.cc/150?u=emily' },
  { name: 'David Wilson',   role: 'Agent',            value: 120, avatar: 'https://i.pravatar.cc/150?u=david' },
  { name: 'Jessica Taylor', role: 'Junior Agent',     value: 95,  avatar: 'https://i.pravatar.cc/150?u=jessica' },
];

const reportsSummary = [
  { title: 'Revenue Analytics Report', subtitle: 'Overview of all revenue activity',  count: 12, icon: BarChart3, color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { title: 'Approval Status Report',   subtitle: 'Track approval status and time',     count: 8,  icon: Check,     color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { title: 'Tenant Activity Report',   subtitle: 'Tenant actions and engagement',      count: 15, icon: Users,     color: 'text-purple-600 dark:text-purple-400',  bg: 'bg-purple-50 dark:bg-purple-500/10' },
  { title: 'Occupancy Report',         subtitle: 'Occupancy rates and trends',         count: 6,  icon: Building2, color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-500/10' },
  { title: 'Security Audit Report',    subtitle: 'Security events and access logs',    count: 5,  icon: FileText,  color: 'text-rose-600 dark:text-rose-400',     bg: 'bg-rose-50 dark:bg-rose-500/10' },
];

const recentReports = [
  { title: 'Revenue Analytics Report', subtitle: 'May 1 – May 31, 2024',  format: 'PDF',   time: '2h ago', icon: BarChart3, color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { title: 'Approval Status Report',   subtitle: 'May 1 – May 31, 2024',  format: 'Excel', time: '1d ago', icon: Check,     color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { title: 'Tenant Activity Report',   subtitle: 'Apr 1 – Apr 30, 2024',  format: 'PDF',   time: '2d ago', icon: Users,     color: 'text-purple-600 dark:text-purple-400',  bg: 'bg-purple-50 dark:bg-purple-500/10' },
  { title: 'Occupancy Report',         subtitle: 'May 1 – May 31, 2024',  format: 'Excel', time: '3d ago', icon: Building2, color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-500/10' },
];

/* ============================================================
   Report Generators — real CSV download for each type
   ============================================================ */
const reportGenerators = {
  'Revenue Report': () => {
    const headers = ['Date', 'Revenue', 'Expenses', 'Profit', 'New Tenants'];
    const rows = activityData.map(d => [d.date, d.revenue, d.expenses, d.profit, d.newTenants].join(','));
    return { filename: 'revenue_report', csv: [headers.join(','), ...rows].join('\n') };
  },
  'Occupancy Report': () => {
    const headers = ['Property Type', 'Units', 'Percentage'];
    const rows = propertyBreakdown.map(p => [p.name, p.value, p.percent].join(','));
    return { filename: 'occupancy_report', csv: [headers.join(','), ...rows].join('\n') };
  },
  'Tenant Report': () => {
    const headers = ['Agent Name', 'Role', 'Activity Count'];
    const rows = topUsers.map(u => [u.name, u.role, u.value].join(','));
    return { filename: 'tenant_report', csv: [headers.join(','), ...rows].join('\n') };
  },
  'Financial Summary': () => {
    const totalRevenue  = activityData.reduce((s, d) => s + d.revenue, 0);
    const totalExpenses = activityData.reduce((s, d) => s + d.expenses, 0);
    const totalProfit   = activityData.reduce((s, d) => s + d.profit, 0);
    const csv = [
      'Metric,Amount',
      `Total Revenue,${totalRevenue}`,
      `Total Expenses,${totalExpenses}`,
      `Total Profit,${totalProfit}`,
      `Net Margin,${((totalProfit / totalRevenue) * 100).toFixed(1)}%`,
    ].join('\n');
    return { filename: 'financial_summary', csv };
  },
  'Full Report (All Data)': () => {
    const parts = [
      '=== REVENUE ACTIVITY ===',
      'Date,Revenue,Expenses,Profit,New Tenants',
      ...activityData.map(d => [d.date, d.revenue, d.expenses, d.profit, d.newTenants].join(',')),
      '',
      '=== PROPERTY BREAKDOWN ===',
      'Type,Units,Percentage',
      ...propertyBreakdown.map(p => [p.name, p.value, p.percent].join(',')),
      '',
      '=== TOP AGENTS ===',
      'Name,Role,Activity Count',
      ...topUsers.map(u => [u.name, u.role, u.value].join(',')),
    ];
    return { filename: 'full_report', csv: parts.join('\n') };
  },
};

/* ============================================================
   ReportsPage
   ============================================================ */
const ReportsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isGenOpen, setIsGenOpen] = useState(false);
  const [genMenuPos, setGenMenuPos] = useState({ top: 0, left: 0, width: 240 });
  const genButtonRef = useRef(null);
  const genMenuRef = useRef(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingName, setGeneratingName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [generatedReports, setGeneratedReports] = useState(recentReports);

  const reportTypes = Object.keys(reportGenerators);

  /* 👇 FIXED: Viewport-aware positioning */
  useLayoutEffect(() => {
    if (!isGenOpen || !genButtonRef.current) return;

    const rect = genButtonRef.current.getBoundingClientRect();
    const menuWidth = 240;
    const padding = 12;

    const isMobile = window.innerWidth < 640;
    const finalWidth = isMobile
      ? Math.min(window.innerWidth - padding * 2, 320)
      : menuWidth;

    let left = isMobile ? padding : rect.right - finalWidth;
    left = Math.max(padding, Math.min(left, window.innerWidth - finalWidth - padding));

    const spaceBelow = window.innerHeight - rect.bottom;
    const approxHeight = 260;
    const top = spaceBelow < approxHeight && rect.top > approxHeight
      ? rect.top - 8 - approxHeight
      : rect.bottom + 8;

    setGenMenuPos({ top, left, width: finalWidth });
  }, [isGenOpen]);

  /* 👇 Recalculate on window resize while open */
  useEffect(() => {
    if (!isGenOpen) return;
    const handleResize = () => {
      if (!genButtonRef.current) return;
      const rect = genButtonRef.current.getBoundingClientRect();
      const menuWidth = 240;
      const padding = 12;
      const isMobile = window.innerWidth < 640;
      const finalWidth = isMobile ? Math.min(window.innerWidth - padding * 2, 320) : menuWidth;
      let left = isMobile ? padding : rect.right - finalWidth;
      left = Math.max(padding, Math.min(left, window.innerWidth - finalWidth - padding));
      setGenMenuPos(prev => ({ ...prev, left, width: finalWidth }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isGenOpen]);

  useEffect(() => {
    if (!isGenOpen) return;
    const handleClickOutside = (e) => {
      if (
        genButtonRef.current && !genButtonRef.current.contains(e.target) &&
        genMenuRef.current && !genMenuRef.current.contains(e.target)
      ) {
        setIsGenOpen(false);
      }
    };
    const close = () => setIsGenOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', close, true);
    };
  }, [isGenOpen]);

  const handleGenerate = (reportName) => {
    setIsGenOpen(false);
    setIsGenerating(true);
    setGeneratingName(reportName);

    setTimeout(() => {
      try {
        const generator = reportGenerators[reportName];
        const { filename, csv } = generator();

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        const now = new Date();
        const timeLabel = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const newReport = {
          title: reportName,
          subtitle: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          format: 'CSV',
          time: timeLabel,
          icon: FileSpreadsheet,
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        };
        setGeneratedReports(prev => [newReport, ...prev.slice(0, 3)]);

        setSuccessMessage(`${reportName} downloaded successfully!`);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
      } catch (error) {
        console.error('Report generation failed:', error);
        alert('Failed to generate report. Please try again.');
      } finally {
        setIsGenerating(false);
        setGeneratingName('');
      }
    }, 900);
  };

  const stats = [
    { label: 'Total Properties',   value: '12,450', change: '-15%', trend: 'down', icon: Building2,  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Properties Leased',  value: '2,350',  change: '+18%', trend: 'up',   icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Revenue Collected',  value: '$9,650', change: '+12%', trend: 'up',   icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Active Tenants',     value: '2.8K',   change: '+12%', trend: 'up',   icon: Users,      color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-500/10' },
  ];

  const gridColor = isDark ? '#334155' : '#e5e7eb';
  const axisColor = isDark ? '#94a3b8' : '#6b7280';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#e5e7eb';
  const tooltipText = isDark ? '#f1f5f9' : '#1f2937';

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-9999 flex animate-dropdown-in items-center gap-3 rounded-xl border border-emerald-200 bg-white px-5 py-4 shadow-xl dark:border-emerald-500/30 dark:bg-slate-800">
          <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-500/20">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Report Ready</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Track, analyze and export your real estate performance data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search reports, metrics..."
              className="w-72 rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-9 text-sm text-gray-700 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>

          <button className="relative rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">3</span>
          </button>

          <button
            ref={genButtonRef}
            type="button"
            onClick={() => setIsGenOpen(v => !v)}
            disabled={isGenerating}
            className={`group flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-all sm:px-4 ${
              isGenOpen
                ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : 'border-emerald-500 bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 disabled:opacity-70'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                {/* Short label on mobile, full label on desktop — but ALWAYS visible */}
                <span className="whitespace-nowrap">
                  <span className="sm:hidden">Generating</span>
                  <span className="hidden sm:inline">Generating {generatingName}...</span>
                </span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 shrink-0" />
                {/* Short label on mobile, full label on desktop — but ALWAYS visible */}
                <span className="whitespace-nowrap">
                  <span className="sm:hidden">Generate</span>
                  <span className="hidden sm:inline">Generate Report</span>
                </span>
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${isGenOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-4">
              <div className={`rounded-xl p-3 ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{stat.label}</p>
                <p className="mt-0.5 text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs">
              {stat.trend === 'up' ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stat.change}</span>
              <span className="text-gray-500 dark:text-slate-400">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Reports Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Activity Report</h2>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">Overview of revenue activity over time.</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              May 1 – May 31, 2024
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-5 text-xs">
            {[
              { color: 'bg-emerald-500', label: 'Revenue' },
              { color: 'bg-blue-500', label: 'Expenses' },
              { color: 'bg-amber-500', label: 'Profit' },
              { color: 'bg-gray-400 dark:bg-slate-400', label: 'New Tenants' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${l.color}`} />
                <span className="text-gray-600 dark:text-slate-300">{l.label}</span>
              </div>
            ))}
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: 8, color: tooltipText, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: tooltipText, fontWeight: 600, marginBottom: 4 }}
                  itemStyle={{ color: tooltipText, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="revenue"    name="Revenue"     stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expenses"   name="Expenses"    stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="profit"     name="Profit"      stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="newTenants" name="New Tenants" stroke={isDark ? '#94a3b8' : '#cbd5e1'} strokeWidth={2.5} dot={{ r: 4, fill: isDark ? '#94a3b8' : '#cbd5e1' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Reports Summary</h2>
            <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {reportsSummary.map((r) => (
              <div key={r.title} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800/70">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${r.bg}`}>
                  <r.icon className={`h-5 w-5 ${r.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{r.title}</p>
                  <p className="truncate text-xs text-gray-500 dark:text-slate-400">{r.subtitle}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-base font-bold text-gray-900 dark:text-white">{r.count}</p>
                  <p className="text-[10px] font-medium text-gray-500 dark:text-slate-400">Reports</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Property Breakdown</h2>
            <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              View All
            </button>
          </div>
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={propertyBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                    {propertyBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-gray-900 dark:text-white">12,450</span>
                <span className="text-[11px] text-gray-500 dark:text-slate-400">Total</span>
              </div>
            </div>
            <div className="w-full space-y-2.5">
              {propertyBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-2.5">
                  <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="flex-1 text-sm text-gray-600 dark:text-slate-300">{item.name}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value.toLocaleString()}</span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">{item.percent}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Top Active Agents</h2>
            <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {topUsers.map((user) => (
              <div key={user.name} className="flex items-center gap-3">
                <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full object-cover border border-gray-200 dark:border-slate-700" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="shrink-0 text-xs font-bold text-gray-900 dark:text-white">{user.value}</p>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${(user.value / 250) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Reports</h2>
            <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {generatedReports.map((r, idx) => (
              <div key={`${r.title}-${idx}`} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800/70">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${r.bg}`}>
                  <r.icon className={`h-5 w-5 ${r.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{r.title}</p>
                  <p className="truncate text-xs text-gray-500 dark:text-slate-400">{r.subtitle}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-700 dark:text-slate-300">{r.format}</p>
                    <p className="text-[10px] text-gray-500 dark:text-slate-400">{r.time}</p>
                  </div>
                  <button className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-slate-700 dark:hover:text-slate-200" title="Download">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 👇 Generate Report Dropdown (Portal) — with clamped position */}
      {isGenOpen && createPortal(
        <div
          ref={genMenuRef}
          style={{
            position: 'fixed',
            top: `${genMenuPos.top}px`,
            left: `${genMenuPos.left}px`,
            width: `${genMenuPos.width}px`,
            zIndex: 9999,
          }}
          className="animate-dropdown-in overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800 dark:ring-black/20"
        >
          <div className="border-b border-gray-50 px-4 py-2 dark:border-slate-700/60">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Choose report type
            </p>
          </div>

          <div className="py-1">
            {reportTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleGenerate(type)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
              >
                <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="flex-1 truncate">{type}</span>
                <Download className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" />
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ReportsPage;