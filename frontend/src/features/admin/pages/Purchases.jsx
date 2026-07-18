import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Eye, ShoppingCart, Calendar, FileText, User, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { yupResolver, purchaseCreateSchema, medicineCreateSchema, handleInvalidSubmit } from '../../../utils/validation';
import { getAllPurchases, createPurchase, viewPurchase } from '../../../services/purchaseService';
import { getAllMedicines, createMedicine, getCategoryNames } from '../../../services/medicineService';
import { getAllSuppliers } from '../../../services/supplierService';

const perPage = 8;

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  
  const [modal, setModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [medModal, setMedModal] = useState(false);
  const [currentRowIndex, setCurrentRowIndex] = useState(null);
  const [expandedPackaging, setExpandedPackaging] = useState({});
  
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  // Purchase Form Configuration
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset: resetPurchase,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(purchaseCreateSchema),
    defaultValues: {
      supplierId: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      notes: '',
      items: [{
        medicineId: '',
        batchNumber: '',
        expiryDate: '',
        purchaseUnit: '',
        purchaseQty: '',
        costPrice: '',
        sellingPrice: '',
        location: '',
        packaging: []
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Watch items for live subtotal/total calculations
  const watchedItems = watch('items') || [];

  const getCalculatedQty = (item) => {
    const qty = Number(item.purchaseQty) || 0;
    if (qty <= 0) return 0;
    let total = qty;
    (item.packaging || []).forEach(step => {
      const f = Number(step.factor) || 1;
      total *= f;
    });
    return total;
  };

  const calculatedTotal = watchedItems.reduce((sum, item) => {
    const calculatedQty = getCalculatedQty(item);
    const cost = Number(item.costPrice) || 0;
    return sum + calculatedQty * cost;
  }, 0);

  // Mini Medicine Form Configuration
  const {
    register: registerMed,
    handleSubmit: handleSubmitMed,
    reset: resetMed,
    formState: { errors: medErrors },
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

  const fetchPurchases = async () => {
    try {
      const data = await getAllPurchases({ purchaseNumber: search });
      setPurchases(data);
    } catch (error) {
      toast.error('Failed to load purchases');
    }
  };

  const fetchDependencies = async () => {
    try {
      const medData = await getAllMedicines();
      setMedicines(medData || []);
      const supData = await getAllSuppliers();
      setSuppliers(supData || []);
      const catNames = await getCategoryNames();
      setCategories(catNames || []);
    } catch (error) {
      console.error('Failed to load purchase dependencies:', error);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [search]);

  useEffect(() => {
    fetchDependencies();
  }, []);

  const paginated = purchases.slice((page - 1) * perPage, page * perPage);

  const openAdd = () => {
    setExpandedPackaging({});
    resetPurchase({
      supplierId: suppliers[0]?.id || '',
      purchaseDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      notes: '',
      items: [{
        medicineId: '',
        batchNumber: '',
        expiryDate: '',
        purchaseUnit: 'Box',
        purchaseQty: '',
        costPrice: '',
        sellingPrice: '',
        location: '',
        packaging: [{ from: 'Box', to: 'Strip', factor: 10 }, { from: 'Strip', to: 'Tablet', factor: 10 }]
      }],
    });
    setModal(true);
  };

  const handleAddPurchase = async (data) => {
    setLoading(true);
    try {
      const result = await createPurchase(data);
      setPurchases((prev) => [result, ...prev]);
      toast.success(`Purchase invoice ${result.purchaseNumber} recorded successfully`);
      setModal(false);
      fetchDependencies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record purchase invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMedModal = (rowIndex) => {
    setCurrentRowIndex(rowIndex);
    resetMed({
      name: '',
      genericName: '',
      category: categories[0] || 'Antibiotics',
      manufacturer: '',
      saleUnit: '',
      sellingPrice: '',
      reorderLevel: '0',
    });
    setMedModal(true);
  };

  const handleAddMedicine = async (data) => {
    try {
      const newMed = await createMedicine(data);
      setMedicines((prev) => [...prev, newMed]);
      toast.success(`${newMed.name} added to catalog`);
      
      if (currentRowIndex !== null) {
        setValue(`items.${currentRowIndex}.medicineId`, newMed.id);
        setValue(`items.${currentRowIndex}.purchaseUnit`, 'Box');
        setValue(`items.${currentRowIndex}.packaging`, [
          { from: 'Box', to: 'Strip', factor: 10 },
          { from: 'Strip', to: newMed.saleUnit || 'Tablet', factor: 10 }
        ]);
      }
      setMedModal(false);
      setCurrentRowIndex(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add medicine');
    }
  };

  const handleOpenView = async (purchase) => {
    try {
      const details = await viewPurchase(purchase.id || purchase._id);
      setSelected(details);
      setViewModal(true);
    } catch (error) {
      toast.error('Failed to load purchase details');
    }
  };

  const addPackagingStep = (rowIdx) => {
    const currentSteps = watch(`items.${rowIdx}.packaging`) || [];
    const lastStep = currentSteps[currentSteps.length - 1];
    const newFrom = lastStep ? lastStep.to : (watch(`items.${rowIdx}.purchaseUnit`) || 'Box');
    setValue(`items.${rowIdx}.packaging`, [...currentSteps, { from: newFrom, to: '', factor: 1 }]);
  };

  const removePackagingStep = (rowIdx, stepIdx) => {
    const currentSteps = watch(`items.${rowIdx}.packaging`) || [];
    setValue(`items.${rowIdx}.packaging`, currentSteps.filter((_, idx) => idx !== stepIdx));
  };

  const togglePackagingExpand = (idx) => {
    setExpandedPackaging(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <>
      <PageHeader
        title="Purchases"
        subtitle={`${purchases.length} purchase receipts recorded`}
        actions={
          <Button size="sm" icon={<Plus size={15} />} onClick={openAdd}>
            Add purchase
          </Button>
        }
      />

      <Card>
        <div className="px-5 py-4 border-b border-outline-variant/60">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search by purchase number…"
            className="w-full sm:max-w-xs"
          />
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Purchase #</Th>
              <Th>Supplier</Th>
              <Th>Invoice #</Th>
              <Th>Date</Th>
              <Th align="right">Items count</Th>
              <Th align="right">Total amount</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <TableEmpty cols={8} message="No purchase records found" icon={<ShoppingCart size={32} />} />
            ) : (
              paginated.map((p, i) => (
                <motion.tr
                  key={p.id || p._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Td className="font-mono text-xs font-semibold text-primary">{p.purchaseNumber}</Td>
                  <Td className="text-sm font-medium">{p.supplierId?.name || '—'}</Td>
                  <Td>{p.invoiceId?.invoiceNumber || '—'}</Td>
                  <Td className="text-sm text-on-surface-variant">
                    {new Date(p.purchaseDate).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Td>
                  <Td align="right" className="tnum font-medium">{p.items?.length || 0}</Td>
                  <Td align="right" className="tnum font-bold text-on-surface">
                    {formatPKR(p.totalAmount)}
                  </Td>
                  <Td>
                    <Badge variant={p.status === 'received' ? 'success' : 'danger'}>
                      {p.status}
                    </Badge>
                  </Td>
                  <Td>
                    <button
                      onClick={() => handleOpenView(p)}
                      className="btn-ghost p-1.5 rounded-lg"
                      title="View Details"
                    >
                      <Eye size={15} />
                    </button>
                  </Td>
                </motion.tr>
              ))
            )}
          </tbody>
        </Table>
        <div className="px-5 py-4 border-t border-outline-variant/60">
          <Pagination page={page} total={purchases.length} perPage={perPage} onChange={setPage} />
        </div>
      </Card>

      {/* Add Purchase Modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Record Purchase Receipt"
        subtitle="Stock inventory by registering new medicine batches."
        size="2xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button form="purchase-form" type="submit" loading={loading}>
              Save Purchase
            </Button>
          </div>
        }
      >
        <form id="purchase-form" onSubmit={handleSubmit(handleAddPurchase, handleInvalidSubmit)} className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Supplier"
              {...register('supplierId')}
              options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
              error={errors.supplierId?.message}
              required
            />
            <Input
              label="Purchase Date"
              type="date"
              {...register('purchaseDate')}
              error={errors.purchaseDate?.message}
              required
            />
            <Select
              label="Payment Method"
              {...register('paymentMethod')}
              options={["Cash", "Card", "Bank Transfer", "Cheque"]}
              error={errors.paymentMethod?.message}
              required
            />
          </div>

          <div className="border-t border-outline-variant/60 pt-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-on-surface">Purchase Items</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => append({
                  medicineId: '',
                  batchNumber: '',
                  expiryDate: '',
                  purchaseUnit: 'Box',
                  purchaseQty: '',
                  costPrice: '',
                  sellingPrice: '',
                  location: '',
                  packaging: []
                })}
              >
                Add Product
              </Button>
            </div>

            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              {fields.map((field, idx) => {
                const selectedMedId = watchedItems[idx]?.medicineId;
                const activeMedicine = medicines.find(m => m.id === selectedMedId);
                const calculatedQty = getCalculatedQty(watchedItems[idx] || {});
                const isPackExpanded = !!expandedPackaging[idx];
                
                return (
                  <div key={field.id} className="bg-surface-container/20 p-4 rounded-xl border border-outline-variant/30 space-y-3">
                    <div className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-4">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-on-surface-variant">Medicine</label>
                          <button
                            type="button"
                            onClick={() => handleOpenMedModal(idx)}
                            className="text-[10px] text-primary hover:underline font-bold"
                          >
                            + Add New
                          </button>
                        </div>
                        <Select
                          {...register(`items.${idx}.medicineId`)}
                          options={medicines.map((m) => ({ value: m.id, label: `${m.name} (${m.manufacturer})` }))}
                          placeholder="Select medicine"
                          error={errors.items?.[idx]?.medicineId?.message}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          label="Batch #"
                          {...register(`items.${idx}.batchNumber`)}
                          placeholder="B-991"
                          error={errors.items?.[idx]?.batchNumber?.message}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          label="Expiry"
                          type="date"
                          {...register(`items.${idx}.expiryDate`)}
                          error={errors.items?.[idx]?.expiryDate?.message}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          label="Purchase Unit"
                          {...register(`items.${idx}.purchaseUnit`)}
                          placeholder="e.g. Box, Carton"
                          error={errors.items?.[idx]?.purchaseUnit?.message}
                        />
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5">
                        <div className="flex-1">
                          <Input
                            label="Purchase Qty"
                            type="number"
                            {...register(`items.${idx}.purchaseQty`)}
                            placeholder="100"
                            error={errors.items?.[idx]?.purchaseQty?.message}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(idx)}
                          disabled={fields.length === 1}
                          className="btn-ghost p-1.5 rounded-lg text-error hover:bg-error/8 disabled:opacity-40 mt-6"
                          title="Remove Row"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-3">
                        <Input
                          label="Cost Price / sale unit (Rs)"
                          type="number"
                          step="0.01"
                          {...register(`items.${idx}.costPrice`)}
                          placeholder="generic"
                          error={errors.items?.[idx]?.costPrice?.message}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          label="Selling Price / sale unit (Rs)"
                          type="number"
                          step="0.01"
                          {...register(`items.${idx}.sellingPrice`)}
                          placeholder="generic"
                          error={errors.items?.[idx]?.sellingPrice?.message}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          label="Storage Location"
                          {...register(`items.${idx}.location`)}
                          placeholder="e.g. Rack A-1"
                          error={errors.items?.[idx]?.location?.message}
                        />
                      </div>
                      <div className="col-span-3 flex justify-between items-center py-2.5 bg-surface-container-high/40 px-3 rounded-lg border border-outline-variant/30 text-xs">
                        <div>
                          <span className="text-on-surface-variant block font-medium">Calculated Stock</span>
                          <span className="font-bold text-primary text-sm tabular-nums">
                            {calculatedQty.toLocaleString()} {activeMedicine?.saleUnit || 'units'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => togglePackagingExpand(idx)}
                          className="text-xs text-primary hover:underline font-bold"
                        >
                          {isPackExpanded ? 'Hide Packaging' : 'Configure packaging'}
                        </button>
                      </div>
                    </div>

                    {/* Packaging Steps Chain Editor */}
                    <AnimatePresence>
                      {isPackExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/40 space-y-2.5 overflow-hidden"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                              Conversion Chains (Starting at {watchedItems[idx]?.purchaseUnit || 'Box'} &rarr; Ending at {activeMedicine?.saleUnit || 'tablet'})
                            </span>
                            <button
                              type="button"
                              onClick={() => addPackagingStep(idx)}
                              className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1"
                            >
                              + Add Step
                            </button>
                          </div>

                          <div className="space-y-2">
                            {(watchedItems[idx]?.packaging || []).length === 0 ? (
                              <div className="text-[11px] text-on-surface-variant text-center py-2">
                                No conversion steps defined. Stock quantity will equal raw purchase quantity.
                              </div>
                            ) : (
                              (watchedItems[idx]?.packaging || []).map((step, stepIdx) => (
                                <div key={stepIdx} className="flex items-center gap-2 bg-surface p-1.5 rounded-lg border border-outline-variant/30">
                                  <div className="flex-1">
                                    <Input
                                      placeholder="From (e.g. Box)"
                                      {...register(`items.${idx}.packaging.${stepIdx}.from`)}
                                      className="h-8 text-xs py-1"
                                    />
                                  </div>
                                  <ArrowRight size={13} className="text-on-surface-variant" />
                                  <div className="flex-1">
                                    <Input
                                      placeholder="To (e.g. Strip)"
                                      {...register(`items.${idx}.packaging.${stepIdx}.to`)}
                                      className="h-8 text-xs py-1"
                                    />
                                  </div>
                                  <div className="w-20">
                                    <Input
                                      type="number"
                                      placeholder="Factor"
                                      {...register(`items.${idx}.packaging.${stepIdx}.factor`)}
                                      className="h-8 text-xs py-1 text-center"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removePackagingStep(idx, stepIdx)}
                                    className="p-1 rounded text-error hover:bg-error/8"
                                    title="Remove Step"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-outline-variant/60 pt-4">
            <div className="w-1/2">
              <Input
                label="Notes"
                {...register('notes')}
                placeholder="Remarks about the supplier or delivery..."
              />
            </div>
            <div className="text-right">
              <span className="text-xs text-on-surface-variant block">Total Cost</span>
              <span className="text-xl font-bold text-primary tnum">{formatPKR(calculatedTotal)}</span>
            </div>
          </div>
        </form>
      </Modal>

      {/* View Purchase Details Modal */}
      <Modal
        open={viewModal}
        onClose={() => setViewModal(false)}
        title="Purchase Details"
        subtitle={selected?.purchaseNumber}
        size="lg"
      >
        {selected && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4 text-sm bg-surface-container/30 p-4 rounded-2xl border border-outline-variant/40">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-on-surface-variant flex items-center gap-1"><User size={13} /> Supplier</span>
                <span className="font-semibold text-on-surface">{selected.supplierId?.name}</span>
                <span className="text-xs text-on-surface-variant">{selected.supplierId?.contact} | {selected.supplierId?.phone}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-on-surface-variant flex items-center gap-1"><FileText size={13} /> Invoice #</span>
                <span className="font-semibold text-on-surface">{selected.invoiceId?.invoiceNumber || '—'}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-on-surface-variant flex items-center gap-1"><Calendar size={13} /> Date</span>
                <span className="font-semibold text-on-surface">
                  {new Date(selected.purchaseDate).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-on-surface-variant">Purchased Items</span>
              <div className="border border-outline-variant/60 rounded-xl overflow-hidden">
                <Table className="border-0">
                  <thead>
                    <tr className="bg-surface-container/30">
                      <Th className="py-2.5">Medicine</Th>
                      <Th className="py-2.5">Batch #</Th>
                      <Th align="right" className="py-2.5">Purchase Qty</Th>
                      <Th align="right" className="py-2.5">Calculated Stock</Th>
                      <Th align="right" className="py-2.5">Cost Price</Th>
                      <Th align="right" className="py-2.5">Selling Price</Th>
                      <Th align="right" className="py-2.5">Line Total</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.items?.map((item, idx) => (
                      <tr key={idx} className="border-t border-outline-variant/40">
                        <Td>
                          <div className="font-bold text-on-surface">{item.medicineId?.name}</div>
                          <div className="text-xs text-on-surface-variant font-medium italic">{item.medicineId?.genericName}</div>
                          {item.location && <div className="text-[10px] text-on-surface-variant font-semibold mt-0.5">Loc: {item.location}</div>}
                        </Td>
                        <Td className="tnum font-medium text-xs bg-surface-container-low/20 px-2 py-0.5 rounded text-center inline-block mt-3">{item.batchNumber}</Td>
                        <Td align="right" className="tnum font-semibold text-on-surface">
                          {item.purchaseQty?.toLocaleString()} {item.purchaseUnit}s
                        </Td>
                        <Td align="right" className="tnum font-bold text-primary">
                          {item.calculatedQty?.toLocaleString()} {item.medicineId?.saleUnit}s
                        </Td>
                        <Td align="right" className="tnum">{formatPKR(item.costPrice)} / {item.medicineId?.saleUnit}</Td>
                        <Td align="right" className="tnum">{formatPKR(item.sellingPrice)} / {item.medicineId?.saleUnit}</Td>
                        <Td align="right" className="tnum font-bold">{formatPKR(item.calculatedQty * item.costPrice)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-outline-variant/60 pt-4">
              <div className="w-2/3">
                <span className="text-xs text-on-surface-variant block">Notes</span>
                <p className="text-sm text-on-surface">{selected.notes || 'No remarks added.'}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-on-surface-variant block">Grand Total</span>
                <span className="text-lg font-bold text-primary tnum">{formatPKR(selected.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Nested Add Medicine Modal */}
      <Modal
        open={medModal}
        onClose={() => setMedModal(false)}
        title="Add new medicine product"
        subtitle="Quickly register product metadata inside purchase receipt."
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setMedModal(false)}>
              Cancel
            </Button>
            <Button form="med-quick-form" type="submit">
              Register Product
            </Button>
          </div>
        }
      >
        <form id="med-quick-form" onSubmit={handleSubmitMed(handleAddMedicine, handleInvalidSubmit)} className="p-6 grid grid-cols-2 gap-4">
          <Input
            label="Name"
            {...registerMed('name')}
            required
            placeholder="e.g. Augmentin 625mg"
          />
          <Input
            label="Generic Name"
            {...registerMed('genericName')}
            required
            placeholder="e.g. Co-amoxiclav"
            error={medErrors.genericName?.message}
          />
          <Input
            label="Manufacturer / Brand Owner"
            {...registerMed('manufacturer')}
            required
            placeholder="e.g. GSK, Abbott"
            error={medErrors.manufacturer?.message}
          />
          <Select
            label="Category"
            {...registerMed('category')}
            options={categories.filter(c => c !== 'All')}
            error={medErrors.category?.message}
          />
          <Input
            label="Sale Unit (Smallest Unit)"
            {...registerMed('saleUnit')}
            required
            placeholder="e.g. tablet, capsule, bottle, vial"
            error={medErrors.saleUnit?.message}
          />
          <Input
            label="Reorder level (units)"
            type="number"
            {...registerMed('reorderLevel')}
            min="0"
            error={medErrors.reorderLevel?.message}
          />
        </form>
      </Modal>
    </>
  );
}
