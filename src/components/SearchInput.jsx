import { Search } from 'lucide-react';
import { cn } from '../utils/cn';

const SearchInput = ({ placeholder = "Search...", className, ...props }) => {
  return (
    <div className={cn("relative", className)}>
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full transition-all"
        {...props}
      />
    </div>
  );
};

export default SearchInput;