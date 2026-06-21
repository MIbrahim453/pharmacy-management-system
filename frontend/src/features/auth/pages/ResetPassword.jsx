import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, Stethoscope } from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (pw.length < 8) errs.pw = 'Password must be at least 8 characters';
    if (pw !== confirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Password reset successfully! Please sign in.');
    navigate('/login');
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Stethoscope size={18} className="text-on-primary" />
          </div>
          <span className="text-lg font-bold text-on-surface">Pharmacy OS</span>
        </div>

        <div className="card-surface p-8">
          <h1 className="text-2xl font-bold text-on-surface">Set new password</h1>
          <p className="mt-1.5 text-sm text-on-surface-variant">
            Choose a strong password for your account.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-on-surface-variant">New Password</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className={`input-base pl-10 pr-10 ${errors.pw ? 'input-error' : ''}`}
                  placeholder="Min. 8 characters"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.pw && <p className="text-xs text-red-500">{errors.pw}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-on-surface-variant">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`input-base pl-10 ${errors.confirm ? 'input-error' : ''}`}
                  placeholder="Repeat password"
                />
              </div>
              {errors.confirm && <p className="text-xs text-red-500">{errors.confirm}</p>}
            </div>

            <Button type="submit" className="w-full justify-center" loading={loading}>
              Reset Password
            </Button>
          </form>

          <Link to="/login" className="mt-4 flex items-center justify-center text-sm text-on-surface-variant hover:text-on-surface">
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
