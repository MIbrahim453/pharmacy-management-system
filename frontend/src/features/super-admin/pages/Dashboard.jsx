import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Building2, Users, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { KPICard } from '../../../components/charts/DashboardStats';
import RevenueChart from '../../../components/charts/RevenueChart';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { Table, Th, Td } from '../../../components/ui/Table';
// TODO: Replace with API call — GET /api/super-admin/pharmacies
const PHARMACIES = [
  { name: 'MedPoint Karachi', admin: 'Ahmed Raza', city: 'Karachi', users: 8, status: 'Active' },
  { name: 'LifeCare Lahore', admin: 'Sara Khan', city: 'Lahore', users: 5, status: 'Active' },
  { name: 'PharmaPlus ISB', admin: 'Usman Ali', city: 'Islamabad', users: 3, status: 'Active' },
  { name: 'CureMart Faisalabad', admin: 'Zainab Mir', city: 'Faisalabad', users: 4, status: 'Suspended' },
  { name: 'HealthHub Karachi', admin: 'Bilal Hassan', city: 'Karachi', users: 6, status: 'Active' },
];
// TODO: Replace with API call — GET /api/super-admin/signups?period=...
const SIGNUPS_DAILY = [{ label: 'Mon', signups: 4 }, { label: 'Tue', signups: 7 }, { label: 'Wed', signups: 5 }, { label: 'Thu', signups: 9 }, { label: 'Fri', signups: 12 }, { label: 'Sat', signups: 6 }, { label: 'Sun', signups: 3 }];
const SIGNUPS_WEEKLY = [{ label: 'W1', signups: 18 }, { label: 'W2', signups: 24 }, { label: 'W3', signups: 31 }, { label: 'W4', signups: 28 }];
const SIGNUPS_MONTHLY = [{ label: 'Jan', signups: 42 }, { label: 'Feb', signups: 38 }, { label: 'Mar', signups: 55 }, { label: 'Apr', signups: 48 }, { label: 'May', signups: 62 }, { label: 'Jun', signups: 70 }];
const SIGNUPS_YEARLY = [{ label: '2022', signups: 180 }, { label: '2023', signups: 320 }, { label: '2024', signups: 480 }, { label: '2025', signups: 610 }];


const KPIS = [
  { icon: <Building2 size={19} />, value: '42', label: 'Total Pharmacies · 6 cities', delta: '+3', deltaDir: 'up', tone: 'default' },
  { icon: <Users size={19} />, value: '284', label: 'Active Users · 3 roles', delta: '12.4%', deltaDir: 'up', tone: 'info' },
  { icon: <TrendingUp size={19} />, value: '96.4%', label: 'Avg Pharmacy Uptime', delta: '0.3%', deltaDir: 'up', tone: 'success' },
];

const FILTER_MAP = {
  Daily: SIGNUPS_DAILY,
  Weekly: SIGNUPS_WEEKLY,
  Monthly: SIGNUPS_MONTHLY,
  Yearly: SIGNUPS_YEARLY,
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [signupFilter, setSignupFilter] = useState('Weekly');

  const chartData = FILTER_MAP[signupFilter];

  return (
    <>
      <PageHeader
        title="Platform Overview"
        subtitle="Monitor all pharmacies, users and platform-wide metrics."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => toast.info('Export triggered')}>
              Export report
            </Button>
            <Button size="sm" icon={<Plus size={15} />} onClick={() => navigate('/super-admin/pharmacies')}>
              Add pharmacy
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {KPIS.map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <KPICard {...k} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        {/* Sign-ups chart */}
        <Card className="xl:col-span-2">
          <CardHeader action={
            <div className="flex rounded-xl border border-outline-variant overflow-hidden">
              {Object.keys(FILTER_MAP).map((f) => (
                <button
                  key={f}
                  onClick={() => setSignupFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${f === signupFilter
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          }>
            <CardTitle>Sign Ups</CardTitle>
            <p className="text-xs text-on-surface-variant mt-0.5">{signupFilter} sign-up trend</p>
          </CardHeader>
          <CardBody>
            <RevenueChart
              data={chartData}
              series={[
                { key: 'signups', name: 'Sign Ups', fill: true },
              ]}
              fmt={(v) => `${v}`}
              height={230}
            />
          </CardBody>
        </Card>

        {/* Platform Health — plans only */}
        <Card>
          <CardHeader><CardTitle>Platform Health</CardTitle></CardHeader>
          <CardBody className="space-y-2">
            {[
              ['Active pharmacies', '38 / 42'],
              ['On trial', '4'],
              ['Suspended', '1'],
              ['Avg users/pharmacy', '6.7'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm border-b border-outline-variant/60 pb-2 last:border-0">
                <span className="text-on-surface-variant">{k}</span>
                <span className="font-semibold text-on-surface">{v}</span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Recent pharmacies */}
      <Card>
        <CardHeader action={
          <Button variant="ghost" size="sm" icon={<ArrowRight size={14} />} onClick={() => navigate('/super-admin/pharmacies')}>
            View all
          </Button>
        }>
          <CardTitle>Recent Pharmacies</CardTitle>
          <p className="text-xs text-on-surface-variant mt-0.5">Last 5 onboarded</p>
        </CardHeader>
        <Table>
          <thead>
            <tr>
              <Th>Pharmacy</Th><Th>Admin</Th><Th>City</Th>
              <Th align="right">Users</Th><Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {PHARMACIES.slice(0, 5).map((p) => (
              <tr key={p.name}>
                <Td><span className="font-semibold text-on-surface">{p.name}</span></Td>
                <Td>{p.admin}</Td>
                <Td>{p.city}</Td>
                <Td align="right">{p.users}</Td>
                <Td><Badge status={p.status} dot /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
