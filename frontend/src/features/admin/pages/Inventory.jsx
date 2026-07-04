import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Package, AlertTriangle, Clock, TrendingDown, PackagePlus } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../../components/common/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Table, Th, Td, TableEmpty } from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { KPICard } from '../../../components/charts/DashboardStats';
import { getInventoryStats, getInventoryList } from '../../../services/inventoryService';
import { updateMedicineStock } from '../../../services/medicineService';
import { getAllSuppliers } from '../../../services/supplierService';

export default function Inventory() {
  const [stats, setStats] = useState({
    medInStock: 0,
    belowReorderMedicines: 0,
    expiryIn30Days: 0,
    expired: 0,
  });
  const [inventoryLists, setInventoryLists] = useState({
    allMedicines: [],
    lowStock: [],
    expireSoon: [],
    expired: [],
  });
  
  const [activeTab, setActiveTab] = useState('all');
  const [orderModal, setOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({ supplierName: '', medicineName: '', quantity: '', paymentMethod: 'Bank Transfer' });
  const [stockModal, setStockModal] = useState(false);
  const [stockForm, setStockForm] = useState({ id: '', name: '', stock: '' });
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);

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
      const supplierData = await getAllSuppliers();
      setSuppliers(supplierData.map(s => s.name));
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
    { key: 'low', label: `Low stock (${inventoryLists.lowStock.length})`, data: inventoryLists.lowStock },
    { key: 'expiring', label: `Expiring soon (${inventoryLists.expireSoon.length})`, data: inventoryLists.expireSoon },
    { key: 'expired', label: `Expired (${inventoryLists.expired.length})`, data: inventoryLists.expired },
  ];
  const current = TABS.find((t) => t.key === activeTab)?.data || inventoryLists.allMedicines;
  const oField = (k, v) => setOrderForm((f) => ({ ...f, [k]: v }));

  const openReorder = (m) => {
    const defaultSupplier = suppliers.length > 0 ? suppliers[0] : 'No Suppliers Available';
    setOrderForm({
      supplierName: defaultSupplier,
      medicineName: m.name,
      quantity: String(m.reorder || 100),
      paymentMethod: 'Bank Transfer'
    });
    setOrderModal(true);
  };

  const handleOrder = async (e) => {
    e.preventDefault(); setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    toast.success(`Reorder placed: ${orderForm.quantity} units of ${orderForm.medicineName} from ${orderForm.supplierName}`);
    setOrderModal(false); setLoading(false);
  };

  const openStockUpdate = (m) => {
    setStockForm({ id: m.id, name: m.name, stock: String(m.stock) });
    setStockModal(true);
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateMedicineStock(stockForm.id, stockForm.stock);
      toast.success(`${stockForm.name} stock updated to ${stockForm.stock} packs`);
      setStockModal(false);
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stock quantity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Inventory" subtitle="Monitor stock levels, expiry dates and reorder alerts."
        actions={<Button size="sm" onClick={() => toast.info('Generating inventory report…')}>Export report</Button>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard icon={<Package size={18} />} value={stats.medInStock.toString()} label="In stock" tone="success" />
        <KPICard icon={<TrendingDown size={18} />} value={stats.belowReorderMedicines.toString()} label="Below reorder level" tone="warning" />
        <KPICard icon={<Clock size={18} />} value={stats.expiryIn30Days.toString()} label="Expiring in 30 days" tone="info" />
        <KPICard icon={<AlertTriangle size={18} />} value={stats.expired.toString()} label="Expired — remove" tone="danger" />
      </div>

      <Card>
        <div className="flex border-b border-outline-variant/60 px-5">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 -mb-px transition-colors ${t.key === activeTab ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <Table>
          <thead><tr>
            <Th>Medicine</Th><Th>Category</Th><Th align="right">Stock (Packs)</Th>
            <Th align="right">Reorder</Th><Th>Expiry</Th><Th>Status</Th><Th>Actions</Th>
          </tr></thead>
          <tbody>
            {current.length === 0
              ? <TableEmpty cols={7} message="No items in this category" icon={<Package size={28} />} />
              : current.map((m, i) => (
                <motion.tr key={m.id || m.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/[0.12] text-primary text-[10px] font-bold">{m.name.slice(0, 2).toUpperCase()}</div>
                      <div><div className="text-sm font-semibold text-on-surface">{m.name}</div><div className="text-xs text-on-surface-variant">{m.brand}</div></div>
                    </div>
                  </Td>
                  <Td><Badge variant="default">{m.category}</Badge></Td>
                  <Td align="right"><span className={`text-sm font-semibold tnum ${m.stock === 0 ? 'text-error' : m.stock < m.reorder ? 'text-warning' : 'text-on-surface'}`}>{m.stock.toLocaleString()}</span></Td>
                  <Td align="right" className="text-sm text-on-surface-variant tnum">{m.reorder}</Td>
                  <Td className={`text-sm ${m.exp === 'err' ? 'text-error font-semibold' : m.exp === 'warn' ? 'text-warning' : 'text-on-surface-variant'}`}>{m.expiry}</Td>
                  <Td><Badge status={m.status} dot /></Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openStockUpdate(m)} className="btn-ghost p-1.5 rounded-lg" title="Update stock"><PackagePlus size={15} /></button>
                      <button onClick={() => openReorder(m)} className="btn-ghost px-2 py-1 text-xs rounded-lg">Reorder</button>
                    </div>
                  </Td>
                </motion.tr>
              ))
            }
          </tbody>
        </Table>
      </Card>

      {/* Reorder Modal */}
      <Modal open={orderModal} onClose={() => setOrderModal(false)} title="Reorder Medicine" subtitle="Place a restock order with a supplier."
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setOrderModal(false)}>Cancel</Button><Button form="reorder-form" type="submit" loading={loading}>Place order</Button></div>}>
        <form id="reorder-form" onSubmit={handleOrder} className="p-6 space-y-4">
          <Select label="Supplier name" value={orderForm.supplierName} onChange={(e) => oField('supplierName', e.target.value)} options={suppliers} />
          <Input label="Medicine name" value={orderForm.medicineName} disabled />
          <Input label="Quantity" type="number" value={orderForm.quantity} onChange={(e) => oField('quantity', e.target.value)} required min="1" />
          <Select label="Payment method" value={orderForm.paymentMethod} onChange={(e) => oField('paymentMethod', e.target.value)} options={['Bank Transfer', 'Cheque', 'Cash', 'Credit']} />
        </form>
      </Modal>

      {/* Update Stock Modal */}
      <Modal open={stockModal} onClose={() => setStockModal(false)} title="Update Stock" subtitle={`Adjust pack quantity for ${stockForm.name}`}
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setStockModal(false)}>Cancel</Button><Button form="stock-form" type="submit" loading={loading}>Update stock</Button></div>}>
        <form id="stock-form" onSubmit={handleStockUpdate} className="p-6 space-y-4">
          <Input label="Medicine name" value={stockForm.name} disabled />
          <Input label="Stock quantity (packs)" type="number" value={stockForm.stock} onChange={(e) => setStockForm((f) => ({ ...f, stock: e.target.value }))} required min="0" />
        </form>
      </Modal>
    </>
  );
}
