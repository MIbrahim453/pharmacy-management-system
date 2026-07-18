import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Mail, Lock, Eye, EyeOff, Sun, Moon, Stethoscope,
  ShieldCheck, TrendingUp, Users, AlertCircle,
} from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { loginUser, clearError } from '../../../store/authSlice';
import { yupResolver, loginSchema, handleInvalidSubmit } from '../../../utils/validation';
import Button from '../../../components/ui/Button';

const FEATURES = [
  { icon: <ShieldCheck size={18} />, text: 'Role-based access control' },
  { icon: <TrendingUp size={18} />, text: 'Real-time analytics' },
  { icon: <Users size={18} />, text: 'Multi-pharmacy management' },
];

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mode, toggleTheme } = useTheme();
  const [showPw, setShowPw] = useState(false);

  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: true },
  });

  const onSubmit = async (data) => {
    dispatch(clearError());
    const result = await dispatch(loginUser({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    }));

    if (loginUser.fulfilled.match(result)) {
      const user = result.payload;
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const defaultPath =
        user.role === 'super'
          ? '/super-admin/dashboard'
          : user.role === 'admin'
          ? '/admin/dashboard'
          : '/staff/billing';
      navigate(defaultPath);
    } else {
      toast.error(result.payload || 'Invalid email or password');
    }
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
        <div className="flex items-center justify-end px-4 sm:px-6 py-4 border-b border-outline-variant/60">
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

            <form onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)} className="mt-8 space-y-4">
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
                    {...register('email')}
                    className="input-base pl-10"
                    placeholder="you@pharmacy.pk"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-error font-medium mt-1">{errors.email.message}</p>
                )}
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
                    {...register('password')}
                    className="input-base pl-10 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 hover:text-on-surface-variant"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-error font-medium mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  {...register('rememberMe')}
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/40"
                />
                <label htmlFor="remember" className="text-sm text-on-surface-variant">Remember me</label>
              </div>

              <Button type="submit" className="w-full justify-center mt-2" loading={loading} size="lg">
                Sign in
              </Button>
            </form>

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
