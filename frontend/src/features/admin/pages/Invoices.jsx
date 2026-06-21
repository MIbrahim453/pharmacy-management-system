import { useState, useRef } from "react";
import { toast } from "sonner";
import { Receipt, CheckCircle, Eye, Pencil, Trash2, Printer } from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "../../../components/common/PageHeader";
import SearchBar from "../../../components/common/SearchBar";
import { Card } from "../../../components/ui/Card";
import { Table, Th, Td, TableEmpty } from "../../../components/ui/Table";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Pagination from "../../../components/ui/Pagination";
import Select from "../../../components/ui/Select";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import { formatPKR } from "../../../utils/helpers";

// TODO: Replace with API call — GET /api/admin/invoices
const INITIAL_INVOICES = [
  { id: 'INV-260101-1001', customer: 'Ahmed Raza', date: '2026-01-01', items: 3, amount: 4200, method: 'Cash', status: 'Unpaid' },
  { id: 'INV-260101-1002', customer: 'Sara Khan', date: '2026-01-01', items: 2, amount: 1850, method: 'Card', status: 'Paid' },
  { id: 'INV-260102-1003', customer: 'Usman Ali', date: '2026-01-02', items: 5, amount: 6300, method: 'Bank', status: 'Unpaid' },
  { id: 'INV-260102-1004', customer: 'Fatima Sheikh', date: '2026-01-02', items: 1, amount: 920, method: 'Cash', status: 'Paid' },
  { id: 'INV-260103-1005', customer: 'Bilal Hassan', date: '2026-01-03', items: 4, amount: 3100, method: 'Cash', status: 'Unpaid' },
  { id: 'INV-260103-1006', customer: 'Zainab Mir', date: '2026-01-03', items: 2, amount: 7800, method: 'Card', status: 'Paid' },
  { id: 'INV-260104-1007', customer: 'Nadia Ahmed', date: '2026-01-04', items: 3, amount: 2400, method: 'Cash', status: 'Unpaid' },
  { id: 'INV-260104-1008', customer: 'Rizwan Khan', date: '2026-01-04', items: 6, amount: 9500, method: 'Card', status: 'Paid' },
  { id: 'INV-260105-1009', customer: 'Hassan Tariq', date: '2026-01-05', items: 2, amount: 1200, method: 'Cash', status: 'Unpaid' },
];


const PER_PAGE = 8;
const BLANK = {
  customer: "",
  date: "",
  amount: "",
  items: "",
  method: "Cash",
  status: "Unpaid",
};

const getMockItems = (amount, itemsCount) => {
  const count = Number(itemsCount) || 1;
  const medicines = [
    { name: "Augmentin 625mg", price: 300 },
    { name: "Panadol Extra", price: 150 },
    { name: "Concor 5mg", price: 410 },
    { name: "Brufen 400mg", price: 180 },
    { name: "Neurobion Forte", price: 240 },
    { name: "Softin 10mg", price: 210 },
    { name: "Risek 40mg", price: 350 },
    { name: "Lipiget 10mg", price: 480 },
  ];
  const result = [];
  for (let i = 0; i < count; i++) {
    const med = medicines[i % medicines.length];
    const qty = Math.max(1, Math.floor(amount / count / med.price || 1));
    const itemTotal =
      i === count - 1
        ? Math.max(50, amount - result.reduce((a, c) => a + c.total, 0))
        : med.price * qty;
    result.push({
      id: i + 1,
      name: med.name,
      qty,
      unitPrice: Math.round(itemTotal / qty),
      total: itemTotal,
    });
  }
  return result;
};

export default function Invoices() {
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);

  const [query, setQuery] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [page, setPage] = useState(1);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [delModal, setDelModal] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const invoiceRef = useRef(null);

  const filtered = invoices.filter(
    (inv) =>
      (statusF === "All" || inv.status === statusF) &&
      (inv.id.toLowerCase().includes(query.toLowerCase()) ||
        inv.customer.toLowerCase().includes(query.toLowerCase())),
  );
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalUnpaid = invoices
    .filter((i) => i.status === "Unpaid")
    .reduce((s, i) => s + i.amount, 0);
  const field = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    // TODO: PUT /api/admin/invoices/:id
    setInvoices((prev) => prev.map((inv) => inv.id === selected?.id ? {
      ...inv,
      customer: form.customer,
      date: form.date,
      amount: Number(form.amount) || 0,
      items: Number(form.items) || 1,
      method: form.method,
      status: form.status,
    } : inv));
    toast.success(`Invoice ${selected?.id} updated`);
    setEditModal(false); setSelected(null); setForm(BLANK); setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    // TODO: DELETE /api/admin/invoices/:id
    setInvoices((prev) => prev.filter((i) => i.id !== selected?.id));
    toast.success(`Invoice ${selected?.id} deleted`);
    setDelModal(false); setSelected(null); setLoading(false);
  };

  const openView = (inv) => {
    setSelected(inv);
    setViewModal(true);
  };
  const openEdit = (inv) => {
    setSelected(inv);
    setForm({
      customer: inv.customer,
      date: inv.date,
      amount: String(inv.amount),
      items: String(inv.items),
      method: inv.method,
      status: inv.status,
    });
    setEditModal(true);
  };
  const openDel = (inv) => {
    setSelected(inv);
    setDelModal(true);
  };

  const buildInvoiceHTML = (inv) => {
    const items = getMockItems(inv.amount, inv.items);
    const rows = items
      .map(
        (item) =>
          `<tr><td>${item.id}</td><td style="font-weight:500">${item.name}</td><td class="text-right">${item.qty}</td><td class="text-right">${formatPKR(item.unitPrice)}</td><td class="text-right" style="font-weight:600">${formatPKR(item.total)}</td></tr>`,
      )
      .join("");
    return `<div class="header"><div><div class="brand">Pharmacy OS</div><div class="brand-sub">Crescent Care Branch · Lahore, Pakistan</div><div class="brand-sub">License: PHA-LHR-2024-0847 · NTN: 1234567-8</div></div>
      <div><div class="inv-id">${inv.id}</div><div class="inv-date">${inv.date}</div><div style="margin-top:6px;text-align:right"><span class="status ${inv.status === "Paid" ? "status-paid" : "status-unpaid"}">${inv.status}</span></div></div></div>
      <div class="info-grid"><div><div class="info-label">Billed To</div><div class="info-value">${inv.customer}</div></div><div><div class="info-label">Payment Method</div><div class="info-value">${inv.method}</div></div></div>
      <table><thead><tr><th>#</th><th>Medicine</th><th class="text-right">Qty</th><th class="text-right">Unit Price</th><th class="text-right">Total</th></tr></thead>
      <tbody>${rows}<tr class="total-row"><td colspan="4">Net Total</td><td class="text-right">${formatPKR(inv.amount)}</td></tr></tbody></table>
      <div class="footer">Thank you for your purchase · Pharmacy OS · Contact: +92 42 3577 0090</div>`;
  };

  const handlePrint = (inv) => {
    const printWindow = window.open("", "_blank");
    printWindow.document
      .write(`<!DOCTYPE html><html><head><title>Invoice ${inv.id}</title>
      <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',system-ui,sans-serif;color:#1a1b22;padding:40px;max-width:800px;margin:0 auto}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #004f35}
      .brand{font-size:24px;font-weight:700;color:#004f35}.brand-sub{font-size:12px;color:#6b7280;margin-top:4px}
      .inv-id{font-size:18px;font-weight:600;text-align:right}.inv-date{font-size:12px;color:#6b7280;margin-top:4px;text-align:right}
      .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px}
      .info-label{font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;font-weight:600}.info-value{font-size:14px;font-weight:500;margin-top:4px}
      table{width:100%;border-collapse:collapse;margin-bottom:24px}th{background:#f3f4f6;text-align:left;padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb}
      td{padding:10px 12px;font-size:13px;border-bottom:1px solid #f3f4f6}.text-right{text-align:right}
      .total-row{background:#004f35;color:white}.total-row td{padding:14px 12px;font-weight:700;font-size:15px;border:none}
      .footer{margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#9ca3af}
      .status{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600}
      .status-paid{background:#dcfce7;color:#166534}.status-unpaid{background:#fee2e2;color:#991b1b}</style></head><body>`);
    printWindow.document.write(buildInvoiceHTML(inv));
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const handleMarkPaid = (inv) => {
    // TODO: PUT /api/admin/invoices/:id/mark-paid
    setInvoices((prev) => prev.map((i) => i.id === inv.id ? { ...i, status: 'Paid' } : i));
    toast.success(`${inv.id} marked as paid`);
    if (selected?.id === inv.id) setSelected({ ...inv, status: "Paid" });
  };

  return (
    <>
      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} invoices · ${formatPKR(totalUnpaid)} pending payment`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toast.info("Exporting invoices…")}
          >
            Export CSV
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-outline-variant/60">
          <SearchBar
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search by ID or customer…"
            className="w-full sm:flex-1 sm:max-w-xs"
          />
          <Select
            value={statusF}
            onChange={(e) => {
              setStatusF(e.target.value);
              setPage(1);
            }}
            options={["All", "Paid", "Unpaid"]}
            className="w-full sm:w-32 h-9 text-sm"
          />
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Invoice</Th>
              <Th>Customer</Th>
              <Th>Date</Th>
              <Th className="text-right">Items</Th>
              <Th className="text-right">Amount</Th>
              <Th>Method</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <TableEmpty
                cols={8}
                message="No invoices found"
                icon={<Receipt size={32} />}
              />
            ) : (
              paginated.map((inv, i) => (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Td>
                    <span className="font-mono text-xs font-semibold text-primary">
                      {inv.id}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-sm font-medium text-on-surface">
                      {inv.customer}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs text-on-surface-variant">
                      {inv.date}
                    </span>
                  </Td>
                  <Td className="text-right">
                    <span className="text-sm">{inv.items}</span>
                  </Td>
                  <Td className="text-right">
                    <span className="text-sm font-semibold text-on-surface tabular-nums">
                      {formatPKR(inv.amount)}
                    </span>
                  </Td>
                  <Td>
                    <Badge variant="default">{inv.method}</Badge>
                  </Td>
                  <Td>
                    <Badge status={inv.status} dot />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      {inv.status === "Unpaid" && (
                        <button
                          onClick={() => handleMarkPaid(inv)}
                          className="btn-ghost p-1.5 rounded-lg text-success/70 hover:text-success hover:bg-success/[0.08]"
                          title="Mark as paid"
                        >
                          <CheckCircle size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => handlePrint(inv)}
                        className="btn-ghost p-1.5 rounded-lg"
                        title="Print"
                      >
                        <Printer size={15} />
                      </button>
                      <button
                        onClick={() => openView(inv)}
                        className="btn-ghost p-1.5 rounded-lg"
                        title="View"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => openEdit(inv)}
                        className="btn-ghost p-1.5 rounded-lg"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => openDel(inv)}
                        className="btn-ghost p-1.5 rounded-lg text-error/70 hover:text-error hover:bg-error/[0.08]"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </Td>
                </motion.tr>
              ))
            )}
          </tbody>
        </Table>
        <div className="px-5 py-4 border-t border-outline-variant/60">
          <Pagination
            page={page}
            total={filtered.length}
            perPage={PER_PAGE}
            onChange={setPage}
          />
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Invoice"
        subtitle={`Editing ${selected?.id}`}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditModal(false)}>
              Cancel
            </Button>
            <Button form="invoice-edit-form" type="submit" loading={loading}>
              Save changes
            </Button>
          </div>
        }
      >
        <form
          id="invoice-edit-form"
          onSubmit={handleEdit}
          className="p-6 space-y-4"
        >
          <Input label="Invoice ID" value={selected?.id || ""} disabled />
          <Input
            label="Customer name"
            value={form.customer}
            onChange={(e) => field("customer", e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Invoice Date"
              type="date"
              value={form.date}
              onChange={(e) => field("date", e.target.value)}
              required
            />
            <Input
              label="No. of items"
              type="number"
              value={form.items}
              onChange={(e) => field("items", e.target.value)}
              min="1"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Amount (Rs)"
              type="number"
              value={form.amount}
              onChange={(e) => field("amount", e.target.value)}
              min="0"
              required
            />
            <Select
              label="Payment Method"
              value={form.method}
              onChange={(e) => field("method", e.target.value)}
              options={["Cash", "Card", "Later"]}
            />
          </div>
          <Select
            label="Payment Status"
            value={form.status}
            onChange={(e) => field("status", e.target.value)}
            options={["Paid", "Unpaid"]}
          />
        </form>
      </Modal>

      {/* View / Print Modal — Professional Invoice */}
      <Modal
        open={viewModal}
        onClose={() => setViewModal(false)}
        title="Invoice"
        subtitle={selected?.id}
        size="md"
      >
        {selected && (
          <div className="p-6 space-y-5">
            {/* Printable invoice content */}
            <div ref={invoiceRef}>
              <div
                className="header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 24,
                  paddingBottom: 20,
                  borderBottom: "2px solid var(--color-primary, #004f35)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "var(--color-primary, #004f35)",
                    }}
                  >
                    Pharmacy OS
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--color-on-surface-variant, #6b7280)",
                      marginTop: 4,
                    }}
                  >
                    Crescent Care Branch · Lahore, Pakistan
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--color-on-surface-variant, #6b7280)",
                      marginTop: 2,
                    }}
                  >
                    License: PHA-LHR-2024-0847 · NTN: 1234567-8
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>
                    {selected?.id}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--color-on-surface-variant, #6b7280)",
                      marginTop: 4,
                    }}
                  >
                    {selected?.date}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <span
                      className={`status ${selected?.status === "Paid" ? "status-paid" : "status-unpaid"}`}
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        background:
                          selected?.status === "Paid" ? "#dcfce7" : "#fee2e2",
                        color:
                          selected?.status === "Paid" ? "#166534" : "#991b1b",
                      }}
                    >
                      {selected?.status}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                  marginBottom: 24,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--color-on-surface-variant, #6b7280)",
                      fontWeight: 600,
                    }}
                  >
                    Billed To
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>
                    {selected?.customer}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--color-on-surface-variant, #6b7280)",
                      fontWeight: 600,
                    }}
                  >
                    Payment Method
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>
                    {selected?.method}
                  </div>
                </div>
              </div>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: 20,
                }}
              >
                <thead>
                  <tr style={{ background: "#f3f4f6" }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#6b7280",
                        fontWeight: 600,
                        borderBottom: "2px solid #e5e7eb",
                      }}
                    >
                      #
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#6b7280",
                        fontWeight: 600,
                        borderBottom: "2px solid #e5e7eb",
                      }}
                    >
                      Medicine
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "10px 12px",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#6b7280",
                        fontWeight: 600,
                        borderBottom: "2px solid #e5e7eb",
                      }}
                    >
                      Qty
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "10px 12px",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#6b7280",
                        fontWeight: 600,
                        borderBottom: "2px solid #e5e7eb",
                      }}
                    >
                      Unit Price
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "10px 12px",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#6b7280",
                        fontWeight: 600,
                        borderBottom: "2px solid #e5e7eb",
                      }}
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getMockItems(selected?.amount || 0, selected?.items || 0).map((item) => (
                    <tr key={item.id}>
                      <td
                        style={{
                          padding: "10px 12px",
                          fontSize: 13,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {item.id}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          fontSize: 13,
                          borderBottom: "1px solid #f3f4f6",
                          fontWeight: 500,
                        }}
                      >
                        {item.name}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          fontSize: 13,
                          borderBottom: "1px solid #f3f4f6",
                          textAlign: "right",
                        }}
                      >
                        {item.qty}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          fontSize: 13,
                          borderBottom: "1px solid #f3f4f6",
                          textAlign: "right",
                        }}
                      >
                        {formatPKR(item.unitPrice)}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          fontSize: 13,
                          borderBottom: "1px solid #f3f4f6",
                          textAlign: "right",
                          fontWeight: 600,
                        }}
                      >
                        {formatPKR(item.total)}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: "#004f35", color: "white" }}>
                    <td
                      colSpan="4"
                      style={{
                        padding: "14px 12px",
                        fontWeight: 700,
                        fontSize: 15,
                        border: "none",
                      }}
                    >
                      Net Total
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        fontWeight: 700,
                        fontSize: 15,
                        border: "none",
                        textAlign: "right",
                      }}
                    >
                      {formatPKR(selected?.amount || 0)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div
                style={{
                  marginTop: 32,
                  paddingTop: 16,
                  borderTop: "1px solid #e5e7eb",
                  textAlign: "center",
                  fontSize: 11,
                  color: "#9ca3af",
                }}
              >
                Thank you for your purchase · Pharmacy OS · Contact: +92 42 3577
                0090
              </div>
            </div>

            {/* Action buttons — not printed */}
            <div className="flex justify-between items-center pt-4 border-t border-outline-variant/60 no-print">
              <div>
                {selected?.status === "Unpaid" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<CheckCircle size={15} />}
                    onClick={() => handleMarkPaid(selected)}
                  >
                    Mark as paid
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Printer size={15} />}
                  onClick={() => handlePrint(selected)}
                >
                  Print Invoice
                </Button>
                <Button size="sm" onClick={() => setViewModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={delModal}
        onClose={() => setDelModal(false)}
        title="Delete Invoice"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDelModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={loading}>
              Delete
            </Button>
          </div>
        }
      >
        <div className="p-6">
          <p className="text-sm text-on-surface-variant">
            Are you sure you want to delete invoice{" "}
            <strong className="text-on-surface">{selected?.id}</strong>? This
            will permanently remove the transaction.
          </p>

        </div>
      </Modal>
    </>
  );
}
