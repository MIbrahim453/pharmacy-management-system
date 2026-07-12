import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Building2, Eye, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
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
import api from '../../../services/axios';
import { yupResolver, onboardPharmacySchema, editPharmacySchema } from '../../../utils/validation';

const PER_PAGE = 8;

export default function PharmaciesPage() {
  const [list, setList] = useState([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [delModal, setDelModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  // Onboard form configuration
  const {
    register: registerOnboard,
    handleSubmit: handleSubmitOnboard,
    reset: resetOnboard,
    formState: { errors: onboardErrors },
  } = useForm({
    resolver: yupResolver(onboardPharmacySchema),
    defaultValues: { pharmacyName: '', name: '', email: '', city: '', registrationNumber: '' },
  });

  // Edit form configuration
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm({
    resolver: yupResolver(editPharmacySchema),
    defaultValues: { pharmacy_name: '', city: '', registrationNumber: '', totalStaff: 0, status: 'inactive' },
  });

  // Fetch pharmacies from API
  const fetchPharmacies = async () => {
    try {
      const response = await api.get('/super-admin-pharmacies/all-pharmacies', {
        params: {
          searchTerm: query,
        },
      });
      setList(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch pharmacies');
    }
  };

  useEffect(() => {
    fetchPharmacies();
    setPage(1);
  }, [query]);

  // Handle client-side pagination
  const paginated = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleCreate = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/register-pharmacy', data);
      toast.success(`${data.pharmacyName} onboarded successfully!`);
      setModal(false);
      fetchPharmacies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to onboard pharmacy');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (data) => {
    setLoading(true);
    try {
      await api.put(`/super-admin-pharmacies/edit-pharmacy/${selected._id}`, data);
      toast.success(`${data.pharmacy_name} workspace updated!`);
      setEditModal(false);
      setSelected(null);
      fetchPharmacies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update pharmacy');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/super-admin-pharmacies/delete-pharmacy/${selected._id}`);
      toast.success(`${selected?.pharmacy_name} decommissioned successfully`);
      setDelModal(false);
      setSelected(null);
      fetchPharmacies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to decommission pharmacy');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (pharmacy) => {
    const newStatus = pharmacy.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/super-admin-pharmacies/change-status/${pharmacy._id}`, {
        status: newStatus,
      });
      toast.success(
        `${pharmacy.pharmacy_name} is now ${newStatus === 'active' ? 'Active' : 'Inactive'}`,
      );
      fetchPharmacies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change status');
    }
  };

  const openOnboard = () => {
    resetOnboard({
      pharmacyName: '',
      name: '',
      email: '',
      city: '',
      registrationNumber: '',
    });
    setModal(true);
  };

  const openView = (p) => {
    setSelected(p);
    setViewModal(true);
  };

  const openEdit = (p) => {
    setSelected(p);
    resetEdit({
      pharmacy_name: p.pharmacy_name,
      city: p.city,
      registrationNumber: p.registrationNumber || '',
      totalStaff: p.totalStaff || 0,
      status: p.status || 'inactive',
    });
    setEditModal(true);
  };

  const openDel = (p) => {
    setSelected(p);
    setDelModal(true);
  };

  return (
    <>
      <PageHeader
        title="Pharmacies"
        subtitle={`${list.length} pharmacies across the platform`}
        actions={
          <Button size="sm" icon={<Plus size={15} />} onClick={openOnboard}>
            Onboard pharmacy
          </Button>
        }
      />

      <Card>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-outline-variant/60">
          <SearchBar
            value={query}
            onChange={(v) => {
              setQuery(v);
            }}
            placeholder="Search pharmacies…"
            className="w-full sm:flex-1 sm:max-w-xs"
          />
          <div className="flex items-center gap-2 text-xs text-on-surface-variant sm:ml-auto flex-wrap">
            <span className="h-2 w-2 rounded-full bg-primary" />Active:{' '}
            {list.filter((p) => p.status === 'active').length}
            <span className="ml-2 h-2 w-2 rounded-full bg-outline-variant" />Inactive:{' '}
            {list.filter((p) => p.status === 'inactive').length}
            <span className="ml-2 h-2 w-2 rounded-full bg-error" />Suspended:{' '}
            {list.filter((p) => p.status === 'suspended').length}
          </div>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Pharmacy</Th>
              <Th>Admin</Th>
              <Th>City</Th>
              <Th align="right">Total Staff</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <TableEmpty cols={6} message="No pharmacies found" icon={<Building2 size={32} />} />
            ) : (
              paginated.map((p, i) => (
                <motion.tr
                  key={p._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/[0.12] text-primary text-xs font-bold">
                        {p.pharmacy_name[0]}
                      </div>
                      <span className="font-semibold text-on-surface text-sm">{p.pharmacy_name}</span>
                    </div>
                  </Td>
                  <Td className="text-sm">{p.owner?.name || 'N/A'}</Td>
                  <Td className="text-sm">{p.city}</Td>
                  <Td align="right" className="text-sm font-medium">
                    {p.totalStaff}
                  </Td>
                  <Td>
                    <Badge status={p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : ''} dot />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openView(p)} className="btn-ghost p-1.5 rounded-lg" title="View">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => openEdit(p)} className="btn-ghost p-1.5 rounded-lg" title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleStatusChange(p)}
                        className={`btn-ghost p-1.5 rounded-lg transition-colors ${
                          p.status === 'active'
                            ? 'text-primary/70 hover:text-primary hover:bg-primary/[0.08]'
                            : 'text-on-surface-variant/70 hover:text-on-surface-variant hover:bg-surface-container'
                        }`}
                        title={p.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {p.status === 'active' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                      <button
                        onClick={() => openDel(p)}
                        className="btn-ghost p-1.5 rounded-lg text-error/70 hover:text-error hover:bg-error/[0.08]"
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
          <Pagination page={page} total={list.length} perPage={PER_PAGE} onChange={setPage} />
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
            <Button variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button form="pharmacy-form" type="submit" loading={loading}>
              Create pharmacy
            </Button>
          </div>
        }
      >
        <form id="pharmacy-form" onSubmit={handleSubmitOnboard(handleCreate)} className="p-6 space-y-4">
          <Input
            label="Pharmacy name"
            {...registerOnboard('pharmacyName')}
            placeholder="e.g. MedPoint Pharmacy"
            error={onboardErrors.pharmacyName?.message}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Admin name"
              {...registerOnboard('name')}
              placeholder="Full name"
              error={onboardErrors.name?.message}
            />
            <Input
              label="Admin email"
              type="email"
              {...registerOnboard('email')}
              placeholder="admin@pharmacy.pk"
              error={onboardErrors.email?.message}
            />
          </div>
          <Input
            label="City"
            {...registerOnboard('city')}
            placeholder="City"
            error={onboardErrors.city?.message}
          />
          <Input
            label="Registration number"
            {...registerOnboard('registrationNumber')}
            placeholder="e.g. REG-12345"
            error={onboardErrors.registrationNumber?.message}
          />
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
        subtitle={`Editing workspace for ${selected?.pharmacy_name}`}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditModal(false)}>
              Cancel
            </Button>
            <Button form="pharmacy-edit-form" type="submit" loading={loading}>
              Save changes
            </Button>
          </div>
        }
      >
        <form id="pharmacy-edit-form" onSubmit={handleSubmitEdit(handleEdit)} className="p-6 space-y-4">
          <Input
            label="Pharmacy name"
            {...registerEdit('pharmacy_name')}
            error={editErrors.pharmacy_name?.message}
          />
          <Input
            label="City"
            {...registerEdit('city')}
            error={editErrors.city?.message}
          />
          <Input
            label="Registration number"
            {...registerEdit('registrationNumber')}
            error={editErrors.registrationNumber?.message}
          />
          <Input
            label="Total staff count"
            type="number"
            {...registerEdit('totalStaff')}
            min="0"
            error={editErrors.totalStaff?.message}
          />
          <Select
            label="Status"
            {...registerEdit('status')}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Suspended' },
            ]}
            error={editErrors.status?.message}
          />
        </form>
      </Modal>

      {/* View modal */}
      <Modal
        open={viewModal}
        onClose={() => setViewModal(false)}
        title="Pharmacy Profile"
        subtitle={selected?.pharmacy_name}
        size="sm"
      >
        {selected && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/[0.12] text-primary text-xl font-bold">
                {selected?.pharmacy_name?.[0]}
              </div>
              <div>
                <div className="text-lg font-semibold text-on-surface">{selected?.pharmacy_name}</div>
                <div className="text-sm text-on-surface-variant">{selected?.city}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Admin Name</div>
                <div className="font-medium text-on-surface mt-0.5">{selected?.owner?.name || 'N/A'}</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Admin Email</div>
                <div className="font-medium text-on-surface mt-0.5 truncate" title={selected?.owner?.email}>
                  {selected?.owner?.email || 'N/A'}
                </div>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Total Staff Count</div>
                <div className="font-medium text-on-surface mt-0.5">{selected?.totalStaff}</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3">
                <div className="text-on-surface-variant text-xs">Registration Number</div>
                <div className="font-medium text-on-surface mt-0.5">{selected?.registrationNumber || 'N/A'}</div>
              </div>
              <div className="rounded-xl bg-surface-container p-3 col-span-1 sm:col-span-2">
                <div className="text-on-surface-variant text-xs">Platform Status</div>
                <div className="mt-1">
                  <Badge status={selected?.status ? selected.status.charAt(0).toUpperCase() + selected.status.slice(1) : ''} dot />
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
        title="Delete Pharmacy Workspace"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDelModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={loading}>
              Decommission
            </Button>
          </div>
        }
      >
        <div className="p-6">
          <p className="text-sm text-on-surface-variant">
            Are you sure you want to delete <strong className="text-on-surface">{selected?.pharmacy_name}</strong>?
            This action terminates all user accounts and deletes all branch data.
          </p>
        </div>
      </Modal>
    </>
  );
}
