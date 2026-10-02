import { ArrowUpRight } from 'lucide-react';
import Card from './Card';

const StatCard = ({ title, value, change, icon: Icon, iconBg, iconColor }) => {
  return (
    <Card className="flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
        </div>
        {Icon && (
          <div className={`${iconBg} p-3 rounded-xl`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        )}
      </div>
      
      {change && (
        <div className="flex items-center gap-1 mt-4 text-sm">
          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold text-emerald-500">{change}</span>
          <span className="text-gray-400 ml-1">from last month</span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;