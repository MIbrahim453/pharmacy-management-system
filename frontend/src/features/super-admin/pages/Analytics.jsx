import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { KPICard } from '../../../components/charts/DashboardStats';
import SalesChart from '../../../components/charts/SalesChart';
import InventoryChart from '../../../components/charts/InventoryChart';
import api from '../../../services/axios';
import { toast } from 'sonner';

const formatHour = (hour) => {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  return hour > 12 ? `${hour - 12}pm` : `${hour}am`;
};

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activePharmacies: 0,
    activeUsers: 0,
    suspendedPharmacies: 0,
  });
  const [hours, setHours] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        const [statsRes, hoursRes, citiesRes] = await Promise.all([
          api.get('/super-admin-analytics/analytics'),
          api.get('/super-admin-analytics/hourly-signIns'),
          api.get('/super-admin-analytics/pharmacy-by-city'),
        ]);

        setStats(statsRes.data.data || { activePharmacies: 0, activeUsers: 0, suspendedPharmacies: 0 });

        const mappedHours = (hoursRes.data.data || []).map((h) => ({
          label: formatHour(h.hour),
          v: h.totalSignIns,
        }));
        setHours(mappedHours);

        const mappedCities = (citiesRes.data.data || []).map((c) => ({
          label: c.city,
          value: c.percentage,
        }));
        setCities(mappedCities);
      } catch (err) {
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const kpis = [
    {
      icon: <Building2 size={19} />,
      value: String(stats.activePharmacies),
      label: 'Active pharmacies',
      tone: 'default',
    },
    {
      icon: <Users size={19} />,
      value: String(stats.activeUsers),
      label: 'Platform users',
      tone: 'info',
    },
    {
      icon: <Building2 size={19} />,
      value: String(stats.suspendedPharmacies),
      label: 'Suspended pharmacies',
      tone: 'danger',
    },
  ];

  return (
    <>
      <PageHeader
        title="Platform Analytics"
        subtitle="Aggregated metrics across all pharmacies."
      />

      {loading ? (
        <div className="flex h-96 items-center justify-center text-sm text-on-surface-variant">
          Loading analytics…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {kpis.map((k, i) => (
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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Sign Ins</CardTitle>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Average sign ins by hour
                </p>
              </CardHeader>
              <CardBody>
                {hours.length === 0 ? (
                  <div className="h-[220px] flex items-center justify-center text-sm text-on-surface-variant">
                    No sign-in data recorded today
                  </div>
                ) : (
                  <SalesChart data={hours} dataKey="v" height={220} />
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pharmacy by City</CardTitle>
              </CardHeader>
              <CardBody className="flex items-center gap-6">
                {cities.length === 0 ? (
                  <div className="h-[180px] w-full flex items-center justify-center text-sm text-on-surface-variant">
                    No city data available
                  </div>
                ) : (
                  <>
                    <InventoryChart data={cities} height={180} />
                    <div className="space-y-2.5 flex-1">
                      {cities.map((d, i) => {
                        const COLORS = [
                          'var(--color-primary)',
                          'var(--color-tertiary)',
                          'var(--color-warning)',
                          'var(--color-error)',
                          'var(--color-secondary)',
                          'var(--color-outline)',
                        ];
                        return (
                          <div
                            key={d.label}
                            className="flex items-center gap-2.5 text-sm"
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full shrink-0"
                              style={{ background: COLORS[i % COLORS.length] }}
                            />
                            <span className="flex-1 text-on-surface-variant">
                              {d.label}
                            </span>
                            <span className="font-semibold text-on-surface">
                              {d.value}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
