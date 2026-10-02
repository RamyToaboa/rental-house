import React from 'react';
import { ArrowDownLeft, Wrench, UserPlus } from 'lucide-react';

const activities = [
  { 
    id: 1, 
    action: 'New payment received', 
    detail: '$2,500 from Sarah Johnson', 
    time: '1h ago',
    icon: ArrowDownLeft,
    iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
  },
  { 
    id: 2, 
    action: 'Maintenance request updated', 
    detail: 'AC repair in Lakeside Villa', 
    time: '3h ago',
    icon: Wrench,
    iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
  },
  { 
    id: 3, 
    action: 'New tenant added', 
    detail: 'David Wilson for Suburban Smart Home', 
    time: '5h ago',
    icon: UserPlus,
    iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400'
  },
];

const RecentActivity = () => {
  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h2>
        <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">View All</button>
      </div>
      
      <div className="mt-6 flex-1 space-y-6">
        {activities.map((item) => (
          <div key={item.id} className="flex items-start gap-4 border-b border-gray-50 pb-5 last:border-0 last:pb-0 dark:border-slate-800/60">
            <div className={`mt-0.5 rounded-lg p-2 ${item.iconBg}`}>
              <item.icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.action}</p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">{item.detail}</p>
            </div>
            <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;