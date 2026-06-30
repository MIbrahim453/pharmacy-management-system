import { Outlet, useLocation } from 'react-router-dom';
import { useLayoutEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';

const PAGE_META = {
  '/admin/dashboard':  { title: 'Dashboard',   crumb: 'Crescent Care Pharmacy' },
  '/admin/medicines':  { title: 'Medicines',    crumb: 'Admin · Manage' },
  '/admin/suppliers':  { title: 'Suppliers',    crumb: 'Admin · Manage' },
  '/admin/staff':      { title: 'Staff',        crumb: 'Admin · Manage' },
  '/admin/inventory':  { title: 'Inventory',    crumb: 'Admin · Operations' },
  '/admin/invoices':   { title: 'Invoices',     crumb: 'Admin · Operations' },
  '/admin/payments':   { title: 'Payments',     crumb: 'Admin · Operations' },
  '/admin/reports':    { title: 'Reports',      crumb: 'Admin · Operations' },
  '/admin/profile':    { title: 'Profile',      crumb: 'Admin' },
};

export default function AdminLayout({ children }) {
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] || { title: 'Admin', crumb: '' };
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useLayoutEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggleExpand={() => setSidebarOpen(true)}
        role="admin"
        userName={user?.name || "Admin"}
        userEmail={user?.email || ""}
        onLogout={handleLogout}
      />
      <div className={`app-shell transition-all duration-200 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-[68px]'}`}>
        <Header title={meta.title} crumb={meta.crumb} />
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            className="p-4 sm:p-6 max-w-screen-2xl mx-auto"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {children || <Outlet />}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
