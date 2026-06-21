import { useState } from 'react';
import { toast } from 'sonner';
import { CreditCard, Clock, CheckCircle, DollarSign, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../../components/common/PageHeader';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Table, Th, Td, TableEmpty } from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import { KPICard } from '../../../components/charts/DashboardStats';
import { formatPKR } from '../../../utils/helpers';

// TODO: Replace with API call — GET /api/admin/invoices
const INITIAL_INVOICES = [
  { id: 'INV-260101-1001', customer: 'Ahmed Raza', amount: 4200, status: 'Unpaid', method: 'Cash', date: '1 Jan 2026' },
  { id: 'INV-260101-1002', customer: 'Sara Khan', amount: 1850, status: 'Paid', method: 'Card', date: '1 Jan 2026' },
  { id: 'INV-260102-1003', customer: 'Usman Ali', amount: 6300, status: 'Unpaid', method: 'Bank', date: '2 Jan 2026' },
  { id: 'INV-260102-1004', customer: 'Fatima Sheikh', amount: 920, status: 'Paid', method: 'Cash', date: '2 Jan 2026' },
  { id: 'INV-260103-1005', customer: 'Bilal Hassan', amount: 3100, status: 'Unpaid', method: 'Cash', date: '3 Jan 2026' },
  { id: 'INV-260103-1006', customer: 'Zainab Mir', amount: 7800, status: 'Paid', method: 'Card', date: '3 Jan 2026' },
];

// TODO: Replace with API call — GET /api/admin/supplier-payments
const SUPPLIER_PAYMENTS = [
  { id: 'SP-001', supplier: 'GSK Pakistan', date: '15 Dec 2025', amount: 125000, method: 'Bank Transfer', note: 'Monthly supply payment', status: 'Paid' },
  { id: 'SP-002', supplier: 'Abbott Pakistan', date: '10 Dec 2025', amount: 87500, method: 'Cheque', note: 'Q4 settlement', status: 'Paid' },
  { id: 'SP-003', supplier: 'Merck Pakistan', date: '5 Dec 2025', amount: 60000, method: 'Bank Transfer', note: 'Partial advance payment', status: 'Pending' },
  { id: 'SP-004', supplier: 'Sanofi Pakistan', date: '1 Dec 2025', amount: 210000, method: 'Cash', note: 'Bulk order settlement', status: 'Paid' },
];

export default function Payments() {
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);

  const pending = invoices.filter((i) => i.status === 'Unpaid');
  const paid = invoices.filter((i) => i.status === 'Paid');

  const pendingTotal = pending.reduce((s, i) => s + i.amount, 0);
  const paidTotal = paid.reduce((s, i) => s + i.amount, 0);
  const supplierPaidTotal = SUPPLIER_PAYMENTS.filter((p) => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const supplierPendingTotal = SUPPLIER_PAYMENTS.filter((p) => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);

  const markPaid = (id) => {
    // TODO: Replace with API call — PUT /api/admin/invoices/:id/mark-paid
    setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, status: 'Paid' } : i));
    toast.success(`${id} marked as paid`);
  };

  return (
    <>
      <PageHeader title="Payments" subtitle="Track customer and supplier payments." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard icon={<Clock size={18} />} value={formatPKR(pendingTotal)} label={`Customer pending · ${pending.length}`} tone="warning" />
        <KPICard icon={<CheckCircle size={18} />} value={formatPKR(paidTotal)} label={`Customer collected · ${paid.length}`} tone="success" />
        <KPICard icon={<Truck size={18} />} value={formatPKR(supplierPaidTotal)} label="Paid to suppliers" tone="info" />
        <KPICard icon={<DollarSign size={18} />} value={formatPKR(supplierPendingTotal)} label="Pending to suppliers" tone="danger" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        {/* Pending */}
        <Card>
          <CardHeader><CardTitle>Pending Customer Payments</CardTitle><p className="text-xs text-on-surface-variant mt-0.5">{pending.length} invoices · {formatPKR(pendingTotal)}</p></CardHeader>
          <Table>
            <thead><tr><Th>Invoice</Th><Th>Customer</Th><Th className="text-right">Amount</Th><Th>Actions</Th></tr></thead>
            <tbody>
              {pending.length === 0
                ? <TableEmpty cols={4} message="No pending payments" icon={<CheckCircle size={28} />} />
                : pending.map((inv, i) => (
                  <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <Td><span className="font-mono text-xs text-primary font-semibold">{inv.id}</span></Td>
                    <Td className="text-sm">{inv.customer}</Td>
                    <Td className="text-right text-sm font-semibold text-on-surface tabular-nums">{formatPKR(inv.amount)}</Td>
                    <Td><button onClick={() => markPaid(inv.id)} className="btn-ghost px-2 py-1 text-xs rounded-lg text-primary">Mark paid</button></Td>
                  </motion.tr>
                ))
              }
            </tbody>
          </Table>
        </Card>

        {/* Collected */}
        <Card>
          <CardHeader><CardTitle>Collected Customer Payments</CardTitle><p className="text-xs text-on-surface-variant mt-0.5">{paid.length} invoices · {formatPKR(paidTotal)}</p></CardHeader>
          <Table>
            <thead><tr><Th>Invoice</Th><Th>Customer</Th><Th className="text-right">Amount</Th><Th>Method</Th></tr></thead>
            <tbody>
              {paid.length === 0
                ? <TableEmpty cols={4} message="No paid invoices" icon={<CreditCard size={28} />} />
                : paid.map((inv, i) => (
                  <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <Td><span className="font-mono text-xs text-primary font-semibold">{inv.id}</span></Td>
                    <Td className="text-sm">{inv.customer}</Td>
                    <Td className="text-right text-sm font-semibold text-primary tabular-nums">{formatPKR(inv.amount)}</Td>
                    <Td><Badge variant="default">{inv.method}</Badge></Td>
                  </motion.tr>
                ))
              }
            </tbody>
          </Table>
        </Card>
      </div>

      {/* Supplier Payments */}
      <Card>
        <CardHeader><CardTitle>Supplier Payments</CardTitle><p className="text-xs text-on-surface-variant mt-0.5">Payments made to medicine suppliers</p></CardHeader>
        <Table>
          <thead><tr><Th>ID</Th><Th>Supplier</Th><Th>Date</Th><Th className="text-right">Amount</Th><Th>Method</Th><Th>Note</Th><Th>Status</Th></tr></thead>
          <tbody>
            {SUPPLIER_PAYMENTS.map((p, i) => (
              <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <Td><span className="font-mono text-xs font-semibold text-secondary">{p.id}</span></Td>
                <Td className="text-sm font-medium text-on-surface">{p.supplier}</Td>
                <Td className="text-xs text-on-surface-variant">{p.date}</Td>
                <Td className="text-right text-sm font-semibold text-on-surface tabular-nums">{formatPKR(p.amount)}</Td>
                <Td><Badge variant="default">{p.method}</Badge></Td>
                <Td className="text-xs text-on-surface-variant max-w-[180px] truncate">{p.note}</Td>
                <Td><Badge status={p.status === 'Paid' ? 'Paid' : 'Unpaid'} dot>{p.status}</Badge></Td>
              </motion.tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
