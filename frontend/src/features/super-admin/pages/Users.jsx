import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { Users as UsersIcon, Calendar, Mail, Shield, MapPin, Award, UserCheck, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../../components/common/PageHeader';
import SearchBar from '../../../components/common/SearchBar';
import { Card } from '../../../components/ui/Card';
import { Table, Th, Td, TableEmpty } from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Select from '../../../components/ui/Select';
import Pagination from '../../../components/ui/Pagination';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { initials } from '../../../utils/helpers';
import api from '../../../services/axios';
import { userStatusSchema } from '../../../utils/validation';

const PER_PAGE = 10;
const ROLE_FILTERS = ['All', 'Super Admin', 'Admin', 'Staff'];

const roleMap = {
  'All': 'all',
  'Super Admin': 'super_admin',
  'Admin': 'admin',
  'Staff': 'staff',
};

const displayRole = (roleKey) => {
  if (roleKey === 'super_admin') return 'Super Admin';
  if (roleKey === 'admin') return 'Admin';
  if (roleKey === 'staff') return 'Staff';
  return roleKey || 'N/A';
};

function timeAgo(date) {
  if (!date) return 'Never';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  if (diffMs < 0) return 'Just now';
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} hr${diffHrs > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function UsersPage() {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [query, setQuery] = useState('');
  const [roleF, setRoleF] = useState('All');
  const [page, setPage] = useState(1);
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // View modal state
  const [viewOpen, setViewOpen] = useState(false);
  const [viewUserId, setViewUserId] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/super-admin-users/all-users', {
        params: {
          searchTerm: query,
          role: roleMap[roleF],
          page,
          limit: PER_PAGE,
          order: 'desc',
        },
      });
      setList(res.data.data.users || []);
      setTotal(res.data.data.total || 0);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [query, roleF, page]);

  useEffect(() => {
    if (!viewUserId) return;
    const fetchUserDetails = async () => {
      setViewLoading(true);
      try {
        const res = await api.get(`/super-admin-users/view-user/${viewUserId}`);
        setViewUser(res.data.data);
      } catch (err) {
        toast.error('Failed to load user details');
        setViewOpen(false);
      } finally {
        setViewLoading(false);
      }
    };
    fetchUserDetails();
  }, [viewUserId]);

  const handleOpenView = (userId) => {
    setViewUser(null);
    setViewUserId(userId);
    setViewOpen(true);
  };

  const handleStatusChange = async (userId, newStatus) => {
    if (currentUser?._id === userId || currentUser?.id === userId) {
      toast.error('You cannot change your own account status');
      return;
    }
    try {
      await userStatusSchema.validate({ status: newStatus });
      await api.put(`/super-admin-users/change-status/${userId}`, { status: newStatus });
      toast.success('User status updated successfully');
      setViewUser((prev) => (prev ? { ...prev, status: newStatus } : null));
      setList((prevList) =>
        prevList.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      toast.error(err.message || err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <>
      <PageHeader
        title="Users"
        subtitle={`${total} accounts across all pharmacies`}
      />

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-outline-variant/60">
          <SearchBar
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search users by name or email…"
            className="w-full sm:flex-1 sm:max-w-xs"
          />
          <Select
            value={roleF}
            onChange={(e) => {
              setRoleF(e.target.value);
              setPage(1);
            }}
            options={ROLE_FILTERS}
            className="w-full sm:w-36 h-9 text-sm"
          />
        </div>

        <Table>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Pharmacy</Th>
              <Th>Last active</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="text-sm text-on-surface-variant font-medium">Loading users…</span>
                  </div>
                </td>
              </tr>
            ) : list.length === 0 ? (
              <TableEmpty cols={6} message="No users found" icon={<UsersIcon size={32} />} />
            ) : (
              list.map((u, i) => (
                <motion.tr
                  key={u._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-on-surface-variant text-xs font-bold">
                        {initials(u.name)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-on-surface">{u.name}</div>
                        <div className="text-xs text-on-surface-variant">{u.email}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Badge
                      variant={
                        u.role === 'super_admin'
                          ? 'danger'
                          : u.role === 'admin'
                          ? 'primary'
                          : 'default'
                      }
                    >
                      {displayRole(u.role)}
                    </Badge>
                  </Td>
                  <Td className="text-sm text-on-surface-variant">
                    {u.pharmacyName || 'Platform'}
                  </Td>
                  <Td className="text-xs text-on-surface-variant">{timeAgo(u.lastActive)}</Td>
                  <Td>
                    <Badge status={u.status} dot />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenView(u._id)}
                        className="btn-ghost px-2.5 py-1 text-xs rounded-lg font-medium text-primary hover:bg-primary/[0.08]"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleStatusChange(u._id, u.status === 'active' ? 'suspended' : 'active')}
                        disabled={currentUser?._id === u._id || currentUser?.id === u._id}
                        className={`btn-ghost px-2.5 py-1 text-xs rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                          u.status === 'active'
                            ? 'text-warning hover:bg-warning/[0.08]'
                            : 'text-success hover:bg-success/[0.08]'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </Td>
                </motion.tr>
              ))
            )}
          </tbody>
        </Table>

        <div className="px-5 py-4 border-t border-outline-variant/60">
          <Pagination
            page={page}
            total={total}
            perPage={PER_PAGE}
            onChange={setPage}
          />
        </div>
      </Card>

      {/* User Details View Modal */}
      <Modal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title="User Account Details"
        subtitle="Full diagnostic view of the user profile and permissions."
        size="md"
      >
        {viewLoading || !viewUser ? (
          <div className="flex flex-col h-64 items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-sm text-on-surface-variant font-medium">Loading user profile details…</span>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Header info */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary text-xl font-bold">
                {initials(viewUser.name)}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-on-surface truncate">{viewUser.name}</h3>
                <p className="text-sm text-on-surface-variant truncate">{viewUser.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge
                    variant={
                      viewUser.role?.name === 'super_admin'
                        ? 'danger'
                        : viewUser.role?.name === 'admin'
                        ? 'primary'
                        : 'default'
                    }
                  >
                    {displayRole(viewUser.role?.name)}
                  </Badge>
                  <Badge status={viewUser.status} dot />
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Account Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2.5 p-3 rounded-xl border border-outline-variant/60">
                  <Mail size={16} className="text-on-surface-variant mt-0.5" />
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-on-surface-variant">Email Address</div>
                    <div className="text-sm font-medium text-on-surface mt-0.5">{viewUser.email}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl border border-outline-variant/60">
                  <Shield size={16} className="text-on-surface-variant mt-0.5" />
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-on-surface-variant">Access Control Role</div>
                    <div className="text-sm font-medium text-on-surface mt-0.5">{displayRole(viewUser.role?.name)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pharmacy Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Pharmacy Workspace
              </h4>
              {viewUser.pharmacyId ? (
                <div className="p-4 rounded-xl border border-outline-variant/60 space-y-3">
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-primary" />
                    <span className="text-sm font-bold text-on-surface">
                      {viewUser.pharmacyId.pharmacyName}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-on-surface-variant">City:</span>{' '}
                      <span className="font-semibold text-on-surface">{viewUser.pharmacyId.city || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant">Reg No:</span>{' '}
                      <span className="font-semibold text-on-surface">{viewUser.pharmacyId.registrationNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-xl border border-outline-variant/60 text-xs text-on-surface-variant bg-surface-container/30">
                  <MapPin size={14} />
                  <span>Platform Level Account (No associated pharmacy)</span>
                </div>
              )}
            </div>

            {/* Account Status Control */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Account Status Control
              </h4>
              <div className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant/60 bg-surface-container/20">
                <div className="flex-1">
                  <div className="text-sm font-medium text-on-surface">Update account status</div>
                  <div className="text-xs text-on-surface-variant">
                    {currentUser?._id === viewUser._id || currentUser?.id === viewUser._id
                      ? "You cannot change your own account status."
                      : "Set whether this user is allowed to login and execute tasks."}
                  </div>
                </div>
                <Select
                  value={viewUser.status}
                  onChange={(e) => handleStatusChange(viewUser._id, e.target.value)}
                  disabled={currentUser?._id === viewUser._id || currentUser?.id === viewUser._id}
                  options={[
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                    { label: 'Suspended', value: 'suspended' },
                  ]}
                  className="w-36 h-9 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Audit Logs */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Platform Activity & Audit
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-outline-variant/40">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <Clock size={12} /> Last Login Session
                  </span>
                  <span className="font-semibold text-on-surface">{timeAgo(viewUser.lastActive)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-outline-variant/40">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <Calendar size={12} /> Account Created
                  </span>
                  <span className="font-semibold text-on-surface">
                    {new Date(viewUser.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {viewUser.createdBy && (
                  <div className="flex justify-between py-1.5">
                    <span className="text-on-surface-variant flex items-center gap-1.5">
                      <UserCheck size={12} /> Created By
                    </span>
                    <span className="font-semibold text-on-surface">
                      {viewUser.createdBy.name} ({viewUser.createdBy.email})
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end pt-2 border-t border-outline-variant/60">
              <Button size="sm" onClick={() => setViewOpen(false)}>
                Close Details
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
