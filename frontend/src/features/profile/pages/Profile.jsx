import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { User as UserIcon, Mail, Lock, Save, Camera } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import api from '../../../services/axios';
import { updateProfile } from '../../../store/authSlice';
import { yupResolver, profileSchema, changePasswordSchema } from '../../../utils/validation';

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function Profile() {
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.auth.user);

  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);

  // Profile Form configuration
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: { name: '', email: '' },
  });

  // Password Form configuration
  const {
    register: registerPw,
    handleSubmit: handleSubmitPw,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: { current: '', next: '', confirm: '' },
  });

  // Sync state from redux on load
  useEffect(() => {
    if (reduxUser) {
      resetProfile({ name: reduxUser.name, email: reduxUser.email });
    }
  }, [reduxUser, resetProfile]);

  // Fetch fresh user data from API on mount
  useEffect(() => {
    const fetchFreshUser = async () => {
      try {
        const response = await api.get('/auth/me');
        const userData = response.data.data;
        resetProfile({ name: userData.name, email: userData.email });
      } catch (error) {
        console.error('Failed to fetch latest user info:', error);
      }
    };
    fetchFreshUser();
  }, [resetProfile]);

  const saveProfile = async (data) => {
    setSaving(true);
    try {
      const result = await dispatch(updateProfile({ name: data.name, email: data.email }));
      if (updateProfile.fulfilled.match(result)) {
        toast.success('Profile updated successfully');
      } else {
        toast.error(result.payload || 'Failed to update profile');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePasswordSubmit = async (data) => {
    setPwSaving(true);
    try {
      const response = await api.post('/auth/change-password', {
        oldPassword: data.current,
        newPassword: data.next,
      });
      toast.success(response.data?.message || 'Password changed successfully!');
      resetPw({ current: '', next: '', confirm: '' });
      setShowChangePw(false);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to change password';
      toast.error(message);
    } finally {
      setPwSaving(false);
    }
  };

  const formatRole = (role) => {
    if (role === 'super') return 'Super Admin';
    if (role === 'admin') return 'Admin';
    if (role === 'staff') return 'Staff';
    return role || 'User';
  };

  // Generate dynamic profile detail rows
  const profileDetails = [];
  // Only add Pharmacy if user is NOT super admin
  if (reduxUser?.role !== 'super') {
    profileDetails.push(['Pharmacy', reduxUser?.pharmacyName || 'N/A']);
  }
  profileDetails.push(['Role', formatRole(reduxUser?.role)]);
  profileDetails.push(['Status', 'Active']);

  return (
    <>
      <PageHeader title="My Profile" subtitle="Manage your account settings and password." />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Avatar card */}
        <Card>
          <CardBody className="flex flex-col items-center text-center py-8">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/[0.12] text-2xl font-bold text-primary">
                {initials(reduxUser?.name || 'User')}
              </div>
              <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-sm">
                <Camera size={13} />
              </button>
            </div>
            <div className="mt-4">
              <div className="text-base font-bold text-on-surface">{reduxUser?.name || 'User'}</div>
              <div className="text-sm text-on-surface-variant mt-0.5">{reduxUser?.email || ''}</div>
              <Badge variant="primary" className="mt-2">{formatRole(reduxUser?.role)}</Badge>
            </div>
            <div className="mt-6 w-full space-y-2 text-sm">
              {profileDetails.map(([k, v]) => (
                <div key={k} className="flex justify-between border-t border-outline-variant/60 pt-2">
                  <span className="text-on-surface-variant">{k}</span>
                  <span className="font-medium text-on-surface">{v}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <div className="xl:col-span-2 space-y-5">
          {/* Profile form */}
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardBody>
              <form onSubmit={handleSubmitProfile(saveProfile)} className="space-y-4">
                <Input
                  label="Full name"
                  {...registerProfile('name')}
                  prefix={<UserIcon size={16} />}
                  error={profileErrors.name?.message}
                />
                <Input
                  label="Email address"
                  type="email"
                  {...registerProfile('email')}
                  prefix={<Mail size={16} />}
                  error={profileErrors.email?.message}
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" loading={saving} icon={<Save size={15} />}>Save changes</Button>
                </div>
              </form>
            </CardBody>
          </Card>

          {/* Password form */}
          <Card>
            <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
            <CardBody>
              {!showChangePw ? (
                <div className="py-2">
                  <p className="text-sm text-on-surface-variant mb-4">
                    Protect your account by using a unique password that is updated periodically.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setShowChangePw(true)}
                    icon={<Lock size={15} />}
                  >
                    Change Password
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitPw(handleChangePasswordSubmit)} className="space-y-4">
                  <Input
                    label="Current password"
                    type="password"
                    {...registerPw('current')}
                    prefix={<Lock size={16} />}
                    placeholder="••••••••"
                    error={pwErrors.current?.message}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="New password"
                      type="password"
                      {...registerPw('next')}
                      placeholder="Min. 6 characters"
                      error={pwErrors.next?.message}
                    />
                    <Input
                      label="Confirm password"
                      type="password"
                      {...registerPw('confirm')}
                      placeholder="Repeat new password"
                      error={pwErrors.confirm?.message}
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowChangePw(false);
                        resetPw({ current: '', next: '', confirm: '' });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" loading={pwSaving} icon={<Lock size={15} />}>
                      Update password
                    </Button>
                  </div>
                </form>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
