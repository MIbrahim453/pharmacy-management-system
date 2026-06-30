import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useTheme } from '../../hooks/useTheme';
import { initials } from '../../utils/helpers';

export default function Header({ title, crumb }) {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useTheme();
  const { user } = useSelector((state) => state.auth);

  const profilePath =
    user?.role === 'super'
      ? '/super-admin/profile'
      : user?.role === 'admin'
      ? '/admin/profile'
      : '/staff/profile';

  return (
    <header className="app-header sticky top-0 z-20 flex h-16 items-center gap-3 px-4 sm:px-6 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/80">
      {/* Title area */}
      <div className="flex-1 min-w-0">
        {crumb && (
          <p className="text-xs text-on-surface-variant/70 truncate">{crumb}</p>
        )}
        <h1 className="text-base font-semibold text-on-surface leading-tight truncate">{title}</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        <button
          onClick={toggleTheme}
          className="btn-ghost p-2 rounded-xl"
          title={mode === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          {mode === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button className="relative btn-ghost p-2 rounded-xl hidden sm:inline-flex" title="Notifications">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error ring-2 ring-surface" />
        </button>

        <button
          onClick={() => navigate(profilePath)}
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/[0.12] text-xs font-bold text-primary cursor-pointer hover:bg-primary/[0.18] transition-colors"
          title="My profile"
        >
          {initials(user?.name || 'User')}
        </button>
      </div>
    </header>
  );
}
