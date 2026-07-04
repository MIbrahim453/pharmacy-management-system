import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { UserPlus, Users, Eye, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import PageHeader from '../../../components/common/PageHeader';
import SearchBar from '../../../components/common/SearchBar';
import { Card } from '../../../components/ui/Card';
import { Table, Th, Td, TableEmpty } from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Pagination from '../../../components/ui/Pagination';
import { initials } from '../../../utils/helpers';
import { yupResolver, staffRegisterSchema, staffEditSchema } from '../../../utils/validation';
import {
  registerStaff,
  getAllStaff,
  editStaffDetails,
  deleteStaffDetails,
  changeStaffStatus,
} from '../../../services/staffService';

const PER_PAGE = 8;

export default function Staff() {
  const { user } = useSelector((state) => state.auth);
  const [list, setList] = useState([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [delModal, setDelModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  // Add Form Configuration
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: addErrors },
  } = useForm({
    resolver: yupResolver(staffRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Pharmacist',
      counter: '',
    },
  });

  // Edit Form Configuration
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm({
    resolver: yupResolver(staffEditSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Pharmacist',
      counter: '',
    },
  });

  const fetchStaff = async () => {
    if (!user || !user.pharmacyId) return;
    try {
      const data = await getAllStaff(user.pharmacyId, query);
      setList(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch staff members');
    }
  };

  useEffect(() => {
    fetchStaff();
    setPage(1);
  }, [query, user]);

  const filtered = list;
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openAdd = () => {
    resetAdd({
      name: '',
      email: '',
      role: 'Pharmacist',
      counter: '',
    });
    setModal(true);
  };

  const handleAdd = async (data) => {
    if (!user || !user.pharmacyId) {
      toast.error('You must belong to a pharmacy to register staff members');
      return;
    }
    setLoading(true);
    try {
      const staffData = await registerStaff({
        ...data,
        pharmacyId: user.pharmacyId,
      });

      const newStaffItem = {
        id: staffData._id,
        name: staffData.name,
        email: staffData.email,
        role: staffData.staffRole,
        counter: staffData.staffCounter || '',
        invoices: 0,
        last: 'Never',
        status: 'Active',
      };
      setList((prev) => [newStaffItem, ...prev]);
      toast.success(`${staffData.name} registered as staff`);
      setModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register staff member');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (s) => {
    setSelected(s);
    resetEdit({
      name: s.name,
      email: s.email,
      role: s.role,
      counter: s.counter || '',
    });
    setEditModal(true);
  };

  const handleEdit = async (data) => {
    setLoading(true);
    try {
      const updatedStaff = await editStaffDetails(selected.id, data);
      setList((prev) => prev.map((s) => (s.id === selected.id ? updatedStaff : s)));
      toast.success(`${updatedStaff.name} updated successfully`);
      setEditModal(false);
      setSelected(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update staff member');
    } finally {
      setLoading(false);
    }
  };

  const openDel = (s) => {
    setSelected(s);
    setDelModal(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteStaffDetails(selected.id);
      setList((prev) => prev.filter((s) => s.id !== selected.id));
      toast.success(`${selected?.name} removed from staff`);
      setDelModal(false);
      setSelected(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove staff member');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (sItem) => {
    const newBackendStatus = sItem.status === 'Active' ? 'suspended' : 'active';
    try {
      const updatedStaff = await changeStaffStatus(sItem.id, newBackendStatus);
      setList((prev) => prev.map((s) => (s.id === sItem.id ? updatedStaff : s)));
      toast.success(`${sItem.name} status updated to ${updatedStaff.status.toLowerCase()}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update staff status');
    }
  };

  const openView = (s) => { setSelected(s); setViewModal(true); };

  return (
    <>
      <PageHeader
        title="Staff"
        subtitle={`${list.filter(s => s.status === 'Active').length} active staff members`}
        actions={
          <Button size="sm" icon={<UserPlus size={15} />} onClick={openAdd}>
            Add staff
          </Button>
        }
      />

      <Card>
        <div className="px-5 py-4 border-b border-outline-variant/60">
          <SearchBar value={query} onChange={(v) => { setQuery(v); setPage(1); }} placeholder="Search staff…" className="w-full sm:max-w-xs" />
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Staff member</Th><Th>Role</Th><Th>Counter</Th>
              <Th align="right">Invoices</Th><Th>Last active</Th>
              <Th>Status</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <TableEmpty cols={7} message="No staff found" icon={<Users size={32} />} />
            ) : paginated.map((s, i) => (
              <motion.tr key={s.id || s.email} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-on-surface-variant text-xs font-bold">
                      {initials(s.name)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-on-surface">{s.name}</div>
                      <div className="text-xs text-on-surface-variant">{s.email}</div>
                    </div>
                  </div>
                </Td>
                <Td><Badge variant="default">{s.role}</Badge></Td>
                <Td className="text-sm text-on-surface-variant">{s.counter || '—'}</Td>
                <Td align="right" className="text-sm font-medium">{s.invoices}</Td>
                <Td className="text-xs text-on-surface-variant">{s.last}</Td>
                <Td><Badge status={s.status} dot /></Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openView(s)} className="btn-ghost p-1.5 rounded-lg" title="View">
                      <Eye size={15} />
                    </button>
                    <button onClick={() => openEdit(s)} className="btn-ghost p-1.5 rounded-lg" title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => toggleStatus(s)}
                      className={`btn-ghost px-2 py-1 text-xs rounded-lg font-semibold ${s.status === 'Active' ? 'text-warning hover:bg-warning/[0.08]' : 'text-primary hover:bg-primary/[0.08]'}`}
                    >
                      {s.status === 'Active' ? 'Suspend' : 'Activate'}
                    </button>
                    <button onClick={() => openDel(s)} className="btn-ghost p-1.5 rounded-lg text-error/70 hover:text-error hover:bg-error/[0.08]" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </Td>
              </motion.tr>
            ))}
          </tbody>
        </Table>

        <div className="px-5 py-4 border-t border-outline-variant/60">
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </Card>

      {/* Add Modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Add staff member"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button form="staff-form" type="submit" loading={loading}>Add staff</Button>
          </div>
        }
      >
        <form id="staff-form" onSubmit={handleSubmitAdd(handleAdd)} className="p-6 space-y-4">
          <Input label="Full name" {...registerAdd('name')} required error={addErrors.name?.message} />
          <Input label="Email" type="email" {...registerAdd('email')} required placeholder="staff@pharmacy.pk" error={addErrors.email?.message} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Role" {...registerAdd('role')} options={['Pharmacist', 'Cashier', 'Inventory']} error={addErrors.role?.message} />
            <Input label="Counter (optional)" {...registerAdd('counter')} placeholder="Counter 1" error={addErrors.counter?.message} />
          </div>
          <div className="rounded-xl bg-primary/[0.08] border border-primary/30 p-3 text-xs text-primary">
            A temporary password will be emailed to the new staff member.
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title="Edit staff member"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditModal(false)}>Cancel</Button>
            <Button form="staff-edit-form" type="submit" loading={loading}>Save changes</Button>
          </div>
        }
      >
        <form id="staff-edit-form" onSubmit={handleSubmitEdit(handleEdit)} className="p-6 space-y-4">
          <Input label="Full name" {...registerEdit('name')} required error={editErrors.name?.message} />
          <Input label="Email" type="email" {...registerEdit('email')} required placeholder="staff@pharmacy.pk" disabled error={editErrors.email?.message} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Role" {...registerEdit('role')} options={['Pharmacist', 'Cashier', 'Inventory']} error={editErrors.role?.message} />
            <Input label="Counter" {...registerEdit('counter')} placeholder="Counter 1" error={editErrors.counter?.message} />
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        open={viewModal}
        onClose={() => setViewModal(false)}
        title="Staff details"
        subtitle={selected?.name}
        size="sm"
      >
        {selected && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface-container-high text-on-surface-variant text-lg font-bold">
                {initials(selected?.name)}
              </div>
              <div>
                <div className="text-lg font-semibold text-on-surface">{selected?.name}</div>
                <div className="text-sm text-on-surface-variant">{selected?.email}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Role</div>
                <div className="font-medium text-on-surface mt-0.5">{selected?.role}</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Counter assigned</div>
                <div className="font-medium text-on-surface mt-0.5">{selected?.counter || '—'}</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Invoices handled</div>
                <div className="font-medium text-on-surface mt-0.5 font-mono">{selected?.invoices}</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Last active</div>
                <div className="font-medium text-on-surface mt-0.5">{selected?.last}</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3 col-span-2">
                <div className="text-on-surface-variant text-xs">Status</div>
                <div className="mt-1"><Badge status={selected?.status} dot>{selected?.status}</Badge></div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={delModal}
        onClose={() => setDelModal(false)}
        title="Remove staff member"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDelModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={loading}>Remove</Button>
          </div>
        }
      >
        <div className="p-6">
          <p className="text-sm text-on-surface-variant">
            Are you sure you want to remove <strong className="text-on-surface">{selected?.name}</strong> from your staff? This action cannot be undone.
          </p>
        </div>
      </Modal>
    </>
  );
}
