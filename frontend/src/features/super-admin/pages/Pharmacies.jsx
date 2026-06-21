import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Building2, Search, Eye, Pencil, Trash2 } from 'lucide-react';
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
// TODO: Replace with API call — GET /api/super-admin/pharmacies
const INITIAL_PHARMACIES = [
  { name: 'MedPoint Karachi', admin: 'Ahmed Raza', email: 'ahmed@medpoint.pk', city: 'Karachi', users: 8, status: 'Active' },
  { name: 'LifeCare Lahore', admin: 'Sara Khan', email: 'sara@lifecare.pk', city: 'Lahore', users: 5, status: 'Active' },
  { name: 'PharmaPlus ISB', admin: 'Usman Ali', email: 'usman@pharmaplus.pk', city: 'Islamabad', users: 3, status: 'Active' },
  { name: 'CureMart Faisalabad', admin: 'Zainab Mir', email: 'zainab@curemart.pk', city: 'Faisalabad', users: 4, status: 'Suspended' },
  { name: 'HealthHub Karachi', admin: 'Bilal Hassan', email: 'bilal@healthhub.pk', city: 'Karachi', users: 6, status: 'Active' },
];



const PER_PAGE = 8;
const BLANK = { name: '', admin: '', email: '', city: '', status: 'Active', users: '1' };

export default function PharmaciesPage() {
  const [list, setList] = useState(INITIAL_PHARMACIES);

  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [delModal, setDelModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [selected, setSelected] = useState(null);

  const filtered = list.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.admin.toLowerCase().includes(query.toLowerCase()) ||
    p.city.toLowerCase().includes(query.toLowerCase()),
  );
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const field = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setList([{ ...form, users: Number(form.users) || 1, status: 'Active' }, ...list]);
    toast.success(`${form.name} onboarded successfully!`);
    setModal(false);
    setForm(BLANK);
    setLoading(false);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const updated = list.map((p) => p.name === selected?.name ? {
      ...p,
      name: form.name,
      admin: form.admin,
      email: form.email,
      city: form.city,
      status: form.status,
      users: Number(form.users) || p.users,
    } : p);
    setList(updated);
    toast.success(`${form.name} workspace updated!`);
    setEditModal(false);
    setSelected(null);
    setForm(BLANK);
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const updated = list.filter((p) => p.name !== selected?.name);
    setList(updated);
    toast.success(`${selected?.name} deleted`);
    setDelModal(false);
    setSelected(null);
    setLoading(false);
  };

  const openView = (p) => { setSelected(p); setViewModal(true); };
  const openEdit = (p) => {
    setSelected(p);
    setForm({
      name: p.name,
      admin: p.admin,
      email: p.email || `${p.admin.toLowerCase().replace(/ /g, '')}@${p.name.toLowerCase().replace(/ /g, '')}.com`,
      city: p.city,
      status: p.status,
      users: String(p.users),
    });
    setEditModal(true);
  };
  const openDel = (p) => { setSelected(p); setDelModal(true); };

  return (
    <>
      <PageHeader
        title="Pharmacies"
        subtitle={`${list.length} pharmacies across the platform`}
        actions={
          <Button size="sm" icon={<Plus size={15} />} onClick={() => { setForm(BLANK); setModal(true); }}>
            Onboard pharmacy
          </Button>
        }
      />

      <Card>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-outline-variant/60">
          <SearchBar value={query} onChange={(v) => { setQuery(v); setPage(1); }} placeholder="Search pharmacies…" className="w-full sm:flex-1 sm:max-w-xs" />
          <div className="flex items-center gap-2 text-xs text-on-surface-variant sm:ml-auto flex-wrap">
            <span className="h-2 w-2 rounded-full bg-primary" />Active: {list.filter(p => p.status === 'Active').length}
            <span className="ml-2 h-2 w-2 rounded-full bg-error" />Suspended: {list.filter(p => p.status === 'Suspended').length}
          </div>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Pharmacy</Th><Th>Admin</Th><Th>City</Th>
              <Th align="right">Users</Th>
              <Th>Status</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <TableEmpty cols={6} message="No pharmacies found" icon={<Building2 size={32} />} />
            ) : paginated.map((p, i) => (
              <motion.tr key={p.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/[0.12] text-primary text-xs font-bold">
                      {p.name[0]}
                    </div>
                    <span className="font-semibold text-on-surface text-sm">{p.name}</span>
                  </div>
                </Td>
                <Td className="text-sm">{p.admin}</Td>
                <Td className="text-sm">{p.city}</Td>
                <Td align="right" className="text-sm font-medium">{p.users}</Td>
                <Td><Badge status={p.status} dot /></Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openView(p)} className="btn-ghost p-1.5 rounded-lg" title="View">
                      <Eye size={15} />
                    </button>
                    <button onClick={() => openEdit(p)} className="btn-ghost p-1.5 rounded-lg" title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => openDel(p)} className="btn-ghost p-1.5 rounded-lg text-error/70 hover:text-error hover:bg-error/[0.08]" title="Delete">
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

      {/* Create modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Onboard new pharmacy"
        subtitle="Create the pharmacy and assign an admin account."
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button form="pharmacy-form" type="submit" loading={loading}>Create pharmacy</Button>
          </div>
        }
      >
        <form id="pharmacy-form" onSubmit={handleCreate} className="p-6 space-y-4">
          <Input label="Pharmacy name" value={form.name} onChange={(e) => field('name', e.target.value)} required placeholder="e.g. MedPoint Pharmacy" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Admin name" value={form.admin} onChange={(e) => field('admin', e.target.value)} required placeholder="Full name" />
            <Input label="Admin email" type="email" value={form.email} onChange={(e) => field('email', e.target.value)} required placeholder="admin@pharmacy.pk" />
          </div>
          <Input label="City" value={form.city} onChange={(e) => field('city', e.target.value)} required placeholder="City" />
          <div className="rounded-xl bg-warning/[0.08] border border-warning/30 p-3 text-xs text-warning">
            A temporary password will be auto-generated and emailed to the admin.
          </div>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Pharmacy"
        subtitle={`Editing workspace for ${selected?.name}`}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditModal(false)}>Cancel</Button>
            <Button form="pharmacy-edit-form" type="submit" loading={loading}>Save changes</Button>
          </div>
        }
      >
        <form id="pharmacy-edit-form" onSubmit={handleEdit} className="p-6 space-y-4">
          <Input label="Pharmacy name" value={form.name} onChange={(e) => field('name', e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Admin name" value={form.admin} onChange={(e) => field('admin', e.target.value)} required />
            <Input label="Admin email" type="email" value={form.email} onChange={(e) => field('email', e.target.value)} required />
          </div>
          <Input label="City" value={form.city} onChange={(e) => field('city', e.target.value)} required />
          <Input label="Users Count" type="number" value={form.users} onChange={(e) => field('users', e.target.value)} min="1" required />
          <Select label="Status" value={form.status} onChange={(e) => field('status', e.target.value)} options={['Active', 'Suspended']} />
        </form>
      </Modal>

      {/* View modal */}
      <Modal
        open={viewModal}
        onClose={() => setViewModal(false)}
        title="Pharmacy Profile"
        subtitle={selected?.name}
        size="sm"
      >
        {selected && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/[0.12] text-primary text-xl font-bold">
                {selected?.name?.[0]}
              </div>
              <div>
                <div className="text-lg font-semibold text-on-surface">{selected?.name}</div>
                <div className="text-sm text-on-surface-variant">{selected?.city}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Admin Person</div>
                <div className="font-medium text-on-surface mt-0.5">{selected?.admin}</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Active Users</div>
                <div className="font-medium text-on-surface mt-0.5">{selected?.users}</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3 col-span-2">
                <div className="text-on-surface-variant text-xs">Platform Status</div>
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
        title="Delete Pharmacy Workspace"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDelModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={loading}>Decommission</Button>
          </div>
        }
      >
        <div className="p-6">
          <p className="text-sm text-on-surface-variant">
            Are you sure you want to delete <strong className="text-on-surface">{selected?.name}</strong>? This action terminates all user accounts and deletes all branch data.
          </p>
        </div>
      </Modal>
    </>
  );
}
