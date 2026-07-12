import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutGrid, Pill, Truck, Users, ShoppingCart, Receipt,
  LineChart, Building2, LogOut, Package, CreditCard,
  Stethoscope, UserCircle, X, Menu,
} from 'lucide-react';
import { initials } from '../../utils/helpers';
import api from '../../services/axios';

const NAV = {
  super: [
    {
      section: 'Platform',
      items: [
        { label: 'Dashboard', icon: LayoutGrid, to: '/super-admin/dashboard' },
        { label: 'Pharmacies', icon: Building2, to: '/super-admin/pharmacies', badge: '42' },
        { label: 'Users', icon: Users, to: '/super-admin/users' },
        { label: 'Analytics', icon: LineChart, to: '/super-admin/analytics' },
      ],
    },
    {
      section: 'Account',
      items: [
        { label: 'Profile', icon: UserCircle, to: '/super-admin/profile' },
      ],
    },
  ],
  admin: [
    {
      section: 'Manage',
      items: [
        { label: 'Dashboard', icon: LayoutGrid, to: '/admin/dashboard' },
        { label: 'Medicines', icon: Pill, to: '/admin/medicines' },
        { label: 'Suppliers', icon: Truck, to: '/admin/suppliers' },
        { label: 'Staff', icon: Users, to: '/admin/staff' },
      ],
    },
    {
      section: 'Operations',
      items: [
        { label: 'Inventory', icon: Package, to: '/admin/inventory' },
        { label: 'Purchases', icon: ShoppingCart, to: '/admin/purchases' },
        { label: 'Invoices', icon: Receipt, to: '/admin/invoices' },
        { label: 'Payments', icon: CreditCard, to: '/admin/payments' },
        { label: 'Reports', icon: LineChart, to: '/admin/reports' },
      ],
    },
    {
      section: 'Account',
      items: [
        { label: 'Profile', icon: UserCircle, to: '/admin/profile' },
      ],
    },
  ],
  staff: [
    {
      section: 'Counter',
      items: [
        { label: 'POS Billing', icon: ShoppingCart, to: '/staff/billing' },
        { label: 'Invoices', icon: Receipt, to: '/staff/invoices' },
        { label: 'Profile', icon: UserCircle, to: '/staff/profile' },
      ],
    },
  ],
};

export default function Sidebar({ open, onClose, onToggleExpand, role = 'admin', userName = 'User', userEmail = 'user@pharmacy.pk', onLogout }) {
  const navigate = useNavigate();
  const [totalPharmacies, setTotalPharmacies] = useState(null);

  useEffect(() => {
    if (role === 'super') {
      api.get('/super-admin-dashboard/dashboard-stats')
        .then((res) => {
          setTotalPharmacies(res.data.data.totalPharmacies);
        })
        .catch(() => {});
    }
  }, [role]);

  const signOut = () => {
    onLogout?.();
    navigate('/login');
  };

  const navItems = NAV[role]?.map((group) => {
    if (group.section === 'Platform') {
      return {
        ...group,
        items: group.items.map((item) => {
          if (item.label === 'Pharmacies') {
            return {
              ...item,
              badge: totalPharmacies !== null ? String(totalPharmacies) : '…',
            };
          }
          return item;
        }),
      };
    }
    return group;
  }) || [];

  const content = (isCollapsed = false) => (
    <>
      {/* Brand */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-5'} py-5 shrink-0`}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm shrink-0">
              <Stethoscope size={18} className="text-on-primary" />
            </div>
            <button onClick={onToggleExpand} className="btn-ghost p-1.5 rounded-xl text-primary hover:bg-primary/[0.08]" title="Expand sidebar">
              <Menu size={20} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm shrink-0">
                <Stethoscope size={18} className="text-on-primary" />
              </div>
              <div>
                <div className="text-[15px] font-bold text-on-surface tracking-tight">Pharmacy OS</div>
                <div className="text-xs text-on-surface-variant/70">Management System</div>
              </div>
            </div>
            {/* Close button */}
            <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg" title="Collapse sidebar">
              <X size={18} />
            </button>
          </>
        )}
      </div>

      {/* Line */}
      <div className="h-px bg-surface-container-high mx-4" />

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navItems.map(({ section, items }) => (
          <div key={section}>
            {!isCollapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/70">
                {section}
              </p>
            )}
            <div className="space-y-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={window.innerWidth < 1024 ? onClose : undefined}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `group flex items-center ${isCollapsed ? 'justify-center' : ''} gap-3 rounded-xl ${isCollapsed ? 'px-2' : 'px-3'} py-2.5 text-sm font-medium transition-all duration-150 ${isActive
                        ? 'nav-item-active'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={17} className={`shrink-0 ${isActive ? 'text-primary' : 'text-on-surface-variant/70 group-hover:text-on-surface'}`} />
                        {!isCollapsed && <span className="flex-1">{item.label}</span>}
                        {!isCollapsed && item.badge && (
                          <span className="rounded-full bg-primary/[0.12] px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User card + sign out */}
      <div className="shrink-0 border-t border-outline-variant/60 p-3">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/[0.12] text-xs font-bold text-primary">
              {initials(userName)}
            </div>
            <button onClick={signOut} className="rounded-lg p-1.5 text-on-surface-variant/70 hover:text-error hover:bg-error/[0.08] transition-colors" title="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-surface-container px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/[0.12] text-xs font-bold text-primary">
              {initials(userName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-xs font-semibold text-on-surface">{userName}</div>
              <div className="truncate text-[10px] text-on-surface-variant">{userEmail}</div>
            </div>
            <button
              onClick={signOut}
              className="shrink-0 rounded-lg p-1.5 text-on-surface-variant/70 hover:text-error hover:bg-error/[0.08] transition-colors"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar — always visible, expands/collapses width smoothly */}
      <aside className={`sidebar hidden lg:flex transition-all duration-200 ${!open ? '!w-[68px]' : 'w-64'}`}>
        {content(!open)}
      </aside>

      {/* Mobile sidebar — slides in from the left on mobile */}
      <AnimatePresence>
        {open && (
          <motion.aside
            className="sidebar flex lg:hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
          >
            {content(false)}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
