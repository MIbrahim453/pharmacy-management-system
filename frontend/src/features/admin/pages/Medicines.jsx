import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { yupResolver, medicineCreateSchema, medicineEditSchema } from '../../../utils/validation';
import {
  getAllMedicines,
  createMedicine,
  editMedicine,
  deleteMedicine,
  getCategoryNames,
} from '../../../services/medicineService';

const DEFAULT_CATEGORIES = ['All', 'Antibiotics', 'Analgesics', 'Cardiac', 'Gastro', 'Respiratory', 'Pediatric', 'Vitamins'];

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [page, setPage] = useState(1);
  const perPage = 5;

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
    resolver: yupResolver(medicineCreateSchema),
    defaultValues: {
      name: '',
      brand: '',
      category: 'Antibiotics',
      expiryDate: '',
      stockQty: '',
      reorderLevel: '',
      tabPrice: '',
      stripPrice: '',
      packPrice: '',
      status: 'inStock',
    },
  });

  // Edit Form Configuration
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm({
    resolver: yupResolver(medicineEditSchema),
    defaultValues: {
      name: '',
      brand: '',
      category: 'Antibiotics',
      expiryDate: '',
      stockQty: '',
      reorderLevel: '',
      tabPrice: '',
      stripPrice: '',
      packPrice: '',
      status: 'inStock',
    },
  });

  const fetchMedicines = async () => {
    try {
      const data = await getAllMedicines(search);
      setMedicines(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch medicines');
    }
  };

  const fetchCategories = async () => {
    try {
      const names = await getCategoryNames();
      if (names && names.length > 0) {
        const unique = Array.from(new Set(['All', ...DEFAULT_CATEGORIES.slice(1), ...names]));
        setCategories(unique);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [search]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = medicines.filter((m) =>
    (categoryFilter === 'All' || m.category.toLowerCase() === categoryFilter.toLowerCase())
  );
  
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openAdd = () => {
    resetAdd({
      name: '',
      brand: '',
      category: categories.filter(c => c !== 'All')[0] || 'Antibiotics',
      expiryDate: '',
      stockQty: '',
      reorderLevel: '',
      tabPrice: '',
      stripPrice: '',
      packPrice: '',
      status: 'inStock',
    });
    setModal(true);
  };

  const handleAdd = async (data) => {
    setLoading(true);
    try {
      const newMedicine = await createMedicine(data);
      setMedicines((prev) => [...prev, newMedicine]);
      toast.success(`${newMedicine.name} added to inventory`);
      setModal(false);
      fetchCategories(); // Reload categories in case a new one was added
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add medicine');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (m) => {
    setSelected(m);
    resetEdit({
      name: m.name,
      brand: m.brand,
      category: m.category,
      expiryDate: m.expiryDateStr,
      stockQty: String(m.stock),
      reorderLevel: String(m.reorder),
      tabPrice: String(m.pricePerTab),
      stripPrice: String(m.pricePerStrip),
      packPrice: String(m.pricePerPack),
      status: m.status === 'In stock' ? 'inStock' : m.status === 'Low stock' ? 'lowStock' : 'critical',
    });
    setEditModal(true);
  };

  const handleEdit = async (data) => {
    setLoading(true);
    try {
      const updated = await editMedicine(selected.id, data);
      setMedicines((prev) =>
        prev.map((m) => (m.id === selected.id ? updated : m))
      );
      toast.success(`${updated.name} updated successfully`);
      setEditModal(false);
      setSelected(null);
      fetchCategories(); // Reload categories in case category was updated
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update medicine');
    } finally {
      setLoading(false);
    }
  };

  const openDel = (m) => {
    setSelected(m);
    setDelModal(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteMedicine(selected.id);
      setMedicines((prev) => prev.filter((m) => m.id !== selected.id));
      toast.success(`${selected?.name} deleted successfully`);
      setDelModal(false);
      setSelected(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete medicine');
    } finally {
      setLoading(false);
    }
  };

  const openView = (m) => {
    setSelected(m);
    setViewModal(true);
  };

  const statusColor = (s) =>
    s === 'In stock' ? 'success' : s === 'Low stock' ? 'warning' : s === 'Critical' ? 'danger' : 'default';

  return (
    <>
      <PageHeader
        title="Medicines"
        subtitle={`${medicines.length} medicines in inventory`}
        actions={
          <Button size="sm" icon={<Plus size={15} />} onClick={openAdd}>
            Add medicine
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-outline-variant/60">
          <SearchBar
            value={search}
            onChange={(v) => setSearch(v)}
            placeholder="Search medicines…"
            className="w-full sm:flex-1 sm:max-w-xs"
          />
          <div className="flex flex-wrap gap-1.5">
            {categories.slice(0, 8).map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCategoryFilter(c);
                  setPage(1);
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                  c === categoryFilter
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-primary/8 hover:text-primary'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Medicine</Th>
              <Th>Category</Th>
              <Th align="right">Price/Tab</Th>
              <Th align="right">Price/Strip</Th>
              <Th align="right">Price/Pack</Th>
              <Th>Expiry</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <TableEmpty cols={8} message="No medicines found" icon={<Pill size={32} />} />
            ) : (
              paginated.map((m, i) => (
                <motion.tr
                  key={m.id || m.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary text-[10px] font-bold">
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-on-surface">{m.name}</div>
                        <div className="text-xs text-on-surface-variant">{m.brand}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Badge variant="default">{m.category}</Badge>
                  </Td>
                  <Td align="right" className="text-sm font-semibold text-on-surface tnum">
                    {formatPKR(m.pricePerTab)}
                  </Td>
                  <Td align="right" className="text-sm text-on-surface tnum">
                    {m.pricePerStrip ? formatPKR(m.pricePerStrip) : '—'}
                  </Td>
                  <Td align="right" className="text-sm font-semibold text-on-surface tnum">
                    {m.pricePerPack ? formatPKR(m.pricePerPack) : '—'}
                  </Td>
                  <Td
                    className={`text-sm ${
                      m.exp === 'err'
                        ? 'text-error font-semibold'
                        : m.exp === 'warn'
                        ? 'text-warning'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {m.expiry}
                  </Td>
                  <Td>
                    <Badge variant={statusColor(m.status)} dot>
                      {m.status}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openView(m)} className="btn-ghost p-1.5 rounded-lg" title="View">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => openEdit(m)} className="btn-ghost p-1.5 rounded-lg" title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => openDel(m)}
                        className="btn-ghost p-1.5 rounded-lg text-error/70 hover:text-error hover:bg-error/8"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </Td>
                </motion.tr>
              ))
            )}
          </tbody>
        </Table>
        <div className="px-5 py-4 border-t border-outline-variant/60">
          <Pagination page={page} total={filtered.length} perPage={perPage} onChange={(p) => setPage(p)} />
        </div>
      </Card>

      {/* Add Modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Add medicine"
        subtitle="Add a new medicine to your inventory."
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button form="medicine-form" type="submit" loading={loading}>
              Add medicine
            </Button>
          </div>
        }
      >
        <form id="medicine-form" onSubmit={handleSubmitAdd(handleAdd)} className="p-6 grid grid-cols-2 gap-4">
          <Input
            label="Medicine name"
            {...registerAdd('name')}
            required
            placeholder="e.g. Augmentin 625mg"
            containerClass="col-span-2"
            error={addErrors.name?.message}
          />
          <Input
            label="Brand"
            {...registerAdd('brand')}
            required
            placeholder="GSK, Abbott…"
            error={addErrors.brand?.message}
          />
          <Select
            label="Category"
            {...registerAdd('category')}
            options={categories.filter(c => c !== 'All')}
            error={addErrors.category?.message}
          />
          <Input
            label="Expiry date"
            type="date"
            {...registerAdd('expiryDate')}
            required
            error={addErrors.expiryDate?.message}
          />
          <Input
            label="Stock qty"
            type="number"
            {...registerAdd('stockQty')}
            required
            min="0"
            error={addErrors.stockQty?.message}
          />
          <Input
            label="Reorder level"
            type="number"
            {...registerAdd('reorderLevel')}
            min="0"
            error={addErrors.reorderLevel?.message}
          />
          <Input
            label="Price per tab (Rs)"
            type="number"
            {...registerAdd('tabPrice')}
            required
            min="0"
            step="0.01"
            error={addErrors.tabPrice?.message}
          />
          <Input
            label="Price per strip (Rs)"
            type="number"
            {...registerAdd('stripPrice')}
            required
            min="0"
            step="0.01"
            error={addErrors.stripPrice?.message}
          />
          <Input
            label="Price per pack (Rs)"
            type="number"
            {...registerAdd('packPrice')}
            required
            min="0"
            step="0.01"
            error={addErrors.packPrice?.message}
          />
          <Select
            label="Status"
            {...registerAdd('status')}
            options={[
              { value: 'inStock', label: 'In stock' },
              { value: 'lowStock', label: 'Low stock' },
              { value: 'critical', label: 'Critical' },
            ]}
            error={addErrors.status?.message}
          />
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title="Edit medicine"
        subtitle={`Editing ${selected?.name}`}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditModal(false)}>
              Cancel
            </Button>
            <Button form="medicine-edit-form" type="submit" loading={loading}>
              Save changes
            </Button>
          </div>
        }
      >
        <form id="medicine-edit-form" onSubmit={handleSubmitEdit(handleEdit)} className="p-6 grid grid-cols-2 gap-4">
          <Input
            label="Medicine name"
            {...registerEdit('name')}
            required
            containerClass="col-span-2"
            disabled
            error={editErrors.name?.message}
          />
          <Input
            label="Brand"
            {...registerEdit('brand')}
            required
            error={editErrors.brand?.message}
          />
          <Select
            label="Category"
            {...registerEdit('category')}
            options={categories.filter(c => c !== 'All')}
            error={editErrors.category?.message}
          />
          <Input
            label="Expiry date"
            type="date"
            {...registerEdit('expiryDate')}
            required
            error={editErrors.expiryDate?.message}
          />
          <Input
            label="Stock qty"
            type="number"
            {...registerEdit('stockQty')}
            required
            min="0"
            error={editErrors.stockQty?.message}
          />
          <Input
            label="Reorder level"
            type="number"
            {...registerEdit('reorderLevel')}
            min="0"
            error={editErrors.reorderLevel?.message}
          />
          <Input
            label="Price per tab (Rs)"
            type="number"
            {...registerEdit('tabPrice')}
            required
            min="0"
            step="0.01"
            error={editErrors.tabPrice?.message}
          />
          <Input
            label="Price per strip (Rs)"
            type="number"
            {...registerEdit('stripPrice')}
            required
            min="0"
            step="0.01"
            error={editErrors.stripPrice?.message}
          />
          <Input
            label="Price per pack (Rs)"
            type="number"
            {...registerEdit('packPrice')}
            required
            min="0"
            step="0.01"
            error={editErrors.packPrice?.message}
          />
          <Select
            label="Status"
            {...registerEdit('status')}
            options={[
              { value: 'inStock', label: 'In stock' },
              { value: 'lowStock', label: 'Low stock' },
              { value: 'critical', label: 'Critical' },
            ]}
            error={editErrors.status?.message}
          />
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={viewModal} onClose={() => setViewModal(false)} title="Medicine details" subtitle={selected?.name} size="sm">
        {selected && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary text-lg font-bold">
                {selected?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-lg font-semibold text-on-surface">{selected?.name}</div>
                <div className="text-sm text-on-surface-variant">{selected?.brand}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Category</div>
                <div className="font-medium text-on-surface mt-0.5">{selected?.category}</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Stock</div>
                <div className="font-medium text-on-surface mt-0.5">{selected?.stock?.toLocaleString()}</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Reorder level</div>
                <div className="font-medium text-on-surface mt-0.5">{selected?.reorder}</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Price per tab</div>
                <div className="font-medium text-on-surface mt-0.5">{formatPKR(selected?.pricePerTab)}</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Price per strip</div>
                <div className="font-medium text-on-surface mt-0.5">{selected?.pricePerStrip ? formatPKR(selected?.pricePerStrip) : '—'}</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Price per pack</div>
                <div className="font-medium text-on-surface mt-0.5">{selected?.pricePerPack ? formatPKR(selected?.pricePerPack) : '—'}</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Expiry</div>
                <div className="font-medium text-on-surface mt-0.5">{selected?.expiry}</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Status</div>
                <div className="mt-1">
                  <Badge variant={statusColor(selected?.status)} dot>
                    {selected?.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={delModal}
        onClose={() => setDelModal(false)}
        title="Delete medicine"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDelModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={loading}>
              Delete
            </Button>
          </div>
        }
      >
        <div className="p-6">
          <p className="text-sm text-on-surface-variant">
            Are you sure you want to delete <strong className="text-on-surface">{selected?.name}</strong>? This action cannot be undone.
          </p>
        </div>
      </Modal>
    </>
  );
}
