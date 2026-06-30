import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, Stethoscope, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../../services/axios';
import { yupResolver, resetPasswordSchema } from '../../../utils/validation';
import Button from '../../../components/ui/Button';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  // If token is missing, set an error immediately
  useEffect(() => {
    if (!token) {
      setApiError('The reset token is missing. Please check your link or request a new reset link.');
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data) => {
    if (!token) {
      setApiError('Missing reset token. Cannot reset password.');
      return;
    }

    setLoading(true);
    setApiError('');
    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        password: data.password,
      });

      setSuccess(true);
      toast.success(response.data?.message || 'Password reset successfully!');
      
      // Delay navigation slightly so user sees success screen/toast
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to reset password';
      setApiError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Stethoscope size={18} className="text-on-primary" />
          </div>
          <span className="text-lg font-bold text-on-surface">Pharmacy OS</span>
        </div>

        {success ? (
          <div className="card-surface p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/[0.12]">
                <CheckCircle2 size={28} className="text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-on-surface">Password updated</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Your password has been reset successfully. Redirecting you to the sign-in page...
            </p>
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          </div>
        ) : (
          <div className="card-surface p-8">
            <h1 className="text-2xl font-bold text-on-surface">Set new password</h1>
            <p className="mt-1.5 text-sm text-on-surface-variant">
              Choose a strong password for your account.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              {apiError && (
                <div className="flex items-start gap-2 rounded-xl bg-error/[0.08] border border-error/30 p-3 text-xs text-error">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span className="break-words">{apiError}</span>
                </div>
              )}

              {/* Only show password inputs if we have a token */}
              {token ? (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-on-surface-variant">New Password</label>
                    <div className="relative">
                      <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70" />
                      <input
                        type={showPw ? 'text' : 'password'}
                        {...register('password')}
                        className={`input-base pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                        placeholder="Min. 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 hover:text-on-surface"
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-error font-medium mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-on-surface-variant">Confirm Password</label>
                    <div className="relative">
                      <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70" />
                      <input
                        type="password"
                        {...register('confirmPassword')}
                        className={`input-base pl-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                        placeholder="Repeat password"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-error font-medium mt-1">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full justify-center mt-2" loading={loading}>
                    Reset Password
                  </Button>
                </>
              ) : (
                <div className="mt-4">
                  <Link to="/forgot-password" className="btn-primary w-full justify-center flex">
                    Request a new link
                  </Link>
                </div>
              )}
            </form>

            <Link to="/login" className="mt-6 flex items-center justify-center text-sm text-on-surface-variant hover:text-on-surface">
              Back to login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
