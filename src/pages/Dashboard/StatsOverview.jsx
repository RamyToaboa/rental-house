import React from 'react';
import { Home, Users, DollarSign, Clock, TrendingUp } from 'lucide-react';

const stats = [
  { 
    label: 'Total Properties', 
    value: '40', 
    icon: Home, 
    change: '12%', 
    color: 'text-emerald-600 dark:text-emerald-400', 
    bg: 'bg-emerald-50 dark:bg-emerald-500/10' 
  },
  { 
    label: 'Total Tenants', 
    value: '68', 
    icon: Users, 
    change: '8%', 
    color: 'text-purple-600 dark:text-purple-400', 
    bg: 'bg-purple-50 dark:bg-purple-500/10' 
  },
  { 
    label: 'Monthly Revenue', 
    value: '$48,750', 
    icon: DollarSign, 
    change: '15%', 
    color: 'text-emerald-600 dark:text-emerald-400', 
    bg: 'bg-emerald-50 dark:bg-emerald-500/10' 
  },
  { 
    label: 'Occupancy Rate', 
    value: '92%', 
    icon: Clock, 
    change: '5%', 
    color: 'text-orange-600 dark:text-orange-400', 
    bg: 'bg-orange-50 dark:bg-orange-500/10' 
  },
];

const StatsOverview = () => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between">
            <div className={`rounded-lg p-3 ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            
            {/* 👇 RESTORED: The arrow and "from last month" text */}
            <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
              <span>{stat.change}</span>
              <span className="font-normal text-gray-400 dark:text-slate-500">
                from last month
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;