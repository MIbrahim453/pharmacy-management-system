import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Pill, ShoppingCart, Wallet, Clock, AlertTriangle, Package, ArrowRight, RefreshCw, CheckCircle } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardBody } from "../../../components/ui/Card";
import { KPICard } from "../../../components/charts/DashboardStats";
import RevenueChart from "../../../components/charts/RevenueChart";
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer } from "recharts";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { formatPKR } from "../../../utils/helpers";
import { getDashboardStats, getRevenueTrends, getTopSellingMedicines } from "../../../services/dashboardService";

const COLORS = [
  "var(--color-primary)",
  "var(--color-tertiary)",
  "var(--color-warning)",
  "var(--color-error)",
  "var(--color-secondary)",
  "var(--color-outline)",
];

const REV_MAP = {
  Daily: "daily",
  Weekly: "weekly",
  Monthly: "monthly",
  Yearly: "yearly",
};

const REV_LABELS = {
  Daily: "Last 7 days · revenue trend",
  Weekly: "Weekly revenue trend for current month",
  Monthly: "Monthly revenue trend for current year",
  Yearly: "Yearly revenue trend",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const userName = user?.name || "Admin";
  const pharmacy = user?.pharmacyId?.name || "Crescent Care Pharmacy";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Dashboard Stats State
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalInvoices: 0,
    unitsSold: 0,
    revenueToday: 0,
    totalPendingPayment: 0,
    lowStock: 0,
    critical: 0,
    medBatchExpirySoon: 0,
  });

  // Chart and lists state
  const [revF, setRevF] = useState("Weekly");
  const [trends, setTrends] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendsLoading, setTrendsLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, topSellingData] = await Promise.all([
        getDashboardStats(),
        getTopSellingMedicines(),
      ]);

      if (statsData) setStats(statsData);
      if (topSellingData) setTopSelling(topSellingData);
    } catch (error) {
      console.error("Failed to load dashboard statistics:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async (periodLabel) => {
    setTrendsLoading(true);
    try {
      const backendPeriod = REV_MAP[periodLabel];
      const trendsData = await getRevenueTrends(backendPeriod);
      if (trendsData) {
        setTrends(trendsData);
      }
    } catch (error) {
      console.error("Failed to load revenue trends:", error);
    } finally {
      setTrendsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchTrends(revF);
  }, [revF]);

  const getDayName = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } catch {
      return dateStr;
    }
  };

  const getMonthName = (monthStr) => {
    const months = {
      "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
      "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
    };
    return months[monthStr] || monthStr;
  };

  // Map backend trend format to recharts format
  const mappedChartData = trends.map((item) => {
    let label = item.label || item._id || "—";
    if (revF === "Daily") {
      label = getDayName(label);
    } else if (revF === "Monthly") {
      label = getMonthName(label);
    }
    return {
      label,
      revenue: item.revenue || 0,
    };
  });

  // Dynamic alerts list
  const alertsList = [];
  if (stats.lowStock > 0 || stats.critical > 0) {
    alertsList.push({
      tone: stats.critical > 0 ? "danger" : "warning",
      icon: <Package size={17} />,
      title: `${stats.lowStock + stats.critical} medicines low on stock`,
      sub: `Below reorder level · ${stats.critical} critical`,
      status: "Low stock",
      link: "/admin/inventory",
    });
  }
  if (stats.medBatchExpirySoon > 0) {
    alertsList.push({
      tone: "info",
      icon: <Clock size={17} />,
      title: `${stats.medBatchExpirySoon} batches expiring soon`,
      sub: "Active inventory batches expiring in 30 days",
      status: "Expiring",
      link: "/admin/inventory",
    });
  }

  const kpiData = [
    { icon: <Pill size={18} />, value: stats.totalMedicines, label: "Total Medicines", tone: "default" },
    { icon: <ShoppingCart size={18} />, value: stats.totalInvoices, label: `Invoices Today · ${stats.unitsSold} units`, tone: "info" },
    { icon: <Wallet size={18} />, value: formatPKR(stats.revenueToday), label: "Revenue Today", tone: "success" },
    { icon: <Clock size={18} />, value: formatPKR(stats.totalPendingPayment), label: "Pending Payments Today", tone: "warning" },
  ];

  const getAbbreviation = (name) => {
    if (!name) return "MED";
    return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  };

  return (
    <>
      <PageHeader
        title={`${greeting}, ${userName?.split(" ")[0] ?? "there"}`}
        subtitle={`${pharmacy} — here's how the shop is doing today.`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={14} className={loading ? "animate-spin" : ""} />}
            onClick={() => {
              fetchDashboardData();
              fetchTrends(revF);
            }}
            disabled={loading}
          >
            Refresh
          </Button>
        }
      />

      {/* KPIs — equal height */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiData.map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="flex">
            <KPICard {...k} className="flex-1" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <Card className="xl:col-span-2">
          <CardHeader action={
            <div className="flex rounded-xl border border-outline-variant overflow-hidden">
              {Object.keys(REV_MAP).map((f) => (
                <button
                  key={f}
                  onClick={() => setRevF(f)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${f === revF ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          }>
            <CardTitle>Revenue Trends</CardTitle>
            <p className="text-xs text-on-surface-variant mt-0.5">{REV_LABELS[revF]}</p>
          </CardHeader>
          <CardBody className="relative min-h-[230px]">
            {trendsLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-surface/50">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : mappedChartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant/70">
                <p className="text-sm font-medium">No sales trends recorded for this period</p>
              </div>
            ) : (
              <RevenueChart
                data={mappedChartData}
                series={[{ key: "revenue", name: "Revenue", fill: true }]}
                fmt={formatPKR}
                height={230}
              />
            )}
          </CardBody>
        </Card>

        <Card className="xl:row-span-2 flex flex-col h-full">
          <CardHeader action={
            <button
              onClick={() => navigate("/admin/inventory")}
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          }>
            <CardTitle>Needs attention</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4 flex-1 flex flex-col">
            {alertsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant/60 flex-1">
                <CheckCircle size={32} className="text-success mb-2" />
                <p className="text-sm font-medium">Inventory is in perfect health</p>
              </div>
            ) : (
              <div className="space-y-4 flex-1">
                {alertsList.map((a, i) => (
                  <div key={i}>
                    {i > 0 && <div className="h-px bg-surface-container-high -mx-5 mb-4" />}
                    <div className="flex items-start gap-3 cursor-pointer" onClick={() => navigate(a.link)}>
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${a.tone === "danger" ? "bg-error/[0.08] text-error" : a.tone === "warning" ? "bg-warning/[0.08] text-warning" : "bg-tertiary/[0.08] text-tertiary"}`}>{a.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-on-surface">{a.title}</div>
                        <div className="text-xs text-on-surface-variant mt-0.5">{a.sub}</div>
                      </div>
                      <Badge status={a.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Top Selling Medicines</CardTitle>
          </CardHeader>
          <CardBody>
            {topSelling.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-on-surface-variant/70">
                No sales data recorded yet
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                <div className="md:col-span-2 flex justify-center relative min-h-[200px]">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={topSelling.map((item, index) => ({
                          name: item.medicineName,
                          value: item.totalRevenue || 0,
                          units: item.totalUnitsSold || 0,
                          invoices: item.totalInvoices || 0,
                          color: COLORS[index % COLORS.length]
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {topSelling.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        contentStyle={{
                          background: 'var(--color-surface-container-highest)',
                          border: '1px solid var(--color-outline-variant)',
                          borderRadius: 8,
                          fontSize: 12,
                          color: 'var(--color-on-surface)',
                        }}
                        formatter={(value) => [formatPKR(value), 'Revenue']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Total Share</span>
                    <span className="text-sm font-extrabold text-on-surface">
                      {formatPKR(topSelling.reduce((acc, curr) => acc + (curr.totalRevenue || 0), 0))}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-3 space-y-2">
                  {topSelling.map((entry, index) => {
                    const totalRevenue = topSelling.reduce((acc, curr) => acc + (curr.totalRevenue || 0), 0);
                    const percentage = totalRevenue > 0
                      ? (((entry.totalRevenue || 0) / totalRevenue) * 100).toFixed(1)
                      : 0;
                    const color = COLORS[index % COLORS.length];
                    return (
                      <div key={entry.medicineId} className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-container transition-colors duration-150">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-on-surface truncate">{entry.medicineName}</div>
                            <div className="text-xs text-on-surface-variant">
                              {entry.totalUnitsSold} units · {entry.totalInvoices} invoices
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 pl-3">
                          <div className="text-sm font-bold text-on-surface">{formatPKR(entry.totalRevenue)}</div>
                          <div className="text-xs text-primary font-semibold">{percentage}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
