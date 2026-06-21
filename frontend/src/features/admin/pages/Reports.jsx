import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { KPICard } from '../../../components/charts/DashboardStats';
import RevenueChart from '../../../components/charts/RevenueChart';
import SalesChart from '../../../components/charts/SalesChart';
import InventoryChart from '../../../components/charts/InventoryChart';
// TODO: Replace with API calls — GET /api/admin/reports/revenue?period=...
const REV_DAILY = [
  { label: 'Mon', now: 42, last: 38 }, { label: 'Tue', now: 58, last: 51 },
  { label: 'Wed', now: 51, last: 44 }, { label: 'Thu', now: 67, last: 60 },
  { label: 'Fri', now: 82, last: 70 }, { label: 'Sat', now: 74, last: 65 }, { label: 'Sun', now: 45, last: 40 },
];
const REV_WEEKLY = [
  { label: 'W1', now: 280, last: 260 }, { label: 'W2', now: 340, last: 310 },
  { label: 'W3', now: 410, last: 370 }, { label: 'W4', now: 390, last: 355 },
];
const REV_MONTHLY = [
  { label: 'Jan', now: 920, last: 840 }, { label: 'Feb', now: 870, last: 800 },
  { label: 'Mar', now: 1050, last: 950 }, { label: 'Apr', now: 1120, last: 1020 },
  { label: 'May', now: 1280, last: 1140 }, { label: 'Jun', now: 1350, last: 1210 },
];
const REV_YEARLY = [
  { label: '2022', now: 8200, last: 0 }, { label: '2023', now: 10500, last: 8200 },
  { label: '2024', now: 13800, last: 10500 }, { label: '2025', now: 16200, last: 13800 },
];
// TODO: Replace with API call — GET /api/admin/reports/hourly-sales
const HOURS = [
  { h: '8am', v: 12 }, { h: '9am', v: 28 }, { h: '10am', v: 45 }, { h: '11am', v: 52 },
  { h: '12pm', v: 38 }, { h: '1pm', v: 30 }, { h: '2pm', v: 55 }, { h: '3pm', v: 62 },
  { h: '4pm', v: 48 }, { h: '5pm', v: 35 }, { h: '6pm', v: 22 }, { h: '7pm', v: 15 },
];


const KPIS = [
  { icon: <DollarSign size={18} />, value: 'Rs 7.24M', label: 'Monthly Revenue', delta: '11.5%', deltaDir: 'up', tone: 'success' },
  { icon: <ShoppingCart size={18} />, value: '9,840', label: 'Total Invoices', delta: '8.2%', deltaDir: 'up', tone: 'info' },
  { icon: <Package size={18} />, value: '142,600', label: 'Units Dispensed', delta: '4.7%', deltaDir: 'up', tone: 'default' },
  { icon: <TrendingUp size={18} />, value: 'Rs 736', label: 'Avg Invoice Value', delta: '2.8%', deltaDir: 'up', tone: 'success' },
];

const CATS = [
  { label: 'Antibiotics', value: 32 }, { label: 'Cardiac', value: 24 },
  { label: 'Analgesics', value: 18 }, { label: 'Vitamins', value: 14 }, { label: 'Others', value: 12 },
];

const REV_MAP = {
  Daily: { data: REV_DAILY, sub: 'Last 7 days · this week vs last week' },
  Weekly: { data: REV_WEEKLY, sub: 'Last 4 weeks · this month vs last month' },
  Monthly: { data: REV_MONTHLY, sub: 'Monthly · this year vs last' },
  Yearly: { data: REV_YEARLY, sub: 'Yearly revenue trend' },
};

export default function Reports() {
  const [revF, setRevF] = useState('Weekly');
  const { data: cData, sub: cSub } = REV_MAP[revF];
  const fmt = revF === 'Yearly' ? (v) => `Rs ${(v / 1000).toFixed(0)}k` : (v) => `Rs ${Math.round(v)}k`;

  return (
    <>
      <PageHeader title="Reports & Analytics" subtitle="Sales performance, revenue trends and top medicines." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {KPIS.map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <KPICard {...k} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        <Card>
          <CardHeader action={
            <div className="flex rounded-xl border border-outline-variant overflow-hidden">
              {Object.keys(REV_MAP).map((f) => (
                <button key={f} onClick={() => setRevF(f)} className={`px-3 py-1.5 text-xs font-medium transition-colors ${f === revF ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}>{f}</button>
              ))}
            </div>
          }>
            <CardTitle>Revenue Trend</CardTitle>
            <p className="text-xs text-on-surface-variant mt-0.5">{cSub}</p>
          </CardHeader>
          <CardBody>
            <RevenueChart data={cData} series={[{ key: 'now', name: 'Current', fill: true }, { key: 'last', name: 'Previous', fill: false }]} fmt={fmt} height={220} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Hourly Sales Distribution</CardTitle><p className="text-xs text-on-surface-variant mt-0.5">Avg transactions by hour</p></CardHeader>
          <CardBody>
            <SalesChart data={HOURS} dataKey="v" height={220} />
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card>
          <CardHeader><CardTitle>Sales by Category</CardTitle></CardHeader>
          <CardBody className="flex items-center gap-6">
            <InventoryChart data={CATS} height={180} />
            <div className="space-y-2.5 flex-1">
              {CATS.map((c, i) => {
                const COLORS = ['var(--color-primary)', 'var(--color-tertiary)', 'var(--color-warning)', 'var(--color-error)', 'var(--color-secondary)'];
                return (<div key={c.label} className="flex items-center gap-2.5 text-sm"><span className="h-2 w-2 rounded-full shrink-0" style={{ background: COLORS[i] }} /><span className="flex-1 text-on-surface-variant">{c.label}</span><span className="font-semibold text-on-surface">{c.value}%</span></div>);
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
