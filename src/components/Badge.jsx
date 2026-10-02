import { cn } from '../utils/cn';

const Badge = ({ children, status = 'default', className }) => {
  const variants = {
    'in-progress': "bg-yellow-100 text-yellow-700",
    'pending': "bg-blue-100 text-blue-700",
    'completed': "bg-emerald-100 text-emerald-700",
    'default': "bg-gray-100 text-gray-700",
  };

  return (
    <span className={cn("px-2.5 py-1 text-xs font-medium rounded-lg", variants[status], className)}>
      {children}
    </span>
  );
};

export default Badge;