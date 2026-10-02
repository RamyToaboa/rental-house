import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from "./pages/Dashboard/index";
import PropertiesPage from './pages/Properties/PropertiesPage';
import PropertyDetailPage from './pages/Properties/PropertyDetailPage';
import TenantsPage from './pages/Tenants/TenantsPage';
import LeasesPage from './pages/Leases/LeasesPage';
import PaymentsPage from './pages/Payments/PaymentsPage';
import MaintenancePage from './pages/Maintenance/MaintenancePage';
// import MessagesPage from './pages/Messages/MessagesPage';
import ReportsPage from './pages/Reports/ReportsPage';
// import DocumentsPage from './pages/Documents/DocumentsPage';
// import SettingsPage from './pages/Settings/SettingsPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/tenants" element={<TenantsPage />} />
          <Route path="/leases" element={<LeasesPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          {/* <Route path="/messages" element={<MessagesPage />} /> */}
          <Route path="/reports" element={<ReportsPage />} />
          {/* <Route path="/documents" element={<DocumentsPage />} /> */}
          {/* <Route path="/settings" element={<SettingsPage />} /> */}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;