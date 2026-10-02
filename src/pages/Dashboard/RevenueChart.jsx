import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import Dropdown from '../../components/Dropdown';

const dataByPeriod = {
  'This Month': [
    { name: 'May 1',  income: 30000, expenses: 15000 },
    { name: 'May 8',  income: 40000, expenses: 20000 },
    { name: 'May 15', income: 45000, expenses: 22000 },
    { name: 'May 22', income: 50000, expenses: 25000 },
    { name: 'May 29', income: 48000, expenses: 24000 },
  ],
  'Last Month': [
    { name: 'Apr 1',  income: 25000, expenses: 12000 },
    { name: 'Apr 8',  income: 32000, expenses: 16000 },
    { name: 'Apr 15', income: 38000, expenses: 19000 },
    { name: 'Apr 22', income: 42000, expenses: 21000 },
    { name: 'Apr 29', income: 40000, expenses: 20000 },
  ],
  'This Year': [
    { name: 'Jan', income: 120000, expenses: 60000 },
    { name: 'Feb', income: 135000, expenses: 65000 },
    { name: 'Mar', income: 148000, expenses: 72000 },
    { name: 'Apr', income: 158000, expenses: 78000 },
    { name: 'May', income: 172000, expenses: 84000 },
  ],
};

const RevenueChart = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [period, setPeriod] = useState('This Month');
  const data = dataByPeriod[period] || dataByPeriod['This Month'];

  const axisColor = isDark ? '#94a3b8' : '#6b7280';
  const gridColor = isDark ? '#334155' : '#e5e7eb';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#e5e7eb';
  const tooltipText = isDark ? '#f1f5f9' : '#1f2937';
  const expenseBarColor = isDark ? '#475569' : '#e5e7eb';

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Overview</h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">
            Track your income and expenses over time.
          </p>
        </div>

        {/* 👇 Reusable Dropdown */}
        <Dropdown
          value={period}
          onChange={setPeriod}
          options={['This Month', 'Last Month', 'This Year']}
          label="Select period"
          width={176}
        />
      </div>

      <div className="mt-6 min-h-75 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}K`} />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                borderRadius: '8px',
                color: tooltipText,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              itemStyle={{ color: tooltipText }}
              cursor={{ fill: isDark ? '#334155' : '#f3f4f6', opacity: 0.4 }}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px', color: axisColor }} />
            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="expenses" name="Expenses" fill={expenseBarColor} radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;