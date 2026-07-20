import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Pill, Eye, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
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
import DemoModal from '../../../components/common/DemoModal';
import { formatPKR } from '../../../utils/helpers';
import { yupResolver, medicineCreateSchema, medicineEditSchema, handleInvalidSubmit } from '../../../utils/validation';
import {
  getAllMedicines,
  createMedicine,
  editMedicine,
  deleteMedicine,
  getCategoryNames,
} from '../../../services/medicineService';

const DEFAULT_CATEGORIES = ['All', 'Antibiotics', 'Analgesics', 'Cardiac', 'Vitamins', 'Injections'];
const perPage = 8;

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [delModal, setDelModal] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
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
      genericName: '',
      category: 'Antibiotics',
      manufacturer: '',
      saleUnit: '',
      sellingPrice: '',
      reorderLevel: '0',
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
      genericName: '',
      category: 'Antibiotics',
      manufacturer: '',
      saleUnit: '',
      sellingPrice: '',
      reorderLevel: '0',
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
      genericName: '',
      category: categories.filter(c => c !== 'All')[0] || 'Antibiotics',
      manufacturer: '',
      saleUnit: '',
      sellingPrice: '',
      reorderLevel: '0',
    });
    setModal(true);
  };

  const handleAdd = async (data) => {
    setLoading(true);
    try {
      const newMedicine = await createMedicine(data);
      setMedicines((prev) => [...prev, newMedicine]);
      toast.success(`${newMedicine.name} added to medicine catalog`);
      setModal(false);
      fetchCategories();
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
      genericName: m.genericName,
      category: m.category,
      manufacturer: m.manufacturer,
      saleUnit: m.saleUnit,
      sellingPrice: String(m.sellingPrice),
      reorderLevel: String(m.reorder),
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
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update medicine');
    } finally {
      setLoading(false);
    }
  };

  const openDel = (m) => {
    setSelected(m);
    setDemoModalOpen(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteMedicine(selected.id);
      setMedicines((prev) => prev.filter((m) => m.id !== selected.id));
      toast.success('Medicine deleted from catalog');
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
        subtitle={`${medicines.length} medicines in product catalog`}
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
            placeholder="Search brand, generic name, or manufacturer…"
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
              <Th>Manufacturer</Th>
              <Th>Sale Unit</Th>
              <Th align="right">Selling Price</Th>
              <Th align="right">Stock Qty</Th>
              <Th>Expiry</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <TableEmpty cols={9} message="No medicines found" icon={<Pill size={32} />} />
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
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary text-xs font-bold">
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-on-surface">{m.name}</span>
                    </div>
                  </Td>
                  <Td>
                    <Badge variant="default">{m.category}</Badge>
                  </Td>
                  <Td className="text-sm text-on-surface-variant font-medium">
                    {m.manufacturer}
                  </Td>
                  <Td className="text-sm text-on-surface-variant">
                    {m.saleUnit}
                  </Td>
                  <Td align="right" className="text-sm font-semibold text-on-surface tnum">
                    {formatPKR(m.sellingPrice)}
                  </Td>
                  <Td align="right" className="text-sm font-semibold text-on-surface tnum">
                    {m.stock.toLocaleString()} {m.saleUnit}s
                  </Td>
                  <Td className="text-sm text-on-surface-variant tnum">{m.expiry || '—'}</Td>
                  <Td className="whitespace-nowrap">
                    <Badge status={m.status} dot className="whitespace-nowrap" />
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
        subtitle="Register a new medicine in the catalog."
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
        <form id="medicine-form" onSubmit={handleSubmitAdd(handleAdd, handleInvalidSubmit)} className="p-6 grid grid-cols-2 gap-4">
          <Input
            label="Name"
            {...registerAdd('name')}
            required
            placeholder="e.g. Augmentin 625mg"
            error={addErrors.name?.message}
          />
          <Input
            label="Generic Name"
            {...registerAdd('genericName')}
            required
            placeholder="e.g. Co-amoxiclav"
            error={addErrors.genericName?.message}
          />
          <Input
            label="Manufacturer / Brand Owner"
            {...registerAdd('manufacturer')}
            required
            placeholder="e.g. GSK, Abbott"
            error={addErrors.manufacturer?.message}
          />
          <Select
            label="Category"
            {...registerAdd('category')}
            options={categories.filter(c => c !== 'All')}
            error={addErrors.category?.message}
          />
          <Input
            label="Sale Unit (Smallest Unit)"
            {...registerAdd('saleUnit')}
            required
            placeholder="e.g. tablet, capsule, bottle, vial, tube"
            error={addErrors.saleUnit?.message}
          />
          <Input
            label="Reorder level (units)"
            type="number"
            {...registerAdd('reorderLevel')}
            min="0"
            error={addErrors.reorderLevel?.message}
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
        <form id="medicine-edit-form" onSubmit={handleSubmitEdit(handleEdit, handleInvalidSubmit)} className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2 grid grid-cols-3 gap-3 bg-surface-container/40 p-3 rounded-xl border border-outline-variant/30 text-xs">
            <div>
              <span className="text-on-surface-variant block font-medium">Total Stock</span>
              <span className="font-bold text-sm text-on-surface">{selected?.stock ?? 0} {selected?.saleUnit}s</span>
            </div>
            <div>
              <span className="text-on-surface-variant block font-medium">Nearest Expiry</span>
              <span className="font-bold text-sm text-on-surface">{selected?.expiry || '—'}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block font-medium">Status</span>
              <span className="block mt-0.5"><Badge status={selected?.status} dot>{selected?.status}</Badge></span>
            </div>
          </div>

          <Input
            label="Name"
            {...registerEdit('name')}
            required
            disabled
            error={editErrors.name?.message}
          />
          <Input
            label="Generic Name"
            {...registerEdit('genericName')}
            required
            placeholder="e.g. Co-amoxiclav"
            error={editErrors.genericName?.message}
          />
          <Input
            label="Manufacturer"
            {...registerEdit('manufacturer')}
            required
            placeholder="e.g. GSK, Abbott"
            error={editErrors.manufacturer?.message}
          />
          <Select
            label="Category"
            {...registerEdit('category')}
            options={categories.filter(c => c !== 'All')}
            error={editErrors.category?.message}
          />
          <Input
            label="Sale Unit (Smallest Unit)"
            {...registerEdit('saleUnit')}
            required
            placeholder="e.g. tablet, capsule, bottle"
            error={editErrors.saleUnit?.message}
          />
          <Input
            label="Selling Price per Sale Unit (Rs) - Synced from Batches"
            type="number"
            {...registerEdit('sellingPrice')}
            disabled
            error={editErrors.sellingPrice?.message}
          />
          <Input
            label="Reorder level (units)"
            type="number"
            {...registerEdit('reorderLevel')}
            min="0"
            error={editErrors.reorderLevel?.message}
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
                <div className="text-lg font-bold text-on-surface">{selected?.name}</div>
                <div className="text-sm text-on-surface-variant font-medium italic">{selected?.genericName}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Category</div>
                <div className="font-medium text-on-surface mt-0.5">{selected?.category}</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Manufacturer</div>
                <div className="font-medium text-on-surface mt-0.5">{selected?.manufacturer}</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Sale Unit</div>
                <div className="font-medium text-on-surface mt-0.5">{selected?.saleUnit}</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Selling Price</div>
                <div className="font-medium text-on-surface mt-0.5">{formatPKR(selected?.sellingPrice)} / {selected?.saleUnit}</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Stock Level</div>
                <div className="font-medium text-on-surface mt-0.5">{selected?.stock?.toLocaleString()} {selected?.saleUnit}s</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Reorder level</div>
                <div className="font-medium text-on-surface mt-0.5">{selected?.reorder} {selected?.saleUnit}s</div>
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

      <DemoModal
        open={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        actionName="Deleting medicine"
      />
    </>
  );
}
