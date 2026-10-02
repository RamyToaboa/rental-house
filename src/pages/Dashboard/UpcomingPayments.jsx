import React from 'react';
import { ArrowRight } from 'lucide-react';

const payments = [
  { id: 1, property: 'Modern Downtown Loft', tenant: 'Sarah Johnson', amount: '$2,500', due: 'Due in 3 days', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=100&h=100&fit=crop' },
  { id: 2, property: 'Lakeside Villa', tenant: 'Michael Brown', amount: '$2,850', due: 'Due in 5 days', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=100&h=100&fit=crop' },
  { id: 3, property: 'Urban Penthouse', tenant: 'Emily Davis', amount: '$3,500', due: 'Due in 7 days', image: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=100&h=100&fit=crop' },
  { id: 4, property: 'Suburban Smart Home', tenant: 'David Wilson', amount: '$2,200', due: 'Due in 10 days', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100&h=100&fit=crop' },
];

const UpcomingPayments = () => {
  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Payments</h2>
        <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">View All</button>
      </div>
      
      <div className="mt-6 flex-1 space-y-5">
        {payments.map((item) => (
          <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0 dark:border-slate-800/60">
            <div className="flex items-center gap-3">
              <img 
                src={item.image} 
                alt={item.property} 
                className="h-12 w-12 rounded-lg object-cover" 
              />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.property}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{item.tenant}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{item.amount}</p>
              <p className="text-xs font-medium text-orange-500 dark:text-orange-400">{item.due}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-50 dark:border-slate-800/60">
        <button className="flex w-full items-center justify-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
          View All Payments <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default UpcomingPayments;