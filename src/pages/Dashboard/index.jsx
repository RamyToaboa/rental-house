// src/pages/Dashboard/index.jsx
import StatsOverview from './StatsOverview';
import RevenueChart from './RevenueChart';
import UpcomingPayments from './UpcomingPayments';
import PropertyStatus from './PropertyStatus';
import MaintenanceRequests from './MaintenanceRequests';
import RecentActivity from './RecentActivity';

const DashboardPage = () => {
  return (
    // 👇 Added h-full so it fills the main space
    <div className="h-full space-y-6">
      <StatsOverview />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <UpcomingPayments />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PropertyStatus />
        <MaintenanceRequests />
        <RecentActivity />
      </div>
    </div>
  );
};

export default DashboardPage;