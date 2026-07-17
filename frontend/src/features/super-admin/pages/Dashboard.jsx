import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Building2, Users, Plus, ArrowRight } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { KPICard } from '../../../components/charts/DashboardStats';
import RevenueChart from '../../../components/charts/RevenueChart';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { Table, Th, Td } from '../../../components/ui/Table';
import api from '../../../services/axios';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
  '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
};

const FILTER_OPTIONS = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

/**
 * Convert backend label to friendly chart label based on the selected period.
 * Daily:   "2026-07-01" → "Tue"
 * Weekly:  "Week 1"     → "W1"
 * Monthly: "07"         → "Jul"
 * Yearly:  "2026"       → "2026"
 */
function formatLabel(raw, period) {
  switch (period) {
    case 'Daily': {
      const d = new Date(raw);
      return Number.isNaN(d.getTime()) ? raw : DAY_NAMES[d.getUTCDay()];
    }
    case 'Weekly':
      return raw.replace('Week ', 'W');
    case 'Monthly':
      return MONTH_NAMES[raw] || raw;
    default:
      return raw;
  }
}

function fillChartGaps(data, period, valueKey) {
  if (!data || data.length === 0) return [];

  const parsed = data.map(item => {
    let sortValue;
    const labelVal = item.label || item._id;
    if (period === 'Daily') {
      sortValue = new Date(labelVal).getTime();
    } else if (period === 'Weekly') {
      const match = String(labelVal).match(/\d+/);
      sortValue = match ? parseInt(match[0], 10) : 0;
    } else if (period === 'Monthly') {
      sortValue = parseInt(labelVal, 10);
    } else {
      sortValue = parseInt(labelVal, 10);
    }
    return { ...item, sortValue };
  });

  parsed.sort((a, b) => a.sortValue - b.sortValue);

  if (parsed.length <= 1) {
    return parsed;
  }

  const result = [];
  const minVal = parsed[0].sortValue;
  const maxVal = parsed[parsed.length - 1].sortValue;

  if (period === 'Daily') {
    const lookup = new Map();
    parsed.forEach(item => {
      const d = new Date(item.label || item._id);
      const dateStr = d.toISOString().split('T')[0];
      lookup.set(dateStr, item);
    });

    const start = new Date(parsed[0].label || parsed[0]._id);
    const end = new Date(parsed[parsed.length - 1].label || parsed[parsed.length - 1]._id);

    let current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const found = lookup.get(dateStr);
      if (found) {
        result.push(found);
      } else {
        result.push({
          label: dateStr,
          [valueKey]: 0,
        });
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }
  } else if (period === 'Weekly') {
    const lookup = new Map(parsed.map(item => [item.sortValue, item]));
    for (let current = minVal; current <= maxVal; current++) {
      const found = lookup.get(current);
      if (found) {
        result.push(found);
      } else {
        result.push({
          label: `Week ${current}`,
          [valueKey]: 0,
        });
      }
    }
  } else if (period === 'Monthly') {
    const lookup = new Map(parsed.map(item => [item.sortValue, item]));
    for (let current = minVal; current <= maxVal; current++) {
      const found = lookup.get(current);
      if (found) {
        result.push(found);
      } else {
        const paddedMonth = String(current).padStart(2, '0');
        result.push({
          label: paddedMonth,
          [valueKey]: 0,
        });
      }
    }
  } else {
    const lookup = new Map(parsed.map(item => [item.sortValue, item]));
    for (let current = minVal; current <= maxVal; current++) {
      const found = lookup.get(current);
      if (found) {
        result.push(found);
      } else {
        result.push({
          label: String(current),
          [valueKey]: 0,
        });
      }
    }
  }

  return result;
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [signupFilter, setSignupFilter] = useState('Weekly');
  const [chartLoading, setChartLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPharmacies: 0,
    cities: 0,
    activeUsers: 0,
    activePharmacies: 0,
    inActivePharmacies: 0,
    suspendedPharmacies: 0,
    activeStaff: 0,
    avgUsers: 0,
    newPharmacies: 0,
    recentPharmacies: [],
  });
  const [trendData, setTrendData] = useState([]);

  // Fetch Dashboard stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/super-admin-dashboard/dashboard-stats');
        setStats(res.data.data);
      } catch {
        toast.error('Failed to load dashboard stats');
      }
    };
    fetchStats();
  }, []);

  // Fetch signup trends when the period filter changes
  useEffect(() => {
    const fetchTrends = async () => {
      setChartLoading(true);
      try {
        const res = await api.get(
          `/super-admin-dashboard/sign-up-trends/${signupFilter.toLowerCase()}`,
        );
        const data = res.data.data || [];
        const filled = fillChartGaps(data, signupFilter, 'signUp');
        const mapped = filled.map((item) => ({
          label: formatLabel(item.label || item._id, signupFilter),
          signups: item.signUp || 0,
        }));
        setTrendData(mapped);
      } catch {
        toast.error('Failed to load sign-up trends');
      } finally {
        setChartLoading(false);
      }
    };
    fetchTrends();
  }, [signupFilter]);

  const kpiList = [
    {
      icon: <Building2 size={19} />,
      value: String(stats.totalPharmacies),
      label: `Total Pharmacies · ${stats.cities} cities`,
      delta: stats.newPharmacies > 0 ? `+${stats.newPharmacies}` : undefined,
      deltaDir: 'up',
      tone: 'default',
    },
    {
      icon: <Users size={19} />,
      value: String(stats.activeUsers),
      label: `Active Users · ${stats.activeStaff} staff`,
      delta:
        stats.activeUsers > 0
          ? `${((stats.activeStaff / stats.activeUsers) * 100).toFixed(1)}% staff`
          : undefined,
      deltaDir: 'up',
      tone: 'info',
    },
    {
      icon: <Plus size={19} />,
      value: String(stats.newPharmacies),
      label: 'New Pharmacies · this month',
      delta: stats.newPharmacies > 0 ? `+${stats.newPharmacies}` : '0',
      deltaDir: stats.newPharmacies > 0 ? 'up' : 'neutral',
      tone: 'success',
    },
  ];

  return (
    <>
      <PageHeader
        title="Platform Overview"
        subtitle="Monitor all pharmacies, users and platform-wide metrics."
        actions={
          <>
            <Button
              size="sm"
              icon={<Plus size={15} />}
              onClick={() => navigate('/super-admin/pharmacies')}
            >
              Add pharmacy
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {kpiList.map((k, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <KPICard {...k} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        {/* Sign-ups chart */}
        <Card className="xl:col-span-2">
          <CardHeader
            action={
              <div className="flex rounded-xl border border-outline-variant overflow-hidden">
                {FILTER_OPTIONS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSignupFilter(f)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      f === signupFilter
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            }
          >
            <CardTitle>Sign Ups</CardTitle>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {signupFilter} sign-up trend
            </p>
          </CardHeader>
          <CardBody>
            {chartLoading ? (
              <div className="h-[230px] flex items-center justify-center text-sm text-on-surface-variant">
                Loading trend chart…
              </div>
            ) : trendData.length === 0 ? (
              <div className="h-[230px] flex items-center justify-center text-sm text-on-surface-variant">
                No sign-up data for this period
              </div>
            ) : (
              <RevenueChart
                data={trendData}
                series={[{ key: 'signups', name: 'Sign Ups', fill: true }]}
                fmt={(v) => `${v}`}
                height={230}
              />
            )}
          </CardBody>
        </Card>

        {/* Platform Health */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2">
            {[
              ['Active pharmacies', String(stats.activePharmacies || 0)],
              ['Inactive pharmacies', String(stats.inActivePharmacies || 0)],
              ['Suspended', String(stats.suspendedPharmacies || 0)],
              ['Avg users / pharmacy', String(stats.avgUsers || 0)],
              ['Active staff', String(stats.activeStaff || 0)],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between text-sm border-b border-outline-variant/60 pb-2 last:border-0"
              >
                <span className="text-on-surface-variant">{k}</span>
                <span className="font-semibold text-on-surface">{v}</span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Recent pharmacies */}
      <Card>
        <CardHeader
          action={
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowRight size={14} />}
              onClick={() => navigate('/super-admin/pharmacies')}
            >
              View all
            </Button>
          }
        >
          <CardTitle>Recent Pharmacies</CardTitle>
          <p className="text-xs text-on-surface-variant mt-0.5">Last 5 onboarded</p>
        </CardHeader>
        <Table>
          <thead>
            <tr>
              <Th>Pharmacy</Th>
              <Th>Admin</Th>
              <Th>City</Th>
              <Th align="right">Total Staff</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {!stats.recentPharmacies || stats.recentPharmacies.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-on-surface-variant py-4 text-sm"
                >
                  No recent pharmacies onboarded
                </td>
              </tr>
            ) : (
              stats.recentPharmacies.map((p) => (
                <tr key={p._id}>
                  <Td>
                    <span className="font-semibold text-on-surface">
                      {p.pharmacyName || p.pharmacyName}
                    </span>
                  </Td>
                  <Td>{p.owner?.name || 'N/A'}</Td>
                  <Td>{p.city}</Td>
                  <Td align="right">{p.totalStaff}</Td>
                  <Td>
                    <Badge
                      status={p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : ''}
                      dot
                    />
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
