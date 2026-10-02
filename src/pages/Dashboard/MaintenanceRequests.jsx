import React from 'react';
import { Droplet, Snowflake, Square } from 'lucide-react';

const requests = [
  { 
    id: 1, 
    issue: 'Leaky Faucet', 
    property: 'Modern Downtown Loft', 
    icon: Droplet,
    status: 'In Progress', 
    statusColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    iconBg: 'bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400'
  },
  { 
    id: 2, 
    issue: 'AC Not Working', 
    property: 'Lakeside Villa', 
    icon: Snowflake,
    status: 'Pending', 
    statusColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    iconBg: 'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400'
  },
  { 
    id: 3, 
    issue: 'Broken Window', 
    property: 'Urban Penthouse', 
    icon: Square,
    status: 'Completed', 
    statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    iconBg: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400'
  },
];

const MaintenanceRequests = () => {
  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Maintenance Requests</h2>
        <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">View All</button>
      </div>
      
      <div className="mt-6 flex-1 space-y-4">
        {requests.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border border-gray-50 bg-gray-50/50 p-4 transition-colors hover:bg-gray-50 dark:border-slate-800/60 dark:bg-slate-800/30 dark:hover:bg-slate-800/60">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${item.iconBg}`}>
                <item.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.issue}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{item.property}</p>
              </div>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${item.statusColor}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaintenanceRequests;