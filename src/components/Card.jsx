import { cn } from '../utils/cn';

const Card = ({ children, className }) => {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-100 shadow-sm p-6", className)}>
      {children}
    </div>
  );
};

export default Card;