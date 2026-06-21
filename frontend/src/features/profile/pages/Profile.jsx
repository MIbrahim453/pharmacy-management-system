import { useState } from 'react';
import { toast } from 'sonner';
import { User, Mail, Lock, Save, Camera } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

// TODO: Replace with API call — GET /api/auth/me
const MOCK_USER = {
  name: 'Ahmed Raza',
  email: 'admin@medpoint.pk',
  pharmacy: 'MedPoint Pharmacy',
  role: 'Admin',
};

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function Profile() {
  const [user, setUser] = useState(MOCK_USER);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const field = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const pwField = (k, v) => setPwForm((f) => ({ ...f, [k]: v }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    // TODO: Replace with API call — PUT /api/auth/profile
    setUser((u) => ({ ...u, ...form }));
    toast.success('Profile updated successfully');
    setSaving(false);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.next.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setPwSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    // TODO: Replace with API call — PUT /api/auth/change-password
    toast.success('Password changed successfully');
    setPwForm({ current: '', next: '', confirm: '' });
    setPwSaving(false);
  };

  return (
    <>
      <PageHeader title="My Profile" subtitle="Manage your account settings and password." />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Avatar card */}
        <Card>
          <CardBody className="flex flex-col items-center text-center py-8">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/[0.12] text-2xl font-bold text-primary">
                {initials(user.name)}
              </div>
              <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-sm">
                <Camera size={13} />
              </button>
            </div>
            <div className="mt-4">
              <div className="text-base font-bold text-on-surface">{user.name}</div>
              <div className="text-sm text-on-surface-variant mt-0.5">{user.email}</div>
              <Badge variant="primary" className="mt-2">{user.role}</Badge>
            </div>
            <div className="mt-6 w-full space-y-2 text-sm">
              {[
                ['Pharmacy', user.pharmacy],
                ['Role', user.role],
                ['Status', 'Active'],
              ].map(([k, v]) => (
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
              <form onSubmit={saveProfile} className="space-y-4">
                <Input label="Full name" value={form.name} onChange={(e) => field('name', e.target.value)} prefix={<User size={16} />} />
                <Input label="Email address" type="email" value={form.email} onChange={(e) => field('email', e.target.value)} prefix={<Mail size={16} />} />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" loading={saving} icon={<Save size={15} />}>Save changes</Button>
                </div>
              </form>
            </CardBody>
          </Card>

          {/* Password form */}
          <Card>
            <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
            <CardBody>
              <form onSubmit={changePassword} className="space-y-4">
                <Input label="Current password" type="password" value={pwForm.current} onChange={(e) => pwField('current', e.target.value)} prefix={<Lock size={16} />} placeholder="••••••••" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="New password" type="password" value={pwForm.next} onChange={(e) => pwField('next', e.target.value)} placeholder="Min. 8 characters" />
                  <Input label="Confirm password" type="password" value={pwForm.confirm} onChange={(e) => pwField('confirm', e.target.value)} placeholder="Repeat new password" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" size="sm" loading={pwSaving} icon={<Lock size={15} />}>Update password</Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
