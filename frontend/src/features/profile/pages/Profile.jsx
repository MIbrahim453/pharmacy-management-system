import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User as UserIcon, Mail, Lock, Save, Percent, ShieldAlert, AlertTriangle, Trash2 } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import api from '../../../services/axios';
import { updateProfile, logoutUser } from '../../../store/authSlice';
import DemoModal from '../../../components/common/DemoModal';
import { yupResolver, profileSchema, changePasswordSchema, pharmacySettingsSchema, pharmacyDetailsSchema, handleInvalidSubmit } from '../../../utils/validation';

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.auth.user);

  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pharmacySaving, setPharmacySaving] = useState(false);
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pharmacy, setPharmacy] = useState(null);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoAction, setDemoAction] = useState('');

  const isDemoAccount = reduxUser?.role === 'admin' || reduxUser?.role === 'staff';
  const canDeleteAccount = reduxUser?.role === 'admin' || reduxUser?.role === 'staff';

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

  // Pharmacy Settings Form configuration
  const {
    register: registerSettings,
    handleSubmit: handleSubmitSettings,
    reset: resetSettings,
    formState: { errors: settingsErrors },
  } = useForm({
    resolver: yupResolver(pharmacySettingsSchema),
    defaultValues: { discount: '0', lowStockThreshold: '20', criticalStockThreshold: '10' },
  });

  // Pharmacy Details Form configuration
  const {
    register: registerDetails,
    handleSubmit: handleSubmitDetails,
    reset: resetDetails,
    formState: { errors: detailsErrors },
  } = useForm({
    resolver: yupResolver(pharmacyDetailsSchema),
    defaultValues: { pharmacyEmail: '', phone: '', address: '', totalStaff: '' },
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
        if (userData.pharmacyId) {
          setPharmacy(userData.pharmacyId);
          resetSettings({
            discount: String(userData.pharmacyId.discount ?? 0),
            lowStockThreshold: String(userData.pharmacyId.lowStockThreshold ?? 20),
            criticalStockThreshold: String(userData.pharmacyId.criticalStockThreshold ?? 10),
          });
          resetDetails({
            pharmacyEmail: userData.pharmacyId.pharmacyEmail ?? '',
            phone: userData.pharmacyId.phone ?? '',
            address: userData.pharmacyId.address ?? '',
            totalStaff: userData.pharmacyId.totalStaff !== undefined ? String(userData.pharmacyId.totalStaff) : '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch latest user info:', error);
      }
    };
    fetchFreshUser();
  }, [resetProfile, resetSettings, resetDetails]);

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

  const savePharmacySettings = async (data) => {
    setPharmacySaving(true);
    try {
      const response = await api.put('/admin-profile/pharmacy-settings', {
        discount: Number(data.discount),
        lowStockThreshold: Number(data.lowStockThreshold),
        criticalStockThreshold: Number(data.criticalStockThreshold),
      });
      toast.success('Pharmacy settings updated successfully');
      setPharmacy(response.data?.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update pharmacy settings');
    } finally {
      setPharmacySaving(false);
    }
  };

  const savePharmacyDetails = async (data) => {
    setDetailsSaving(true);
    try {
      const response = await api.put('/admin-profile/pharmacy-detail', {
        pharmacyEmail: data.pharmacyEmail,
        phone: data.phone,
        address: data.address,
        totalStaff: data.totalStaff !== undefined && data.totalStaff !== '' ? Number(data.totalStaff) : null,
      });
      toast.success('Pharmacy details updated successfully');
      setPharmacy(response.data?.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update pharmacy details');
    } finally {
      setDetailsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const response = await api.delete('/auth/profile');
      toast.success(response.data?.message || 'Account deleted successfully');
      setDeleteConfirmOpen(false);
      await dispatch(logoutUser());
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
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
    profileDetails.push(['Pharmacy', pharmacy?.pharmacyName || reduxUser?.pharmacyName || 'N/A']);
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
              <form onSubmit={handleSubmitProfile(saveProfile, handleInvalidSubmit)} className="space-y-4">
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

          {/* Pharmacy Details Form (Only visible to admin) */}
          {reduxUser?.role === 'admin' && (
            <Card>
              <CardHeader><CardTitle>Pharmacy Details</CardTitle></CardHeader>
              <CardBody>
                <form onSubmit={handleSubmitDetails(savePharmacyDetails, handleInvalidSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Pharmacy Email"
                      type="email"
                      {...registerDetails('pharmacyEmail')}
                      prefix={<Mail size={16} />}
                      error={detailsErrors.pharmacyEmail?.message}
                    />
                    <Input
                      label="Pharmacy Phone"
                      type="text"
                      {...registerDetails('phone')}
                      error={detailsErrors.phone?.message}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Pharmacy Address"
                      type="text"
                      {...registerDetails('address')}
                      error={detailsErrors.address?.message}
                    />
                    <Input
                      label="Total Staff Count (Optional)"
                      type="number"
                      {...registerDetails('totalStaff')}
                      error={detailsErrors.totalStaff?.message}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" loading={detailsSaving} icon={<Save size={15} />}>Save details</Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

          {/* Pharmacy Settings Form (Only visible to admin) */}
          {reduxUser?.role === 'admin' && (
            <Card>
              <CardHeader><CardTitle>Pharmacy Settings</CardTitle></CardHeader>
              <CardBody>
                <form onSubmit={handleSubmitSettings(savePharmacySettings, handleInvalidSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Default Discount (%)"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      prefix={<Percent size={15} />}
                      {...registerSettings('discount')}
                      error={settingsErrors.discount?.message}
                    />
                    <Input
                      label="Low Stock Threshold"
                      type="number"
                      min="0"
                      prefix={<AlertTriangle size={15} />}
                      {...registerSettings('lowStockThreshold')}
                      error={settingsErrors.lowStockThreshold?.message}
                    />
                    <Input
                      label="Critical Stock Threshold"
                      type="number"
                      min="0"
                      prefix={<ShieldAlert size={15} />}
                      {...registerSettings('criticalStockThreshold')}
                      error={settingsErrors.criticalStockThreshold?.message}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" loading={pharmacySaving} icon={<Save size={15} />}>Save settings</Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

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
                    onClick={() => {
                      if (isDemoAccount) {
                        setDemoAction('Changing password');
                        setDemoModalOpen(true);
                      } else {
                        setShowChangePw(true);
                      }
                    }}
                    icon={<Lock size={15} />}
                  >
                    Change Password
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitPw(handleChangePasswordSubmit, handleInvalidSubmit)} className="space-y-4">
                  <Input
                    label="Current password"
                    type="password"
                    {...registerPw('current')}
                    prefix={<Lock size={16} />}
                    placeholder="Enter current password"
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

              {canDeleteAccount && (
                <div className="mt-6 rounded-2xl border border-error/30 bg-error/[0.06] p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-error">Delete account</div>
                      <p className="mt-1 text-sm text-on-surface-variant max-w-xl">
                        Permanently delete your account and end access to this workspace. This action cannot be undone.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      icon={<Trash2 size={15} />}
                      onClick={() => {
                        if (isDemoAccount) {
                          setDemoAction('Deleting account');
                          setDemoModalOpen(true);
                        } else {
                          setDeleteConfirmOpen(true);
                        }
                      }}
                    >
                      Delete account
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Account"
        subtitle="This action is permanent and cannot be undone."
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount} loading={deleting} icon={<Trash2 size={15} />}>
              Delete account
            </Button>
          </div>
        }
      >
        <div className="p-6 space-y-3">
          <p className="text-sm text-on-surface-variant">
            Are you sure you want to permanently delete your account?
          </p>
          <p className="text-sm text-on-surface-variant">
            You will be signed out immediately after deletion.
          </p>
        </div>
      </Modal>

      <DemoModal
        open={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        actionName={demoAction}
      />
    </>
  );
}
