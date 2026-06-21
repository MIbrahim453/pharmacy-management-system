import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Mail, Lock, Eye, EyeOff, Sun, Moon, Stethoscope,
  ShieldCheck, TrendingUp, Users, AlertCircle, Copy,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeProvider';
import Button from '../../../components/ui/Button';

const FEATURES = [
  { icon: <ShieldCheck size={18} />, text: 'Role-based access control' },
  { icon: <TrendingUp size={18} />, text: 'Real-time analytics' },
  { icon: <Users size={18} />, text: 'Multi-pharmacy management' },
];

const DEMO_ACCOUNTS = [
  {
    role: 'super',
    label: 'Super Admin',
    email: 'superadmin@apothex.app',
    password: 'Super@123',
    user: { name: 'Ibrahim Qureshi', email: 'superadmin@apothex.app', pharmacy: 'Platform' },
  },
  {
    role: 'admin',
    label: 'Admin',
    email: 'admin@crescentcare.pk',
    password: 'Admin@123',
    user: { name: 'Ayesha Khan', email: 'admin@crescentcare.pk', pharmacy: 'Crescent Care Pharmacy' },
  },
  {
    role: 'staff',
    label: 'Staff',
    email: 'staff@crescentcare.pk',
    password: 'Staff@123',
    user: { name: 'Rabia Saleem', email: 'staff@crescentcare.pk', pharmacy: 'Crescent Care Pharmacy' },
  },
];

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useTheme();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  const fillCredentials = (account) => {
    setEmail(account.email);
    setPw(account.password);
    setError('');
  };

  const signIn = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const account = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === pw,
    );

    if (!account) {
      setError('Invalid email or password. Use one of the demo credentials below.');
      setLoading(false);
      return;
    }

    onLogin(account.role);
    toast.success(`Welcome back, ${account.user.name.split(' ')[0]}!`);
    navigate(account.role === 'super' ? '/super-admin/dashboard' : account.role === 'admin' ? '/admin/dashboard' : '/staff/billing');
    setLoading(false);
  };

  return (
    <div className="min-h-dvh flex">
      {/* Left panel – brand (fixed dark palette, not theme-reactive) */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col relative overflow-hidden bg-gradient-to-br from-[#004f35] via-[#00311f] to-[#0f1511]">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-16 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Stethoscope size={20} className="text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">Pharmacy OS</div>
              <div className="text-xs text-white/70">Management System</div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center mt-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="text-3xl font-bold text-white leading-snug">
                Every shelf, every sale,<br />accounted for.
              </h2>
              <p className="mt-4 text-white/70 text-sm leading-relaxed max-w-xs">
                Real-time inventory, expiry monitoring, fast POS billing and clear reporting — for one counter or forty branches.
              </p>
            </motion.div>

            <motion.div className="mt-10 space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-white/80">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    {f.icon}
                  </div>
                  {f.text}
                </div>
              ))}
            </motion.div>

            <motion.div className="mt-12 grid grid-cols-3 gap-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              {[['42', 'Pharmacies'], ['1.2M', 'Items tracked'], ['99.9%', 'Uptime']].map(([n, l]) => (
                <div key={l} className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 text-center">
                  <div className="text-xl font-bold text-white">{n}</div>
                  <div className="text-xs text-white/70 mt-0.5">{l}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex flex-col min-h-dvh">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-outline-variant/60">
          <span className="text-sm text-on-surface-variant">
            New to Pharmacy OS?{' '}
            <button className="text-primary font-medium hover:underline">Request access</button>
          </span>
          <button onClick={toggleTheme} className="btn-ghost p-2 rounded-xl">
            {mode === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Stethoscope size={18} className="text-on-primary" />
              </div>
              <span className="text-lg font-bold text-on-surface">Pharmacy OS</span>
            </div>

            <h1 className="text-2xl font-bold text-on-surface">Welcome back</h1>
            <p className="mt-1.5 text-sm text-on-surface-variant">
              Sign in to your Pharmacy OS workspace.
            </p>

            <form onSubmit={signIn} className="mt-8 space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-error/[0.08] border border-error/30 p-3 text-xs text-error">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-on-surface-variant">Email</label>
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-base pl-10"
                    placeholder="you@pharmacy.pk"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-on-surface-variant">Password</label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    className="input-base pl-10 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 hover:text-on-surface-variant"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" defaultChecked className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/40" />
                <label htmlFor="remember" className="text-sm text-on-surface-variant">Remember me</label>
              </div>

              <Button type="submit" className="w-full justify-center" loading={loading} size="lg">
                Sign in
              </Button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-surface px-3 text-on-surface-variant/70">or continue with</span>
                </div>
              </div>

              <button type="button" className="btn-secondary w-full justify-center gap-2.5">
                <svg width="16" height="16" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.8 6c1.9-5.6 7.1-9.8 13.6-9.8z" />
                  <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.1 5.3-4.6 6.9l7.1 5.5c4.2-3.9 6.6-9.6 6.6-16.9z" />
                  <path fill="#FBBC05" d="M10.4 28.3c-.5-1.4-.8-2.9-.8-4.3s.3-3 .8-4.3l-7.8-6C1 16.9 0 20.3 0 24s1 7.1 2.6 10.3l7.8-6z" />
                  <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.5l-7.1-5.5c-2 1.4-4.6 2.2-8.2 2.2-6.5 0-11.7-4.2-13.6-9.8l-7.8 6C6.5 42.6 14.6 48 24 48z" />
                </svg>
                Sign in with Google
              </button>
            </form>

            {/* Demo credentials reference */}
            <div className="mt-8">
              <p className="text-center text-xs text-on-surface-variant/70 mb-3">
                Demo credentials — tap a role to autofill
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((a) => (
                  <button
                    key={a.role}
                    type="button"
                    onClick={() => fillCredentials(a)}
                    className="group flex flex-col items-start gap-1 rounded-xl border border-outline-variant p-3 text-left hover:border-primary/40 hover:bg-primary/[0.08] transition-all"
                  >
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-on-surface">
                      {a.label}
                      <Copy size={11} className="text-on-surface-variant/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <span className="text-[10px] text-on-surface-variant break-all">{a.email}</span>
                    <span className="text-[10px] text-on-surface-variant/70 font-mono">{a.password}</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-on-surface-variant/70 leading-relaxed">
              Accounts are provisioned by your administrator.<br />
              You'll be routed automatically based on your role.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
