import { Outlet } from 'react-router-dom';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-background via-surface-container-lowest to-primary-container/[0.08]">
      {children || <Outlet />}
    </div>
  );
}
