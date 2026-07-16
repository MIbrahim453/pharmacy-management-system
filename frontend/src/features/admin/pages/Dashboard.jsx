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
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { Table, Th, Td } from "../../../components/ui/Table";
import { formatPKR } from "../../../utils/helpers";
import { getDashboardStats, getRevenueTrends, getTopSellingMedicines } from "../../../services/dashboardService";

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

        <Card>
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
          <CardBody className="space-y-4">
            {alertsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant/60">
                <CheckCircle size={32} className="text-success mb-2" />
                <p className="text-sm font-medium">Inventory is in perfect health</p>
              </div>
            ) : (
              alertsList.map((a, i) => (
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
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mb-5">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Medicines</CardTitle>
          </CardHeader>
          <Table>
            <thead>
              <tr>
                <Th>Medicine</Th>
                <Th align="right">Invoices</Th>
                <Th align="right">Units Sold</Th>
                <Th align="right">Revenue</Th>
              </tr>
            </thead>
            <tbody>
              {topSelling.length === 0 ? (
                <tr>
                  <Td colSpan={4} className="text-center py-10 text-on-surface-variant/70">
                    No sales data recorded yet
                  </Td>
                </tr>
              ) : (
                topSelling.map((r) => (
                  <tr key={r.medicineId}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/[0.12] text-primary text-[10px] font-bold">
                          {getAbbreviation(r.medicineName)}
                        </div>
                        <span className="text-sm font-semibold text-on-surface">{r.medicineName}</span>
                      </div>
                    </Td>
                    <Td align="right" className="text-sm font-medium">{r.totalInvoices}</Td>
                    <Td align="right" className="text-sm font-medium text-primary font-semibold">{r.totalUnitsSold}</Td>
                    <Td align="right" className="text-sm font-semibold text-on-surface">{formatPKR(r.totalRevenue)}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card>
      </div>
    </>
  );
}
