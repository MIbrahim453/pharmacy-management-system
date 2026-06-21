import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pill, Eye, Pencil, Trash2 } from 'lucide-react';
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
import { formatPKR } from '../../../utils/helpers';

// Inline medicines data
const INITIAL_MEDICINES = [
  { name: 'Augmentin 625mg', brand: 'GSK', category: 'Antibiotics', stock: 842, reorder: 100, pricePerTab: 92.0, pricePerStrip: 552, pricePerPack: 1840, expiry: 'Jan 2026', status: 'In stock', exp: 'ok' },
  { name: 'Panadol Extra', brand: 'GSK', category: 'Analgesics', stock: 148, reorder: 50, pricePerTab: 12.5, pricePerStrip: 150, pricePerPack: 500, expiry: 'Mar 2025', status: 'Low stock', exp: 'warn' },
  { name: 'Concor 5mg', brand: 'Merck', category: 'Cardiac', stock: 612, reorder: 100, pricePerTab: 34.0, pricePerStrip: 340, pricePerPack: 1360, expiry: 'Jun 2025', status: 'In stock', exp: 'ok' },
  { name: 'Brufen 400mg', brand: 'Abbott', category: 'Analgesics', stock: 36, reorder: 200, pricePerTab: 8.2, pricePerStrip: 82, pricePerPack: 410, expiry: 'Feb 2024', status: 'Critical', exp: 'err' },
  { name: 'Neurobion Forte', brand: 'Merck', category: 'Vitamins', stock: 421, reorder: 80, pricePerTab: 62.0, pricePerStrip: 620, pricePerPack: 2480, expiry: 'Dec 2025', status: 'In stock', exp: 'ok' },
];

const MEDICINE_CATEGORIES = ['All', 'Antibiotics', 'Analgesics', 'Cardiac', 'Gastro', 'Respiratory', 'Pediatric', 'Vitamins'];
const BLANK = { name: '', brand: '', category: 'Antibiotics', stock: '', reorder: '', pricePerTab: '', pricePerStrip: '', pricePerPack: '', expiry: '', status: 'In stock' };

export default function Medicines() {
  const [medicines, setMedicines] = useState(INITIAL_MEDICINES);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [page, setPage] = useState(1);
  const perPage = 5;

  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [delModal, setDelModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [selected, setSelected] = useState(null);

  const filtered = medicines.filter((m) =>
    (categoryFilter === 'All' || m.category === categoryFilter) &&
    (m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.brand.toLowerCase().includes(search.toLowerCase())),
  );
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const field = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const newMedicine = {
      ...form,
      stock: +form.stock,
      reorder: +form.reorder,
      pricePerTab: +form.pricePerTab,
      pricePerStrip: +form.pricePerStrip,
      pricePerPack: +form.pricePerPack,
      exp: 'ok',
      status: form.status
    };
    setMedicines([...medicines, newMedicine]);
    toast.success(`${form.name} added to inventory`);
    setModal(false);
    setForm(BLANK);
    setLoading(false);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const updatedMedicines = medicines.map((m) =>
      m.name === form.name
        ? { ...form, stock: +form.stock, reorder: +form.reorder, pricePerTab: +form.pricePerTab, pricePerStrip: +form.pricePerStrip, pricePerPack: +form.pricePerPack }
        : m
    );
    setMedicines(updatedMedicines);
    toast.success(`${form.name} updated`);
    setEditModal(false);
    setForm(BLANK);
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setMedicines(medicines.filter((m) => m.name !== selected?.name));
    toast.success(`${selected?.name} deleted`);
    setDelModal(false);
    setSelected(null);
    setLoading(false);
  };

  const openView = (m) => { setSelected(m); setViewModal(true); };
  const openEdit = (m) => {
    setForm({ ...m, stock: String(m.stock), reorder: String(m.reorder), pricePerTab: String(m.pricePerTab || m.price || ''), pricePerStrip: String(m.pricePerStrip || ''), pricePerPack: String(m.pricePerPack || '') });
    setEditModal(true);
  };
  const openDel = (m) => { setSelected(m); setDelModal(true); };

  const statusColor = (s) => s === 'In stock' ? 'success' : s === 'Low stock' ? 'warning' : s === 'Critical' ? 'danger' : 'default';

  return (
    <>
      <PageHeader title="Medicines" subtitle={`${medicines.length} medicines in inventory`}
        actions={<Button size="sm" icon={<Plus size={15} />} onClick={() => setModal(true)}>Add medicine</Button>} />

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-outline-variant/60">
          <SearchBar value={search} onChange={(v) => setSearch(v)} placeholder="Search medicines…" className="w-full sm:flex-1 sm:max-w-xs" />
          <div className="flex flex-wrap gap-1.5">
            {MEDICINE_CATEGORIES.slice(0, 6).map((c) => (
              <button key={c} onClick={() => { setCategoryFilter(c); setPage(1); }}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${c === categoryFilter ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-primary/8 hover:text-primary'}`}>{c}</button>
            ))}
          </div>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Medicine</Th><Th>Category</Th>
              <Th align="right">Price/Tab</Th><Th align="right">Price/Strip</Th><Th align="right">Price/Pack</Th>
              <Th>Expiry</Th><Th>Status</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <TableEmpty cols={8} message="No medicines found" icon={<Pill size={32} />} />
            ) : paginated.map((m, i) => (
              <motion.tr key={m.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary text-[10px] font-bold">{m.name.slice(0, 2).toUpperCase()}</div>
                    <div><div className="text-sm font-semibold text-on-surface">{m.name}</div><div className="text-xs text-on-surface-variant">{m.brand}</div></div>
                  </div>
                </Td>
                <Td><Badge variant="default">{m.category}</Badge></Td>
                <Td align="right" className="text-sm font-semibold text-on-surface tnum">{formatPKR(m.pricePerTab || m.price)}</Td>
                <Td align="right" className="text-sm text-on-surface tnum">{m.pricePerStrip ? formatPKR(m.pricePerStrip) : '—'}</Td>
                <Td align="right" className="text-sm font-semibold text-on-surface tnum">{m.pricePerPack ? formatPKR(m.pricePerPack) : '—'}</Td>
                <Td className={`text-sm ${m.exp === 'err' ? 'text-error font-semibold' : m.exp === 'warn' ? 'text-warning' : 'text-on-surface-variant'}`}>{m.expiry}</Td>
                <Td><Badge variant={statusColor(m.status)} dot>{m.status}</Badge></Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openView(m)} className="btn-ghost p-1.5 rounded-lg" title="View"><Eye size={15} /></button>
                    <button onClick={() => openEdit(m)} className="btn-ghost p-1.5 rounded-lg" title="Edit"><Pencil size={15} /></button>
                    <button onClick={() => openDel(m)} className="btn-ghost p-1.5 rounded-lg text-error/70 hover:text-error hover:bg-error/8" title="Delete"><Trash2 size={15} /></button>
                  </div>
                </Td>
              </motion.tr>
            ))}
          </tbody>
        </Table>
        <div className="px-5 py-4 border-t border-outline-variant/60">
          <Pagination page={page} total={filtered.length} perPage={perPage} onChange={(p) => setPage(p)} />
        </div>
      </Card>

      {/* Add Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Add medicine" subtitle="Add a new medicine to your inventory."
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button form="medicine-form" type="submit" loading={loading}>Add medicine</Button></div>}>
        <form id="medicine-form" onSubmit={handleAdd} className="p-6 grid grid-cols-2 gap-4">
          <Input label="Medicine name" value={form.name} onChange={(e) => field('name', e.target.value)} required placeholder="e.g. Augmentin 625mg" containerClass="col-span-2" />
          <Input label="Brand" value={form.brand} onChange={(e) => field('brand', e.target.value)} required placeholder="GSK, Abbott…" />
          <Select label="Category" value={form.category} onChange={(e) => field('category', e.target.value)} options={MEDICINE_CATEGORIES.slice(1)} />
          <Input label="Expiry date" value={form.expiry} onChange={(e) => field('expiry', e.target.value)} placeholder="MMM YYYY" />
          <Input label="Stock qty" type="number" value={form.stock} onChange={(e) => field('stock', e.target.value)} required min="0" />
          <Input label="Reorder level" type="number" value={form.reorder} onChange={(e) => field('reorder', e.target.value)} min="0" />
          <Input label="Price per tab (Rs)" type="number" value={form.pricePerTab} onChange={(e) => field('pricePerTab', e.target.value)} required min="0" step="0.01" />
          <Input label="Price per strip (Rs)" type="number" value={form.pricePerStrip} onChange={(e) => field('pricePerStrip', e.target.value)} min="0" step="0.01" />
          <Input label="Price per pack (Rs)" type="number" value={form.pricePerPack} onChange={(e) => field('pricePerPack', e.target.value)} min="0" step="0.01" />
          <Select label="Status" value={form.status} onChange={(e) => field('status', e.target.value)} options={['In stock', 'Low stock', 'Critical']} />
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit medicine" subtitle={`Editing ${form.name}`}
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setEditModal(false)}>Cancel</Button><Button form="medicine-edit-form" type="submit" loading={loading}>Save changes</Button></div>}>
        <form id="medicine-edit-form" onSubmit={handleEdit} className="p-6 grid grid-cols-2 gap-4">
          <Input label="Medicine name" value={form.name} onChange={(e) => field('name', e.target.value)} required containerClass="col-span-2" disabled />
          <Input label="Brand" value={form.brand} onChange={(e) => field('brand', e.target.value)} required />
          <Select label="Category" value={form.category} onChange={(e) => field('category', e.target.value)} options={MEDICINE_CATEGORIES.slice(1)} />
          <Input label="Expiry date" value={form.expiry} onChange={(e) => field('expiry', e.target.value)} />
          <Input label="Stock qty" type="number" value={form.stock} onChange={(e) => field('stock', e.target.value)} required min="0" />
          <Input label="Reorder level" type="number" value={form.reorder} onChange={(e) => field('reorder', e.target.value)} min="0" />
          <Input label="Price per tab (Rs)" type="number" value={form.pricePerTab} onChange={(e) => field('pricePerTab', e.target.value)} required min="0" step="0.01" />
          <Input label="Price per strip (Rs)" type="number" value={form.pricePerStrip} onChange={(e) => field('pricePerStrip', e.target.value)} min="0" step="0.01" />
          <Input label="Price per pack (Rs)" type="number" value={form.pricePerPack} onChange={(e) => field('pricePerPack', e.target.value)} min="0" step="0.01" />
          <Select label="Status" value={form.status} onChange={(e) => field('status', e.target.value)} options={['In stock', 'Low stock', 'Critical']} />
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={viewModal} onClose={() => setViewModal(false)} title="Medicine details" subtitle={selected?.name} size="sm">
        {selected && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary text-lg font-bold">{selected?.name?.slice(0, 2).toUpperCase()}</div>
              <div><div className="text-lg font-semibold text-on-surface">{selected?.name}</div><div className="text-sm text-on-surface-variant">{selected?.brand}</div></div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-surface-container p-3"><div className="text-on-surface-variant text-xs">Category</div><div className="font-medium text-on-surface mt-0.5">{selected?.category}</div></div>
              <div className="rounded-xl bg-surface-container p-3"><div className="text-on-surface-variant text-xs">Stock</div><div className="font-medium text-on-surface mt-0.5">{selected?.stock?.toLocaleString()}</div></div>
              <div className="rounded-xl bg-surface-container p-3"><div className="text-on-surface-variant text-xs">Reorder level</div><div className="font-medium text-on-surface mt-0.5">{selected?.reorder}</div></div>
              <div className="rounded-xl bg-surface-container p-3"><div className="text-on-surface-variant text-xs">Price per tab</div><div className="font-medium text-on-surface mt-0.5">{formatPKR(selected?.pricePerTab || selected?.price)}</div></div>
              <div className="rounded-xl bg-surface-container p-3"><div className="text-on-surface-variant text-xs">Price per strip</div><div className="font-medium text-on-surface mt-0.5">{selected?.pricePerStrip ? formatPKR(selected?.pricePerStrip) : '—'}</div></div>
              <div className="rounded-xl bg-surface-container p-3"><div className="text-on-surface-variant text-xs">Price per pack</div><div className="font-medium text-on-surface mt-0.5">{selected?.pricePerPack ? formatPKR(selected?.pricePerPack) : '—'}</div></div>
              <div className="rounded-xl bg-surface-container p-3"><div className="text-on-surface-variant text-xs">Expiry</div><div className="font-medium text-on-surface mt-0.5">{selected?.expiry}</div></div>
              <div className="rounded-xl bg-surface-container p-3"><div className="text-on-surface-variant text-xs">Status</div><div className="mt-1"><Badge variant={statusColor(selected?.status)} dot>{selected?.status}</Badge></div></div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={delModal} onClose={() => setDelModal(false)} title="Delete medicine" size="sm"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setDelModal(false)}>Cancel</Button><Button variant="danger" onClick={handleDelete} loading={loading}>Delete</Button></div>}>
        <div className="p-6"><p className="text-sm text-on-surface-variant">Are you sure you want to delete <strong className="text-on-surface">{selected?.name}</strong>? This action cannot be undone.</p></div>
      </Modal>
    </>
  );
}
