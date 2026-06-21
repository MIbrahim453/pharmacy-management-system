import { Outlet, useLocation } from 'react-router-dom';
import { useLayoutEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';

const PAGE_META = {
  '/staff/billing': { title: 'POS Billing', crumb: 'Counter 2 · New Sale' },
  '/staff/invoices': { title: 'Invoice History', crumb: 'Staff · Operations' },
  '/staff/profile': { title: 'My Profile', crumb: 'Staff' },
};

export default function StaffLayout({ children, onLogout }) {
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] || { title: 'Staff', crumb: '' };
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  useLayoutEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggleExpand={() => setSidebarOpen(true)}
        role="staff"
        userName="Rabia Saleem"
        userEmail="staff@crescentcare.pk"
        onLogout={onLogout}
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
