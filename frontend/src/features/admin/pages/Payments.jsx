import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CreditCard, Clock, CheckCircle, Truck, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../../components/common/PageHeader';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Table, Th, Td, TableEmpty } from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { KPICard } from '../../../components/charts/DashboardStats';
import { formatPKR } from '../../../utils/helpers';
import { getPayments, getPaymentStats } from '../../../services/paymentService';

export default function Payments() {
  const [rawPendingPayments, setRawPendingPayments] = useState([]);
  const [rawCollectedPayments, setRawCollectedPayments] = useState([]);
  const [rawSupplierPayments, setRawSupplierPayments] = useState([]);
  
  const [backendStats, setBackendStats] = useState({
    totalCustomerPendingPayments: 0,
    customerTotalPendingAmount: 0,
    totalCustomerPayments: 0,
    customerTotalPaidAmount: 0,
    totalSupplierPayments: 0,
    supplierTotalPaidAmount: 0
  });

  const [loading, setLoading] = useState(true);

  const fetchPaymentsData = async () => {
    setLoading(true);
    try {
      const [paymentsData, statsData] = await Promise.all([
        getPayments(),
        getPaymentStats()
      ]);

      if (paymentsData) {
        setRawPendingPayments(paymentsData.customerPendingPayments || []);
        setRawCollectedPayments(paymentsData.customerCollectedPayments || paymentsData.customerPayments || []);
        setRawSupplierPayments(paymentsData.supplierPayments || []);
      }

      if (statsData) {
        setBackendStats(statsData);
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      toast.error(error.response?.data?.message || "Failed to load payments data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Helper mapper to normalize Mongoose Invoice fields to UI fields
  const mapToUI = (item) => ({
    id: item.invoiceId || item._id,
    invoiceId: item.invoiceId || item._id,
    invoiceNumber: item.invoiceNumber || item.id || '—',
    customer: item.customer || item.customerName || '—',
    amount: item.amount !== undefined ? item.amount : (item.grandTotal || 0),
    method: item.method || item.paymentMethod || 'Cash',
    status: item.status || item.paymentStatus || 'Unpaid',
    date: item.date || item.createdAt,
    supplier: item.supplier || item.supplierId?.name || item.customerName || '—'
  });

  const customerPendingList = rawPendingPayments.map(mapToUI);
  const customerCollectedList = rawCollectedPayments.map(mapToUI);
  const supplierList = rawSupplierPayments.map(mapToUI);

  return (
    <>
      <PageHeader 
        title="Payments" 
        subtitle="Track customer and supplier payments." 
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={14} className={loading ? "animate-spin" : ""} />}
            onClick={fetchPaymentsData}
            disabled={loading}
          >
            Refresh Dashboard
          </Button>
        }
      />

      {/* KPI Cards section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPICard 
          icon={<Clock size={18} />} 
          value={formatPKR(backendStats.customerTotalPendingAmount)} 
          label={`Customer pending · ${backendStats.totalCustomerPendingPayments}`} 
          tone="warning" 
        />
        <KPICard 
          icon={<CheckCircle size={18} />} 
          value={formatPKR(backendStats.customerTotalPaidAmount)} 
          label={`Customer collected · ${backendStats.totalCustomerPayments}`} 
          tone="success" 
        />
        <KPICard 
          icon={<Truck size={18} />} 
          value={formatPKR(backendStats.supplierTotalPaidAmount)} 
          label={`Paid to suppliers · ${backendStats.totalSupplierPayments}`} 
          tone="info" 
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant/70 bg-surface rounded-2xl border border-outline-variant/60 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm font-medium">Loading payments dashboard...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
            {/* Pending Invoices */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Customer Payments</CardTitle>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {customerPendingList.length} invoices · {formatPKR(backendStats.customerTotalPendingAmount)}
                </p>
              </CardHeader>
              <Table>
                <thead>
                  <tr>
                    <Th>Invoice</Th>
                    <Th>Customer</Th>
                    <Th className="text-right">Amount</Th>
                  </tr>
                </thead>
                <tbody>
                  {customerPendingList.length === 0 ? (
                    <TableEmpty cols={3} message="No pending payments" icon={<CheckCircle size={28} />} />
                  ) : (
                    customerPendingList.map((inv) => (
                      <motion.tr 
                        key={inv.invoiceId} 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                      >
                        <Td>
                          <span className="font-mono text-xs text-primary font-semibold">
                            {inv.invoiceNumber}
                          </span>
                        </Td>
                        <Td className="text-sm">{inv.customer}</Td>
                        <Td className="text-right text-sm font-semibold text-on-surface tabular-nums">
                          {formatPKR(inv.amount)}
                        </Td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card>

            {/* Collected Invoices */}
            <Card>
              <CardHeader>
                <CardTitle>Collected Customer Payments</CardTitle>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {customerCollectedList.length} invoices · {formatPKR(backendStats.customerTotalPaidAmount)}
                </p>
              </CardHeader>
              <Table>
                <thead>
                  <tr>
                    <Th>Invoice</Th>
                    <Th>Customer</Th>
                    <Th className="text-right">Amount</Th>
                    <Th>Method</Th>
                  </tr>
                </thead>
                <tbody>
                  {customerCollectedList.length === 0 ? (
                    <TableEmpty cols={4} message="No paid invoices" icon={<CreditCard size={28} />} />
                  ) : (
                    customerCollectedList.map((inv) => (
                      <motion.tr 
                        key={inv.invoiceId} 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                      >
                        <Td>
                          <span className="font-mono text-xs text-primary font-semibold">
                            {inv.invoiceNumber}
                          </span>
                        </Td>
                        <Td className="text-sm">{inv.customer}</Td>
                        <Td className="text-right text-sm font-semibold text-primary tabular-nums">
                          {formatPKR(inv.amount)}
                        </Td>
                        <Td><Badge variant="default">{inv.method}</Badge></Td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card>
          </div>

          {/* Supplier Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Supplier Payments</CardTitle>
              <p className="text-xs text-on-surface-variant mt-0.5">Payments made to medicine suppliers</p>
            </CardHeader>
            <Table>
              <thead>
                <tr>
                  <Th>ID</Th>
                  <Th>Supplier</Th>
                  <Th>Date</Th>
                  <Th className="text-right">Amount</Th>
                  <Th>Method</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {supplierList.length === 0 ? (
                  <TableEmpty cols={6} message="No supplier payments recorded" icon={<Truck size={28} />} />
                ) : (
                  supplierList.map((p) => (
                    <motion.tr 
                      key={p.invoiceId} 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                    >
                      <Td>
                        <span className="font-mono text-xs font-semibold text-secondary">
                          {p.invoiceNumber}
                        </span>
                      </Td>
                      <Td className="text-sm font-medium text-on-surface">{p.supplier}</Td>
                      <Td className="text-xs text-on-surface-variant">{formatDate(p.date)}</Td>
                      <Td className="text-right text-sm font-semibold text-on-surface tabular-nums">
                        {formatPKR(p.amount)}
                      </Td>
                      <Td><Badge variant="default">{p.method}</Badge></Td>
                      <Td><Badge status={p.status === 'Paid' ? 'Paid' : 'Unpaid'} dot>{p.status}</Badge></Td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card>
        </>
      )}
    </>
  );
}
