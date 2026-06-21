import { useState } from 'react';
import { toast } from 'sonner';
import { UserPlus, Users, Eye, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
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

// TODO: Replace with API call — GET /api/admin/staff
const STAFF = [
  { name: 'Fatima Sheikh', email: 'fatima@pharmacy.pk', role: 'Pharmacist', counter: 'Counter 1', invoices: 142, last: '30 min ago', status: 'Active' },
  { name: 'Bilal Hassan', email: 'bilal@pharmacy.pk', role: 'Cashier', counter: 'Counter 2', invoices: 98, last: '2 hrs ago', status: 'Active' },
  { name: 'Nadia Ahmed', email: 'nadia@pharmacy.pk', role: 'Inventory', counter: '', invoices: 0, last: 'Yesterday', status: 'Active' },
  { name: 'Rizwan Khan', email: 'rizwan@pharmacy.pk', role: 'Pharmacist', counter: 'Counter 3', invoices: 210, last: '1 day ago', status: 'Suspended' },
];


const PER_PAGE = 8;
const BLANK = { name: '', email: '', role: 'Pharmacist', counter: '' };

export default function Staff() {
  const [list, setList] = useState(STAFF);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [delModal, setDelModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [selected, setSelected] = useState(null);

  const filtered = list.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.email.toLowerCase().includes(query.toLowerCase()));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const field = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setList([{ ...form, invoices: 0, last: 'Just now', status: 'Active' }, ...list]);
    toast.success(`${form.name} added as staff`);
    setModal(false);
    setForm(BLANK);
    setLoading(false);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const updated = list.map((s) => s.email === selected?.email ? { ...s, ...form } : s);
    setList(updated);
    toast.success(`${form.name} updated successfully`);
    setEditModal(false);
    setSelected(null);
    setForm(BLANK);
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const updated = list.filter((s) => s.email !== selected?.email);
    setList(updated);
    toast.success(`${selected?.name} removed from staff`);
    setDelModal(false);
    setSelected(null);
    setLoading(false);
  };

  const toggleStatus = (email) => {
    const updated = list.map((s) => s.email === email ? { ...s, status: s.status === 'Active' ? 'Suspended' : 'Active' } : s);
    setList(updated);
    const item = list.find((s) => s.email === email);
    toast.success(`${item.name} ${item.status === 'Active' ? 'suspended' : 'activated'}`);
  };

  const openView = (s) => { setSelected(s); setViewModal(true); };
  const openEdit = (s) => { setSelected(s); setForm({ name: s.name, email: s.email, role: s.role, counter: s.counter || '' }); setEditModal(true); };
  const openDel = (s) => { setSelected(s); setDelModal(true); };

  return (
    <>
      <PageHeader
        title="Staff"
        subtitle={`${list.filter(s => s.status === 'Active').length} active staff members`}
        actions={
          <Button size="sm" icon={<UserPlus size={15} />} onClick={() => setModal(true)}>
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
              <motion.tr key={s.email} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
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
                      onClick={() => toggleStatus(s.email)}
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
        <form id="staff-form" onSubmit={handleAdd} className="p-6 space-y-4">
          <Input label="Full name" value={form.name} onChange={(e) => field('name', e.target.value)} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => field('email', e.target.value)} required placeholder="staff@pharmacy.pk" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Role" value={form.role} onChange={(e) => field('role', e.target.value)} options={['Pharmacist', 'Cashier', 'Inventory']} />
            <Input label="Counter (optional)" value={form.counter} onChange={(e) => field('counter', e.target.value)} placeholder="Counter 1" />
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
        <form id="staff-edit-form" onSubmit={handleEdit} className="p-6 space-y-4">
          <Input label="Full name" value={form.name} onChange={(e) => field('name', e.target.value)} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => field('email', e.target.value)} required placeholder="staff@pharmacy.pk" disabled />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Role" value={form.role} onChange={(e) => field('role', e.target.value)} options={['Pharmacist', 'Cashier', 'Inventory']} />
            <Input label="Counter" value={form.counter} onChange={(e) => field('counter', e.target.value)} placeholder="Counter 1" />
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
