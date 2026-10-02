import Button from './Button';

const SectionHeader = ({ title, onViewAll }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      {onViewAll && (
        <Button variant="outline" size="sm" onClick={onViewAll}>
          View All
        </Button>
      )}
    </div>
  );
};

export default SectionHeader;