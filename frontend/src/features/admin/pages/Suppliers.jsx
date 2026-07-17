import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Truck, Eye, Pencil, Trash2 } from 'lucide-react';
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
import { yupResolver, supplierCreateSchema, supplierEditSchema } from '../../../utils/validation';
import {
  getAllSuppliers,
  createSupplier,
  editSupplier,
  deleteSupplier,
} from '../../../services/supplierService';

const PER_PAGE = 8;

export default function Suppliers() {
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
    resolver: yupResolver(supplierCreateSchema),
    defaultValues: {
      name: '',
      contact: '',
      phone: '',
      status: 'active',
    },
  });

  // Edit Form Configuration
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm({
    resolver: yupResolver(supplierEditSchema),
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

  const fetchSuppliers = async () => {
    try {
      const data = await getAllSuppliers(query);
      setList(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch suppliers');
    }
  };

  useEffect(() => {
    fetchSuppliers();
    setPage(1);
  }, [query]);

  const filtered = list;
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openAdd = () => {
    resetAdd({
      name: '',
      contact: '',
      phone: '',
      status: 'active',
    });
    setModal(true);
  };

  const handleAdd = async (data) => {
    setLoading(true);
    try {
      const newSupplier = await createSupplier(data);
      setList((prev) => [newSupplier, ...prev]);
      toast.success(`${newSupplier.name} added as supplier`);
      setModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add supplier');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (s) => {
    setSelected(s);
    resetEdit({
      name: s.name,
      contact: s.contact,
      phone: s.phone,
      status: s.status === 'Active' ? 'active' : 'inactive',
    });
    setEditModal(true);
  };

  const handleEdit = async (data) => {
    setLoading(true);
    try {
      const updated = await editSupplier(selected.id, data);
      setList((prev) => prev.map((s) => (s.id === selected.id ? updated : s)));
      toast.success(`${updated.name} updated successfully`);
      setEditModal(false);
      setSelected(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update supplier');
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
      await deleteSupplier(selected.id);
      setList((prev) => prev.filter((s) => s.id !== selected.id));
      toast.success(`${selected?.name} deleted successfully`);
      setDelModal(false);
      setSelected(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete supplier');
    } finally {
      setLoading(false);
    }
  };

  const openView = (s) => {
    setSelected(s);
    setViewModal(true);
  };

  return (
    <>
      <PageHeader
        title="Suppliers"
        subtitle={`${list.length} active supplier relationships`}
        actions={
          <Button size="sm" icon={<Plus size={15} />} onClick={openAdd}>
            Add supplier
          </Button>
        }
      />

      <Card>
        <div className="px-5 py-4 border-b border-outline-variant/60">
          <SearchBar
            value={query}
            onChange={(v) => setQuery(v)}
            placeholder="Search suppliers…"
            className="w-full sm:max-w-xs"
          />
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Supplier</Th>
              <Th>Contact</Th>
              <Th>Phone</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <TableEmpty cols={5} message="No suppliers found" icon={<Truck size={32} />} />
            ) : (
              paginated.map((s, i) => (
                <motion.tr
                  key={s.id || s.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary/[0.16] text-secondary text-[10px] font-bold">
                        {s.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-on-surface">{s.name}</span>
                    </div>
                  </Td>
                  <Td className="text-sm">{s.contact}</Td>
                  <Td mono className="text-xs text-on-surface-variant">
                    {s.phone}
                  </Td>
                  <Td>
                    <Badge status={s.status} dot />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openView(s)} className="btn-ghost p-1.5 rounded-lg">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => openEdit(s)} className="btn-ghost p-1.5 rounded-lg">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => openDel(s)} className="btn-ghost p-1.5 rounded-lg text-error/70 hover:text-error hover:bg-error/[0.08]">
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
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </Card>

      {/* Add Modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Add supplier"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button form="supplier-form" type="submit" loading={loading}>
              Add supplier
            </Button>
          </div>
        }
      >
        <form id="supplier-form" onSubmit={handleSubmitAdd(handleAdd)} className="p-6 space-y-4">
          <Input
            label="Supplier name"
            {...registerAdd('name')}
            required
            placeholder="e.g. GSK Pakistan"
            error={addErrors.name?.message}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Contact person" {...registerAdd('contact')} required error={addErrors.contact?.message} />
            <Input label="Phone" {...registerAdd('phone')} required error={addErrors.phone?.message} />
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title="Edit supplier"
        subtitle={`Editing ${selected?.name}`}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditModal(false)}>
              Cancel
            </Button>
            <Button form="supplier-edit-form" type="submit" loading={loading}>
              Save changes
            </Button>
          </div>
        }
      >
        <form id="supplier-edit-form" onSubmit={handleSubmitEdit(handleEdit)} className="p-6 space-y-4">
          <Input
            label="Supplier name"
            {...registerEdit('name')}
            required
            error={editErrors.name?.message}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Contact person" {...registerEdit('contact')} required error={editErrors.contact?.message} />
            <Input label="Phone" {...registerEdit('phone')} required error={editErrors.phone?.message} />
          </div>
          <Select
            label="Status"
            {...registerEdit('status')}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Pending' },
            ]}
            error={editErrors.status?.message}
          />
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={viewModal} onClose={() => setViewModal(false)} title="Supplier Profile" subtitle={selected?.name} size="sm">
        {selected && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary/[0.16] text-secondary text-xl font-bold">
                {selected?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-lg font-semibold text-on-surface">{selected?.name}</div>
                <div className="text-sm text-on-surface-variant">{selected?.contact}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={delModal}
        onClose={() => setDelModal(false)}
        title="Delete Supplier"
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







