import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Receipt, CheckCircle, Eye, Pencil, Trash2, Printer, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
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
import {
  getAllInvoices,
  getInvoiceDetails,
  editInvoiceDetails,
  markInvoicePaid,
  downloadInvoicePdf,
} from "../../../services/invoiceService";
import { getAllMedicines } from "../../../services/medicineService";
import { getPosMedicines } from "../../../services/posService";

const PER_PAGE = 8;
const BLANK = {
  customer: "",
  customerPhone: "",
  date: "",
  amount: "",
  itemsList: [],
  discount: 0,
  method: "Cash",
  status: "Unpaid",
};

export default function Invoices() {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || "admin";

  const [invoices, setInvoices] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [query, setQuery] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [page, setPage] = useState(1);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const invoiceRef = useRef(null);

  // Searchable Medicine Dropdown States
  const [medSearchQuery, setMedSearchQuery] = useState("");
  const [medSearchOpen, setMedSearchOpen] = useState(false);

  // Dosage Quantity Modal States
  const [qtyMed, setQtyMed] = useState(null);
  const [qtyMode, setQtyMode] = useState("dosage");
  const [dosage, setDosage] = useState("1");
  const [days, setDays] = useState("1");
  const [customQty, setCustomQty] = useState("1");
  const [editingItemIndex, setEditingItemIndex] = useState(null);

  const computedQty = (() => {
    if (qtyMode === "dosage") return Math.max(1, (Number(dosage) || 0) * (Number(days) || 0));
    return Math.max(1, Number(customQty) || 0);
  })();

  const fetchInvoices = async () => {
    setLoadingList(true);
    try {
      const data = await getAllInvoices(role);
      setInvoices(data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      toast.error(error.response?.data?.message || "Failed to load invoices");
    } finally {
      setLoadingList(false);
    }
  };

  const fetchAllMedicines = async () => {
    try {
      let meds = [];
      if (role === "admin") {
        meds = await getAllMedicines();
      } else {
        meds = await getPosMedicines();
      }
      const mapped = meds.map((m) => ({
        id: m.id || m._id,
        name: m.name,
        sellingPrice: m.sellingPrice || 0,
      }));
      setAllMedicines(mapped);
    } catch (error) {
      console.error("Failed to load medicines list:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
    if (user) {
      fetchAllMedicines();
    }
  }, [role, user]);

  const filtered = invoices.filter(
    (inv) =>
      (statusF === "All" || inv.status === statusF) &&
      (inv.invoiceNumber.toLowerCase().includes(query.toLowerCase()) ||
        inv.customer.toLowerCase().includes(query.toLowerCase())),
  );
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  
  const totalUnpaid = invoices
    .filter((i) => i.status === "Unpaid")
    .reduce((s, i) => s + i.amount, 0);

  const field = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const removeItem = (index) => {
    const newItems = form.itemsList.filter((_, idx) => idx !== index);
    const subTotal = newItems.reduce((acc, it) => acc + it.total, 0);
    const grandTotal = subTotal - Number(form.discount || 0);
    
    setForm((prev) => ({
      ...prev,
      itemsList: newItems,
      amount: String(grandTotal),
    }));
  };

  const openQtyModalForExistingItem = (item, index) => {
    const med = allMedicines.find((m) => m.id === (item.medicineId?._id || item.medicineId)) || {
      id: item.medicineId?._id || item.medicineId,
      name: item.medicineName,
      sellingPrice: item.unitPrice,
    };
    
    setQtyMed(med);
    setEditingItemIndex(index);
    setQtyMode("custom");
    setCustomQty(String(item.quantity));
    setDosage("1");
    setDays("1");
  };
  
  const confirmQuantity = () => {
    if (!qtyMed) return;
    
    let newItems = [...form.itemsList];
    
    if (editingItemIndex !== null) {
      newItems[editingItemIndex].quantity = computedQty;
      newItems[editingItemIndex].total = computedQty * newItems[editingItemIndex].unitPrice;
      toast.success(`Updated ${qtyMed.name} quantity to ${computedQty}`);
    } else {
      const medicineId = qtyMed.id;
      const existingIndex = form.itemsList.findIndex((item) => item.medicineId === medicineId);
      
      if (existingIndex > -1) {
        newItems[existingIndex].quantity += computedQty;
        newItems[existingIndex].total = newItems[existingIndex].quantity * newItems[existingIndex].unitPrice;
      } else {
        const newItem = {
          medicineId: qtyMed.id,
          medicineName: qtyMed.name,
          quantity: computedQty,
          unitPrice: qtyMed.sellingPrice || 0,
          total: (qtyMed.sellingPrice || 0) * computedQty,
        };
        newItems.push(newItem);
      }
      toast.success(`${computedQty} × ${qtyMed.name} added to invoice`);
    }
    
    const subTotal = newItems.reduce((acc, it) => acc + it.total, 0);
    const grandTotal = subTotal - Number(form.discount || 0);
    
    setForm((prev) => ({
      ...prev,
      itemsList: newItems,
      amount: String(grandTotal),
    }));
    
    setQtyMed(null);
    setEditingItemIndex(null);
  };

  const handleDiscountChange = (val) => {
    const discount = Math.max(0, Number(val) || 0);
    const subTotal = form.itemsList.reduce((acc, it) => acc + it.total, 0);
    const grandTotal = subTotal - discount;
    
    setForm((prev) => ({
      ...prev,
      discount,
      amount: String(grandTotal),
    }));
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    
    if (!form.itemsList || form.itemsList.length === 0) {
      toast.error("Invoice must contain at least one item");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerName: form.customer,
        customerPhone: form.customerPhone,
        paymentMethod: form.method,
        discount: Number(form.discount) || 0,
        items: (form.itemsList || []).map((item) => ({
          medicineId: item.medicineId?._id || item.medicineId,
          quantity: item.quantity,
        })),
      };

      let updated = await editInvoiceDetails(role, selected.id, payload);

      if (form.status === "Paid" && selected.status === "Unpaid") {
        await markInvoicePaid(role, selected.id);
        updated.status = "Paid";
      }

      setInvoices((prev) =>
        prev.map((inv) => (inv.id === selected.id ? updated : inv))
      );
      toast.success(`Invoice ${selected.invoiceNumber} updated successfully`);
      setEditModal(false);
      setSelected(null);
      setForm(BLANK);
    } catch (error) {
      console.error("Failed to edit invoice:", error);
      toast.error(error.response?.data?.message || "Failed to update invoice");
    } finally {
      setLoading(false);
    }
  };

  const openView = async (inv) => {
    try {
      const details = await getInvoiceDetails(role, inv.id);
      setSelected(details);
      setViewModal(true);
    } catch (error) {
      console.error("Failed to fetch details:", error);
      toast.error(error.response?.data?.message || "Failed to load invoice details");
    }
  };

  const openEdit = (inv) => {
    setSelected(inv);
    setForm({
      customer: inv.customer || "",
      customerPhone: inv.customerPhone || "",
      date: inv.date,
      amount: String(inv.amount),
      itemsList: (inv.itemsList || []).map((item) => ({
        medicineId: item.medicineId?._id || item.medicineId,
        medicineName: item.medicineName || item.medicineId?.name || "Unknown",
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || item.medicineId?.sellingPrice || 0,
        total: item.total || (item.quantity * (item.unitPrice || item.medicineId?.sellingPrice || 0)),
      })),
      discount: inv.discount || 0,
      method: inv.method,
      status: inv.status,
    });
    setEditModal(true);
  };

  const handlePrint = async (inv) => {
    try {
      toast.info("Generating print layout…");
      const blob = await downloadInvoicePdf(role, inv.id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.focus();
      } else {
        toast.error("Popup blocked! Please allow popups to print invoices.");
      }
    } catch (error) {
      console.error("Failed to print PDF:", error);
      toast.error("Failed to print invoice PDF");
    }
  };

  const handleDownloadPdf = async (inv) => {
    try {
      const blob = await downloadInvoicePdf(role, inv.id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${inv.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success(`Downloading invoice-${inv.invoiceNumber}.pdf`);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast.error("Failed to download invoice PDF");
    }
  };

  const handleMarkPaid = async (inv) => {
    try {
      await markInvoicePaid(role, inv.id);
      setInvoices((prev) =>
        prev.map((i) => (i.id === inv.id ? { ...i, status: "Paid" } : i))
      );
      toast.success(`${inv.invoiceNumber} marked as paid`);
      if (selected?.id === inv.id) {
        setSelected({ ...selected, status: "Paid" });
      }
    } catch (error) {
      console.error("Failed to mark paid:", error);
      toast.error(error.response?.data?.message || "Failed to mark invoice as paid");
    }
  };

  const filteredMeds = medSearchQuery
    ? allMedicines.filter((m) =>
        m.name.toLowerCase().includes(medSearchQuery.toLowerCase())
      )
    : allMedicines.slice(0, 10);

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

        {loadingList ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant/70">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm">Loading invoices...</p>
          </div>
        ) : (
          <>
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
                          {inv.invoiceNumber}
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
                          {role === "admin" && (
                            <button
                              onClick={() => handleDownloadPdf(inv)}
                              className="btn-ghost p-1.5 rounded-lg text-primary/70 hover:text-primary hover:bg-primary/[0.08]"
                              title="Download PDF"
                            >
                              <Download size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => openView(inv)}
                            className="btn-ghost p-1.5 rounded-lg"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>
                          {inv.status === "Unpaid" ? (
                            <button
                              onClick={() => openEdit(inv)}
                              className="btn-ghost p-1.5 rounded-lg"
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                          ) : (
                            <span className="w-8" />
                          )}
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
          </>
        )}
      </Card>

      {/* Edit Modal */}
      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Invoice"
        subtitle={`Editing ${selected?.invoiceNumber}`}
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
          <div className="grid grid-cols-2 gap-4">
            <Input label="Invoice Number" value={selected?.invoiceNumber || ""} disabled />
            <Input
              label="Invoice Date"
              type="date"
              value={form.date}
              disabled
              required
            />
          </div>
          <Input
            label="Customer name"
            value={form.customer}
            onChange={(e) => field("customer", e.target.value)}
            required
          />
          <Input
            label="Customer phone"
            value={form.customerPhone}
            onChange={(e) => field("customerPhone", e.target.value)}
            required
            placeholder="e.g. 03001234567"
          />

          {/* Medicines with Qty and Price Editor */}
          <div className="border border-outline-variant/60 rounded-xl mt-4">
            <div className="bg-surface-container px-4 py-2.5 text-xs font-semibold text-on-surface-variant border-b border-outline-variant/60 flex justify-between items-center rounded-t-xl">
              <span>Medicines List</span>
              <span>Items: {form.itemsList?.length || 0}</span>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-outline-variant/40">
              {form.itemsList?.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3 bg-surface-container-lowest">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-on-surface truncate">{item.medicineName}</div>
                    <div className="text-xs text-on-surface-variant">{formatPKR(item.unitPrice)} each</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 bg-surface-container rounded-lg p-1 text-sm font-medium">
                      <span className="text-on-surface px-1">{item.quantity} tabs</span>
                      <button
                        type="button"
                        onClick={() => openQtyModalForExistingItem(item, idx)}
                        className="p-1 rounded-md hover:bg-primary/[0.12] hover:text-primary text-on-surface-variant transition-colors"
                        title="Edit quantity / dosage"
                      >
                        <Pencil size={12} />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-on-surface min-w-[70px] text-right">
                      {formatPKR(item.total)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1.5 rounded-lg hover:bg-error/[0.08] hover:text-error text-on-surface-variant transition-colors"
                      title="Remove medicine"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {(!form.itemsList || form.itemsList.length === 0) && (
                <div className="p-5 text-center text-xs text-on-surface-variant">
                  No medicines in this invoice. Use search/select below to add.
                </div>
              )}
            </div>
            
            {/* Styled Search Bar for Adding Medicine */}
            <div className="relative p-3 bg-surface-container-low border-t border-outline-variant/60 rounded-b-xl">
              <div className="relative">
                <input
                  type="text"
                  className="input-base text-xs h-9 pr-4 w-full rounded-xl bg-surface border border-outline-variant"
                  style={{ paddingLeft: "2.5rem" }}
                  placeholder="Search and add medicine to invoice..."
                  value={medSearchQuery}
                  onChange={(e) => {
                    setMedSearchQuery(e.target.value);
                    setMedSearchOpen(true);
                  }}
                  onFocus={() => setMedSearchOpen(true)}
                  onBlur={() => setTimeout(() => setMedSearchOpen(false), 200)}
                />
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
              </div>
              
              {medSearchOpen && (
                <div className="absolute left-3 right-3 mt-1 max-h-48 overflow-y-auto rounded-xl border border-outline-variant bg-surface shadow-lg z-20 divide-y divide-outline-variant/40">
                    {filteredMeds.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-xs hover:bg-primary/[0.06] text-on-surface hover:text-primary transition-colors flex justify-between items-center"
                        onClick={() => {
                          setQtyMed(m);
                          setQtyMode("dosage");
                          setDosage("1");
                          setDays("1");
                          setCustomQty("1");
                          setMedSearchQuery("");
                          setMedSearchOpen(false);
                        }}
                      >
                        <span className="font-medium text-on-surface">{m.name}</span>
                        <span className="text-[10px] text-on-surface-variant font-mono">{formatPKR(m.sellingPrice)}</span>
                      </button>
                    ))}
                    {filteredMeds.length === 0 && (
                      <div className="p-3 text-center text-xs text-on-surface-variant">No matching medicines found</div>
                    )}
                  </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Discount (Rs)"
              type="number"
              min="0"
              value={form.discount}
              onChange={(e) => handleDiscountChange(e.target.value)}
              required
            />
            <Input
              label="Net Total"
              value={formatPKR(Number(form.amount) || 0)}
              disabled
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Payment Method"
              value={form.method}
              onChange={(e) => field("method", e.target.value)}
              options={["Cash", "Card", "Bank Transfer", "Cheque"]}
            />
            <Select
              label="Payment Status"
              value={form.status}
              onChange={(e) => field("status", e.target.value)}
              options={["Paid", "Unpaid"]}
              disabled={selected?.status === "Paid"}
            />
          </div>
        </form>
      </Modal>

      {/* View / Print Modal — Professional Invoice */}
      <Modal
        open={viewModal}
        onClose={() => setViewModal(false)}
        title="Invoice"
        subtitle={selected?.invoiceNumber}
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
                    {(user?.pharmacyName || "Pharmacy OS").replace(/crescent\s*/gi, "")} · Lahore, Pakistan
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
                    {selected?.invoiceNumber}
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
                      className={`status ${selected?.status === "Paid" ? "status-paid" : "status-unpaid"} ${selected?.status === "Paid" ? "text-success bg-success/[0.08]" : "text-error bg-error/[0.08]"}`}
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
                    {selected?.customer} {selected?.customerPhone ? `(${selected.customerPhone})` : ""}
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
                  {(selected?.itemsList || []).map((item, index) => (
                    <tr key={item._id || index}>
                      <td
                        style={{
                          padding: "10px 12px",
                          fontSize: 13,
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {index + 1}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          fontSize: 13,
                          borderBottom: "1px solid #f3f4f6",
                          fontWeight: 500,
                        }}
                      >
                        {item.medicineName || item.medicineId?.name || "Unknown"}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          fontSize: 13,
                          borderBottom: "1px solid #f3f4f6",
                          textAlign: "right",
                        }}
                      >
                        {item.quantity}
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
                  <tr>
                    <td colSpan="4" style={{ padding: "8px 12px", fontSize: 13, borderBottom: "1px solid #f3f4f6", color: "#6b7280" }}>
                      Subtotal
                    </td>
                    <td style={{ padding: "8px 12px", fontSize: 13, borderBottom: "1px solid #f3f4f6", textAlign: "right", color: "#4b5563" }}>
                      {formatPKR(selected?.subTotal || selected?.amount || 0)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="4" style={{ padding: "8px 12px", fontSize: 13, borderBottom: "1px solid #f3f4f6", color: "#6b7280" }}>
                      Discount
                    </td>
                    <td style={{ padding: "8px 12px", fontSize: 13, borderBottom: "1px solid #f3f4f6", textAlign: "right", color: "#16a34a" }}>
                      -{formatPKR(selected?.discount || 0)}
                    </td>
                  </tr>
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
                {role === "admin" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Download size={15} />}
                    onClick={() => handleDownloadPdf(selected)}
                  >
                    Download PDF
                  </Button>
                )}
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

      {/* Add-to-invoice quantity modal */}
      <Modal 
        open={!!qtyMed} 
        onClose={() => {
          setQtyMed(null);
          setEditingItemIndex(null);
        }} 
        title={editingItemIndex !== null ? "Edit quantity" : "Add medicine"} 
        subtitle={qtyMed?.name}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => {
              setQtyMed(null);
              setEditingItemIndex(null);
            }}>Cancel</Button>
            <Button onClick={confirmQuantity}>
              {editingItemIndex !== null ? "Update" : "Add"} {computedQty} · {qtyMed ? formatPKR(qtyMed.sellingPrice * computedQty) : ""}
            </Button>
          </div>
        }
      >
        {qtyMed && (
          <div className="p-6 space-y-4">
            <div className="flex rounded-xl border border-outline-variant overflow-hidden">
              {[["dosage", "By dosage & days"], ["custom", "Custom quantity"]].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setQtyMode(key)}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                    qtyMode === key ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {qtyMode === "dosage" ? (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Dosage (tabs/day)" type="number" min="1" value={dosage} onChange={(e) => setDosage(e.target.value)} />
                <Input label="No. of days" type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} />
              </div>
            ) : (
              <Input label="Quantity" type="number" min="1" value={customQty} onChange={(e) => setCustomQty(e.target.value)} />
            )}

            <div className="rounded-xl bg-surface-container p-3 flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Total quantity</span>
              <span className="font-bold text-on-surface tnum">{computedQty} tabs</span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
