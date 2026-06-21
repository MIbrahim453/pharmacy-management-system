import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, TrendingUp } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { KPICard } from '../../../components/charts/DashboardStats';
import SalesChart from '../../../components/charts/SalesChart';
import InventoryChart from '../../../components/charts/InventoryChart';
// TODO: Replace with API call — GET /api/super-admin/analytics/hourly
const HOURS = [
  { h: '8am', v: 12 }, { h: '9am', v: 28 }, { h: '10am', v: 45 }, { h: '11am', v: 52 },
  { h: '12pm', v: 38 }, { h: '1pm', v: 30 }, { h: '2pm', v: 55 }, { h: '3pm', v: 62 },
  { h: '4pm', v: 48 }, { h: '5pm', v: 35 }, { h: '6pm', v: 22 }, { h: '7pm', v: 15 },
];


const KPIS = [
  { icon: <Building2 size={19} />, value: '42', label: 'Active pharmacies', delta: '+3', deltaDir: 'up', tone: 'default' },
  { icon: <Users size={19} />, value: '284', label: 'Platform users', delta: '12.4%', deltaDir: 'up', tone: 'info' },
  { icon: <TrendingUp size={19} />, value: '1.48M', label: 'Items processed', delta: '7.2%', deltaDir: 'up', tone: 'success' },
];

const CITY_DATA = [
  { label: 'Karachi', value: 38 },
  { label: 'Lahore', value: 28 },
  { label: 'Islamabad', value: 18 },
  { label: 'Faisalabad', value: 10 },
  { label: 'Others', value: 6 },
];

export default function Analytics() {
  const [range, setRange] = useState('6w');

  return (
    <>
      <PageHeader
        title="Platform Analytics"
        subtitle="Aggregated metrics across all pharmacies."
        actions={
          <div className="flex rounded-xl border border-outline-variant overflow-hidden">
            {['4w', '6w', '3m', '12m'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${r === range
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {KPIS.map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <KPICard {...k} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card>
          <CardHeader><CardTitle>Hourly Sign Ins</CardTitle><p className="text-xs text-on-surface-variant mt-0.5">Average sign ins by hour</p></CardHeader>
          <CardBody>
            <SalesChart data={HOURS} dataKey="v" height={220} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pharmacy by City</CardTitle></CardHeader>
          <CardBody className="flex items-center gap-6">
            <InventoryChart data={CITY_DATA} height={180} />
            <div className="space-y-2.5 flex-1">
              {CITY_DATA.map((d, i) => {
                const COLORS = ['var(--color-primary)', 'var(--color-tertiary)', 'var(--color-warning)', 'var(--color-error)', 'var(--color-secondary)'];
                return (
                  <div key={d.label} className="flex items-center gap-2.5 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                    <span className="flex-1 text-on-surface-variant">{d.label}</span>
                    <span className="font-semibold text-on-surface">{d.value}%</span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
