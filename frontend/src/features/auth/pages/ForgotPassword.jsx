import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Stethoscope, CheckCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    toast.success('Reset link sent! Check your inbox.');
    setLoading(false);
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

        {sent ? (
          <div className="card-surface p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/[0.12]">
                <CheckCircle size={28} className="text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-on-surface">Check your inbox</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              We sent a password reset link to <strong className="text-on-surface-variant">{email}</strong>
            </p>
            <Link to="/login" className="mt-6 btn-primary inline-flex justify-center w-full">
              Back to login
            </Link>
          </div>
        ) : (
          <div className="card-surface p-8">
            <h1 className="text-2xl font-bold text-on-surface">Reset password</h1>
            <p className="mt-1.5 text-sm text-on-surface-variant">
              Enter your email address and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              <Button type="submit" className="w-full justify-center" loading={loading}>
                Send reset link
              </Button>
            </form>
            <Link to="/login" className="mt-4 flex items-center justify-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface">
              <ArrowLeft size={14} /> Back to login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
