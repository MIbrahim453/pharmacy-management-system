import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Pill, ShoppingCart, Wallet, Clock, AlertTriangle, Package, ArrowRight } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardBody } from "../../../components/ui/Card";
import { KPICard } from "../../../components/charts/DashboardStats";
import RevenueChart from "../../../components/charts/RevenueChart";
import InventoryChart from "../../../components/charts/InventoryChart";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { Table, Th, Td } from "../../../components/ui/Table";

// Inline revenue data
const REV_DAILY = [
  { label: 'Mon', now: 24000, last: 19000 },
  { label: 'Tue', now: 28000, last: 22000 },
  { label: 'Wed', now: 32000, last: 25000 },
  { label: 'Thu', now: 27000, last: 20000 },
  { label: 'Fri', now: 35000, last: 29000 },
  { label: 'Sat', now: 42000, last: 35000 },
  { label: 'Sun', now: 38000, last: 31000 },
];

const REV_WEEKLY = [
  { label: 'W1', now: 145000, last: 125000 },
  { label: 'W2', now: 168000, last: 142000 },
  { label: 'W3', now: 178000, last: 155000 },
  { label: 'W4', now: 195000, last: 172000 },
];

const REV_MONTHLY = [
  { label: 'Jan', now: 680000, last: 580000 },
  { label: 'Feb', now: 720000, last: 620000 },
  { label: 'Mar', now: 760000, last: 650000 },
  { label: 'Apr', now: 820000, last: 720000 },
  { label: 'May', now: 890000, last: 780000 },
  { label: 'Jun', now: 950000, last: 850000 },
];

const REV_YEARLY = [
  { label: '2022', now: 8200000, last: 7100000 },
  { label: '2023', now: 9500000, last: 8200000 },
  { label: '2024', now: 11200000, last: 9500000 },
  { label: '2025', now: 13100000, last: 11200000 },
  { label: '2026', now: 15300000, last: 13100000 },
];

const ALERTS = [
  { tone: "danger", icon: <AlertTriangle size={17} />, title: "12 medicines expired", sub: "Rs 18,200 value · remove from shelves", status: "Expired" },
  { tone: "warning", icon: <Package size={17} />, title: "23 items low on stock", sub: "Below reorder level · 8 critical", status: "Low stock" },
  { tone: "info", icon: <Clock size={17} />, title: "31 expiring in 30 days", sub: "Plan a clearance or return", status: "Pending" },
];

const TOP = [
  { name: "Augmentin 625mg", abbr: "AG", cat: "Antibiotics", units: 412, revenue: "128,400", stock: 78, warn: "" },
  { name: "Panadol Extra", abbr: "PE", cat: "Analgesics", units: 386, revenue: "42,460", stock: 41, warn: "warn" },
  { name: "Concor 5mg", abbr: "CN", cat: "Cardiac", units: 298, revenue: "96,200", stock: 62, warn: "" },
  { name: "Brufen 400mg", abbr: "BR", cat: "Analgesics", units: 274, revenue: "31,510", stock: 18, warn: "err" },
  { name: "Neurobion Forte", abbr: "NB", cat: "Vitamins", units: 241, revenue: "58,840", stock: 55, warn: "" },
];

const CATS = [
  { label: "Antibiotics", value: 32 }, { label: "Cardiac", value: 24 },
  { label: "Analgesics", value: 18 }, { label: "Vitamins", value: 14 }, { label: "Others", value: 12 },
];

const KPIS = [
  { icon: <Pill size={18} />, value: "1,284", label: "Total Medicines · 38 categories", delta: "2.4%", deltaDir: "up", tone: "default" },
  { icon: <ShoppingCart size={18} />, value: "312", label: "Sales Today · 41 invoices", delta: "8.1%", deltaDir: "up", tone: "info" },
  { icon: <Wallet size={18} />, value: "Rs 248,900", label: "Revenue Today", delta: "11.5%", deltaDir: "up", tone: "success" },
  { icon: <Clock size={18} />, value: "Rs 86,400", label: "Pending Payments · 7 invoices", delta: "3", deltaDir: "down", tone: "warning" },
];

const REV_MAP = {
  Daily: { data: REV_DAILY, sub: "Last 7 days · this week vs last week" },
  Weekly: { data: REV_WEEKLY, sub: "Last 4 weeks · this month vs last month" },
  Monthly: { data: REV_MONTHLY, sub: "Monthly revenue · this year vs last" },
  Yearly: { data: REV_YEARLY, sub: "Yearly revenue trend" },
};

export default function AdminDashboard() {
  const [revF, setRevF] = useState("Weekly");
  const navigate = useNavigate();
  const userName = "Ayesha Khan";
  const pharmacy = "Crescent Care Pharmacy";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const { data: cData, sub: cSub } = REV_MAP[revF];
  const fmt = (v) => {
    if (v >= 1000000) return `Rs ${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `Rs ${Math.round(v / 1000)}k`;
    return `Rs ${v}`;
  };

  return (
    <>
      <PageHeader
        title={`${greeting}, ${userName?.split(" ")[0] ?? "there"}`}
        subtitle={`${pharmacy ?? "Pharmacy"} — here's how the shop is doing today.`}
        actions={<Button variant="secondary" size="sm" onClick={() => toast.success("Dashboard exported as PDF")}>Export</Button>}
      />

      {/* KPIs — equal height */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {KPIS.map((k, i) => (
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
                <button key={f} onClick={() => setRevF(f)} className={`px-3 py-1.5 text-xs font-medium transition-colors ${f === revF ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"}`}>{f}</button>
              ))}
            </div>
          }>
            <CardTitle>Revenue & Sales</CardTitle>
            <p className="text-xs text-on-surface-variant mt-0.5">{cSub}</p>
          </CardHeader>
          <CardBody>
            <RevenueChart data={cData} series={[{ key: "now", name: "Current", fill: true }, { key: "last", name: "Previous", fill: false }]} fmt={fmt} height={230} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader action={<button onClick={() => navigate("/admin/inventory")} className="text-xs text-primary hover:underline font-medium flex items-center gap-1">View all <ArrowRight size={12} /></button>}>
            <CardTitle>Needs attention</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            {ALERTS.map((a, i) => (
              <div key={i}>
                {i > 0 && <div className="h-px bg-surface-container-high -mx-5 mb-4" />}
                <div className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${a.tone === "danger" ? "bg-error/[0.08] text-error" : a.tone === "warning" ? "bg-warning/[0.08] text-warning" : "bg-tertiary/[0.08] text-tertiary"}`}>{a.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-on-surface">{a.title}</div>
                    <div className="text-xs text-on-surface-variant mt-0.5">{a.sub}</div>
                  </div>
                  <Badge status={a.status} />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2">
          <CardHeader action={<Badge variant="default">This month</Badge>}>
            <CardTitle>Top Selling Medicines</CardTitle>
          </CardHeader>
          <Table>
            <thead><tr><Th>Medicine</Th><Th>Category</Th><Th align="right">Units</Th><Th align="right">Revenue</Th><Th>Stock health</Th></tr></thead>
            <tbody>
              {TOP.map((r) => (
                <tr key={r.name}>
                  <Td><div className="flex items-center gap-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/[0.12] text-primary text-[10px] font-bold">{r.abbr}</div><span className="text-sm font-semibold text-on-surface">{r.name}</span></div></Td>
                  <Td><Badge variant="default">{r.cat}</Badge></Td>
                  <Td align="right" className="text-sm font-medium">{r.units}</Td>
                  <Td align="right" className="text-sm font-semibold text-on-surface">Rs {r.revenue}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                        <div className={`h-full rounded-full ${r.warn === "err" ? "bg-error" : r.warn === "warn" ? "bg-warning" : "bg-primary"}`} style={{ width: `${r.stock}%` }} />
                      </div>
                      <span className="text-xs text-on-surface-variant w-8 text-right">{r.stock}%</span>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sales by Category</CardTitle></CardHeader>
          <CardBody>
            <InventoryChart data={CATS} height={160} />
            <div className="mt-4 space-y-2">
              {CATS.map((c, i) => {
                const COLORS = ["var(--color-primary)", "var(--color-tertiary)", "var(--color-warning)", "var(--color-error)", "var(--color-secondary)"];
                return (<div key={c.label} className="flex items-center gap-2 text-sm"><span className="h-2 w-2 rounded-full shrink-0" style={{ background: COLORS[i] }} /><span className="flex-1 text-on-surface-variant">{c.label}</span><span className="font-semibold text-on-surface">{c.value}%</span></div>);
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
