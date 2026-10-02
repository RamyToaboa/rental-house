import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const data = [
  { name: 'Occupied', value: 37, color: '#10b981' }, // emerald-500
  { name: 'Vacant', value: 2, color: '#f59e0b' },    // amber-500
  { name: 'Maintenance', value: 1, color: '#94a3b8' } // slate-400
];

const PropertyStatus = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const total = 40;

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Property Status</h2>
        <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">View All</button>
      </div>
      
      <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-8 sm:flex-row">
        {/* Donut Chart */}
        <div className="relative h-40 w-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{total}</span>
            <span className="text-xs text-gray-500 dark:text-slate-400">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <div className="flex flex-1 items-center justify-between gap-6">
                <span className="text-sm font-medium text-gray-600 dark:text-slate-300">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</span>
                  <span className="text-xs text-gray-400 dark:text-slate-500">
                    {((item.value / total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyStatus;