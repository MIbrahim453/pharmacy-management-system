import { useState, useEffect, Fragment } from 'react';
import { toast } from 'sonner';
import { Package, AlertTriangle, Clock, TrendingDown, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import PageHeader from '../../../components/common/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Table, Th, Td, TableEmpty } from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import DemoModal from '../../../components/common/DemoModal';
import { KPICard } from '../../../components/charts/DashboardStats';
import { formatPKR } from '../../../utils/helpers';
import { yupResolver, batchEditSchema, handleInvalidSubmit } from '../../../utils/validation';
import {
  getInventoryStats,
  getInventoryList,
  editBatch,
  discardBatch,
} from '../../../services/inventoryService';
import { getAllSuppliers } from '../../../services/supplierService';

export default function Inventory() {
  const [stats, setStats] = useState({
    medInStock: 0,
    medLowStock: 0,
    medCritical: 0,
    belowReorderMedicines: 0,
    expiringIn30Days: 0,
    expired: 0,
    discarded: 0,
    totalActive: 0,
  });

  const [inventoryLists, setInventoryLists] = useState({
    allMedicines: [],
    lowStock: [],
    expireSoon: [],
    expired: [],
  });

  const [suppliers, setSuppliers] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedRows, setExpandedRows] = useState({});
  
  const [editModal, setEditModal] = useState(false);
  const [discardModal, setDiscardModal] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register: registerBatch,
    handleSubmit: handleSubmitBatch,
    reset: resetBatch,
    formState: { errors: batchErrors },
  } = useForm({
    resolver: yupResolver(batchEditSchema),
    defaultValues: {
      batchNumber: '',
      expiryDate: '',
      costPrice: '',
      currentQty: '',
      location: '',
      supplierId: '',
    },
  });

  const loadData = async () => {
    try {
      const statsData = await getInventoryStats();
      const listData = await getInventoryList();
      if (statsData) setStats(statsData);
      if (listData) setInventoryLists(listData);
    } catch (error) {
      toast.error('Failed to load inventory data');
    }
  };

  const loadSuppliers = async () => {
    try {
      const data = await getAllSuppliers();
      setSuppliers(data || []);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    }
  };

  useEffect(() => {
    loadData();
    loadSuppliers();
  }, []);

  const TABS = [
    { key: 'all', label: 'All', data: inventoryLists.allMedicines },
    { key: 'low', label: `Low Stock (${inventoryLists.lowStock.length})`, data: inventoryLists.lowStock },
    { key: 'expiring', label: `Expiring Soon (${inventoryLists.expireSoon.length})`, data: inventoryLists.expireSoon },
    { key: 'expired', label: `Expired (${inventoryLists.expired.length})`, data: inventoryLists.expired },
  ];

  const current = TABS.find((t) => t.key === activeTab)?.data || inventoryLists.allMedicines;

  const toggleRow = (medicineId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [medicineId]: !prev[medicineId],
    }));
  };

  const handleEditBatchSubmit = async (data) => {
    setLoading(true);
    try {
      await editBatch(selectedBatch.id, {
        batchNumber: data.batchNumber,
        expiryDate: data.expiryDate,
        costPrice: Number(data.costPrice),
        sellingPrice: Number(data.sellingPrice),
        currentQty: Number(data.currentQty),
        location: data.location || "",
        supplierId: data.supplierId || null,
      });
      toast.success(`Batch ${data.batchNumber} updated successfully`);
      setEditModal(false);
      setSelectedBatch(null);
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update batch');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscardBatchSubmit = async () => {
    setLoading(true);
    try {
      await discardBatch(selectedBatch.id);
      toast.success(`Batch ${selectedBatch.batchNumber} has been discarded`);
      setDiscardModal(false);
      setSelectedBatch(null);
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to discard batch');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (s) =>
    s === 'In stock' ? 'success' : s === 'Low stock' ? 'warning' : s === 'Critical' ? 'danger' : 'default';

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Monitor product catalog thresholds and track physical medicine batches."
      />

      {/* KPI Stats Panel */}
      <div className="space-y-4 mb-6">
        <div>
          <span className="text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-wider block mb-2">Medicine Catalog Summary</span>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard icon={<Package size={18} />} value={stats.medInStock.toString()} label="Medicines in Stock" tone="success" />
            <KPICard icon={<AlertTriangle size={18} />} value={stats.medLowStock.toString()} label="Medicines Low Stock" tone="warning" />
            <KPICard icon={<AlertTriangle size={18} />} value={stats.medCritical.toString()} label="Medicines Critical Stock" tone="danger" />
            <KPICard icon={<TrendingDown size={18} />} value={stats.belowReorderMedicines.toString()} label="Below Reorder level" tone="warning" />
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-wider block mb-2">Physical Batches Stock</span>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard icon={<Package size={18} />} value={stats.totalActive.toString()} label="Active Batches" tone="success" />
            <KPICard icon={<Clock size={18} />} value={stats.expiringIn30Days.toString()} label="Expiring in 30 days" tone="info" />
            <KPICard icon={<Clock size={18} />} value={stats.expired.toString()} label="Expired Batches" tone="danger" />
            <KPICard icon={<Clock size={18} />} value={stats.discarded.toString()} label="Discarded Batches" tone="default" />
          </div>
        </div>
      </div>

      <Card>
        <div className="flex border-b border-outline-variant/60 px-5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 -mb-px transition-colors ${
                t.key === activeTab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Medicine</Th>
              <Th>Category</Th>
              <Th align="right">Stock Qty</Th>
              <Th align="right">Reorder Level</Th>
              <Th className="whitespace-nowrap">Earliest Expiry</Th>
              <Th className="whitespace-nowrap">Status</Th>
              <Th className="whitespace-nowrap">Batches</Th>
            </tr>
          </thead>
          <tbody>
            {current.length === 0 ? (
              <TableEmpty cols={7} message="No items in this category" icon={<Package size={28} />} />
            ) : (
              current.map((m, i) => {
                const isExpanded = !!expandedRows[m.id];
                return (
                  <Fragment key={m.id || m.name}>
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Td>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleRow(m.id)}
                            className="p-1 rounded hover:bg-surface-container-high transition-colors"
                            title="Expand batches"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/[0.12] text-primary text-xs font-bold">
                            {m.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-on-surface">{m.name}</div>
                            <div className="text-xs text-on-surface-variant italic">{m.genericName}</div>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <Badge variant="default">{m.category}</Badge>
                      </Td>
                      <Td align="right">
                        <span
                          className={`text-sm font-semibold tnum ${
                            m.stock === 0
                              ? 'text-error'
                              : m.stock < m.reorder
                              ? 'text-warning'
                              : 'text-on-surface'
                          }`}
                        >
                          {m.stock.toLocaleString()} {m.saleUnit}s
                        </span>
                      </Td>
                      <Td align="right" className="text-sm text-on-surface-variant tnum">
                        {m.reorder} {m.saleUnit}s
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
                        {m.expiry || '—'}
                      </Td>
                      <Td className="whitespace-nowrap">
                        <Badge variant={statusColor(m.status)} dot>
                          {m.status}
                        </Badge>
                      </Td>
                      <Td>
                        <button
                          onClick={() => toggleRow(m.id)}
                          className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                        >
                          {m.batches?.length || 0} batches
                        </button>
                      </Td>
                    </motion.tr>

                    {/* Expandable Batches Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="bg-surface-container-low/40 p-4 border-t border-outline-variant/30">
                          <div className="pl-8 space-y-2">
                            <div className="text-xs font-semibold text-on-surface-variant">Active Batches for {m.name}</div>
                            <div className="border border-outline-variant/40 rounded-xl overflow-hidden bg-surface">
                              <Table className="border-0">
                                <thead>
                                  <tr className="bg-surface-container-low/50 text-[11px]">
                                    <Th className="py-2">Batch #</Th>
                                    <Th className="py-2">Supplier</Th>
                                    <Th className="py-2">Storage Loc</Th>
                                    <Th align="right" className="py-2">Cost Price</Th>
                                    <Th align="right" className="py-2">Selling Price</Th>
                                    <Th align="right" className="py-2">Current Stock</Th>
                                    <Th className="py-2 whitespace-nowrap">Expiry Date</Th>
                                    <Th className="py-2 whitespace-nowrap">Status</Th>
                                    <Th className="py-2 whitespace-nowrap">Actions</Th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {!m.batches || m.batches.length === 0 ? (
                                    <tr>
                                      <td colSpan={8} className="text-center py-4 text-xs text-on-surface-variant">
                                        No active batches in inventory. Create a purchase order to stock medicine.
                                      </td>
                                    </tr>
                                  ) : (
                                    m.batches.map((b) => (
                                      <tr key={b.id || b.batchNumber} className="border-t border-outline-variant/30 text-xs">
                                        <Td className="font-semibold text-on-surface">{b.batchNumber}</Td>
                                        <Td>{b.supplier}</Td>
                                        <Td className="font-semibold text-on-surface-variant">{b.location || '—'}</Td>
                                        <Td align="right" className="tnum font-medium">{formatPKR(b.costPrice)} / {m.saleUnit}</Td>
                                        <Td align="right" className="tnum font-medium">{formatPKR(b.sellingPrice)} / {m.saleUnit}</Td>
                                        <Td align="right" className="tnum font-bold text-primary">{b.currentQty.toLocaleString()} {m.saleUnit}s</Td>
                                        <Td className="tnum whitespace-nowrap">{b.expiry}</Td>
                                        <Td className="whitespace-nowrap">
                                          <Badge
                                            variant={
                                              b.status === 'Active'
                                                ? 'success'
                                                : b.status === 'Expired'
                                                ? 'danger'
                                                : 'default'
                                            }
                                          >
                                            {b.status}
                                          </Badge>
                                        </Td>
                                        <Td className="whitespace-nowrap">
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              onClick={() => {
                                                setSelectedBatch(b);
                                                setSelectedMedicine(m);
                                                resetBatch({
                                                  batchNumber: b.batchNumber,
                                                  expiryDate: b.expiryDateStr,
                                                  costPrice: String(b.costPrice),
                                                  sellingPrice: String(b.sellingPrice || 0),
                                                  currentQty: String(b.currentQty),
                                                  location: b.location || '',
                                                  supplierId: b.supplierId || '',
                                                });
                                                setEditModal(true);
                                              }}
                                              className="btn-ghost p-1 rounded hover:bg-surface-container-high"
                                              title="Edit Batch"
                                            >
                                              <Pencil size={13} />
                                            </button>
                                            {b.status !== 'Discarded' && b.currentQty > 0 && (
                                              <button
                                                onClick={() => {
                                                  setSelectedBatch(b);
                                                  setSelectedMedicine(m);
                                                  setDemoModalOpen(true);
                                                }}
                                                className="btn-ghost p-1 rounded hover:bg-error/8 text-error/70 hover:text-error"
                                                title="Discard Batch"
                                              >
                                                <Trash2 size={13} />
                                              </button>
                                            )}
                                          </div>
                                        </Td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </Table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </Table>
      </Card>

      {/* Edit Batch Modal */}
      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Inventory Batch"
        subtitle={`Editing batch details for ${selectedMedicine?.name}`}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditModal(false)}>
              Cancel
            </Button>
            <Button form="batch-edit-form" type="submit" loading={loading}>
              Save Batch
            </Button>
          </div>
        }
      >
        <form id="batch-edit-form" onSubmit={handleSubmitBatch(handleEditBatchSubmit, handleInvalidSubmit)} className="p-6 grid grid-cols-2 gap-4">
          <Input
            label="Batch Number"
            {...registerBatch('batchNumber')}
            required
            error={batchErrors.batchNumber?.message}
          />
          <Input
            label="Expiry Date"
            type="date"
            {...registerBatch('expiryDate')}
            required
            error={batchErrors.expiryDate?.message}
          />
           <Input
            label="Cost Price (Rs)"
            type="number"
            step="0.01"
            {...registerBatch('costPrice')}
            required
            error={batchErrors.costPrice?.message}
          />
          <Input
            label="Selling Price (Rs)"
            type="number"
            step="0.01"
            {...registerBatch('sellingPrice')}
            required
            error={batchErrors.sellingPrice?.message}
          />
          <Input
            label={`Current Stock (${selectedMedicine?.saleUnit || 'units'})`}
            type="number"
            {...registerBatch('currentQty')}
            required
            error={batchErrors.currentQty?.message}
          />
          <Input
            label="Storage Location"
            {...registerBatch('location')}
            error={batchErrors.location?.message}
          />
          <Select
            label="Supplier"
            {...registerBatch('supplierId')}
            containerClass="col-span-2"
            options={[{ value: '', label: 'No Supplier' }, ...suppliers.map((s) => ({ value: s.id, label: s.name }))]}
            error={batchErrors.supplierId?.message}
          />
        </form>
      </Modal>

      {/* Discard Batch Confirmation */}
      <Modal
        open={discardModal}
        onClose={() => setDiscardModal(false)}
        title="Discard Inventory Batch"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDiscardModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDiscardBatchSubmit} loading={loading}>
              Discard Stock
            </Button>
          </div>
        }
      >
        <div className="p-6">
          <p className="text-sm text-on-surface-variant">
            Are you sure you want to discard batch <strong className="text-on-surface">{selectedBatch?.batchNumber}</strong>?
            This will set its inventory level to <strong className="text-error">0 {selectedMedicine?.saleUnit || 'units'}</strong> and mark it as discarded. This action cannot be undone.
          </p>
        </div>
      </Modal>

      <DemoModal
        open={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        actionName="Discarding or deleting medicine batches"
      />
    </>
  );
}
