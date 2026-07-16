import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkAuth, fetchMe } from './store/authSlice';
import { Toaster } from 'sonner';

// Route Protection Components
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';

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
import Purchases from './features/admin/pages/Purchases';
import Invoices from './features/admin/pages/Invoices';
import Payments from './features/admin/pages/Payments';

// POS
import Billing from './features/pos/pages/Billing';

// Profile
import Profile from './features/profile/pages/Profile';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
    if (localStorage.getItem("accessToken")) {
      dispatch(fetchMe());
    }
  }, [dispatch]);

  return (
    <>
      <Toaster richColors position="top-right" closeButton />
      <Routes>
      {/* Auth / Public Routes */}
      <Route path="/login" element={<PublicRoute><AuthLayout><Login /></AuthLayout></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><AuthLayout><ForgotPassword /></AuthLayout></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><AuthLayout><ResetPassword /></AuthLayout></PublicRoute>} />

      {/* Super Admin Routes */}
      <Route path="/super-admin/dashboard" element={<ProtectedRoute allowedRoles={['super']}><SuperAdminLayout><SuperDashboard /></SuperAdminLayout></ProtectedRoute>} />
      <Route path="/super-admin/pharmacies" element={<ProtectedRoute allowedRoles={['super']}><SuperAdminLayout><Pharmacies /></SuperAdminLayout></ProtectedRoute>} />
      <Route path="/super-admin/users" element={<ProtectedRoute allowedRoles={['super']}><SuperAdminLayout><SuperUsers /></SuperAdminLayout></ProtectedRoute>} />
      <Route path="/super-admin/analytics" element={<ProtectedRoute allowedRoles={['super']}><SuperAdminLayout><Analytics /></SuperAdminLayout></ProtectedRoute>} />
      <Route path="/super-admin/profile" element={<ProtectedRoute allowedRoles={['super']}><SuperAdminLayout><Profile /></SuperAdminLayout></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/medicines" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><Medicines /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/suppliers" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><Suppliers /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><Staff /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><Inventory /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/purchases" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><Purchases /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/invoices" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><Invoices /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><Payments /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><Profile /></AdminLayout></ProtectedRoute>} />

      {/* Staff Routes */}
      <Route path="/staff/billing" element={<ProtectedRoute allowedRoles={['staff']}><StaffLayout><Billing /></StaffLayout></ProtectedRoute>} />
      <Route path="/staff/invoices" element={<ProtectedRoute allowedRoles={['staff']}><StaffLayout><Invoices /></StaffLayout></ProtectedRoute>} />
      <Route path="/staff/profile" element={<ProtectedRoute allowedRoles={['staff']}><StaffLayout><Profile /></StaffLayout></ProtectedRoute>} />

      {/* Default Routes */}
      <Route path="/" element={<ProtectedRoute><Navigate to="/admin/dashboard" replace /></ProtectedRoute>} />
      <Route path="*" element={<ProtectedRoute><Navigate to="/admin/dashboard" replace /></ProtectedRoute>} />
    </Routes>
    </>
  );
}

export default App;
