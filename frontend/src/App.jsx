import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import StaffLayout from './layouts/StaffLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth pages
import Login from './features/auth/pages/Login';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import ResetPassword from './features/auth/pages/ResetPassword';

// Super Admin pages
import SuperDashboard from './features/super-admin/pages/Dashboard';
import Pharmacies from './features/super-admin/pages/Pharmacies';
import SuperUsers from './features/super-admin/pages/Users';
import Analytics from './features/super-admin/pages/Analytics';

// Admin pages
import AdminDashboard from './features/admin/pages/Dashboard';
import Medicines from './features/admin/pages/Medicines';
import Suppliers from './features/admin/pages/Suppliers';
import Staff from './features/admin/pages/Staff';
import Inventory from './features/admin/pages/Inventory';
import Invoices from './features/admin/pages/Invoices';
import Payments from './features/admin/pages/Payments';
import Reports from './features/admin/pages/Reports';

// POS
import Billing from './features/pos/pages/Billing';

// Profile
import Profile from './features/profile/pages/Profile';

function App() {
  const handleLogout = () => {
    // Local logout functionality if needed
  };

  return (
    <Routes>
      {/* Auth / Public Routes */}
      <Route path="/login" element={<AuthLayout><Login onLogin={() => { }} /></AuthLayout>} />
      <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
      <Route path="/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />

      {/* Super Admin Routes */}
      <Route path="/super-admin/dashboard" element={<SuperAdminLayout onLogout={handleLogout}><SuperDashboard /></SuperAdminLayout>} />
      <Route path="/super-admin/pharmacies" element={<SuperAdminLayout><Pharmacies /></SuperAdminLayout>} />
      <Route path="/super-admin/users" element={<SuperAdminLayout><SuperUsers /></SuperAdminLayout>} />
      <Route path="/super-admin/analytics" element={<SuperAdminLayout><Analytics /></SuperAdminLayout>} />
      <Route path="/super-admin/profile" element={<SuperAdminLayout><Profile /></SuperAdminLayout>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminLayout onLogout={handleLogout}><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/medicines" element={<AdminLayout><Medicines /></AdminLayout>} />
      <Route path="/admin/suppliers" element={<AdminLayout><Suppliers /></AdminLayout>} />
      <Route path="/admin/staff" element={<AdminLayout><Staff /></AdminLayout>} />
      <Route path="/admin/inventory" element={<AdminLayout><Inventory /></AdminLayout>} />
      <Route path="/admin/invoices" element={<AdminLayout><Invoices /></AdminLayout>} />
      <Route path="/admin/payments" element={<AdminLayout><Payments /></AdminLayout>} />
      <Route path="/admin/reports" element={<AdminLayout><Reports /></AdminLayout>} />
      <Route path="/admin/profile" element={<AdminLayout><Profile /></AdminLayout>} />

      {/* Staff Routes */}
      <Route path="/staff/billing" element={<StaffLayout onLogout={handleLogout}><Billing /></StaffLayout>} />
      <Route path="/staff/invoices" element={<StaffLayout><Invoices /></StaffLayout>} />
      <Route path="/staff/profile" element={<StaffLayout><Profile /></StaffLayout>} />

      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

export default App;
