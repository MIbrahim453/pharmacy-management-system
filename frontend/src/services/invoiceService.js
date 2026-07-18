import api from "./axios";

// Map backend invoice structure to frontend representation
export const mapBackendInvoiceToFrontend = (inv) => {
  if (!inv) return null;
  return {
    id: inv._id,
    invoiceNumber: inv.invoiceNumber,
    customer: inv.customerName,
    customerPhone: inv.customerPhone,
    date: inv.createdAt ? new Date(inv.createdAt).toISOString().split('T')[0] : "",
    items: inv.items?.length || 0,
    amount: inv.grandTotal || 0,
    method: inv.paymentMethod || "Cash",
    status: inv.paymentStatus || "Unpaid",
    itemsList: inv.items || [],
    discount: inv.discount || 0,
    subTotal: inv.subTotal || 0,
    pharmacy: inv.pharmacyId, // populated pharmacy details
    createdBy: inv.createdBy, // populated createdBy details
  };
};

/**
 * Fetch all invoices for a given role with optional filtering
 */
export const getAllInvoices = async (role, filters = {}) => {
  const endpoint = role === "admin" ? "/admin-invoices/all-invoices" : "/staff-invoices/all-invoices";
  const response = await api.get(endpoint, {
    params: {
      searchTerm: filters.searchTerm || "",
      status: filters.status && filters.status !== "All" ? filters.status : undefined,
      limit: 10,
      order: "asc",
    },
  });
  const data = response.data?.data || [];
  return data.map(mapBackendInvoiceToFrontend);
};

/**
 * Fetch specific invoice details
 */
export const getInvoiceDetails = async (role, id) => {
  const endpoint = role === "admin" ? `/admin-invoices/view-invoice/${id}` : `/staff-invoices/view-invoice/${id}`;
  const response = await api.get(endpoint);
  return mapBackendInvoiceToFrontend(response.data?.data);
};

/**
 * Edit an existing invoice
 */
export const editInvoiceDetails = async (role, id, invoiceData) => {
  const endpoint = role === "admin" ? `/admin-invoices/edit-invoice/${id}` : `/staff-invoices/edit-invoice/${id}`;
  const response = await api.put(endpoint, invoiceData);
  return mapBackendInvoiceToFrontend(response.data?.data);
};

/**
 * Mark an invoice as paid
 */
export const markInvoicePaid = async (role, id) => {
  const endpoint = role === "admin" ? `/admin-invoices/mark-paid/${id}` : `/staff-invoices/mark-paid/${id}`;
  const response = await api.put(endpoint);
  return response.data?.data;
};

/**
 * Download invoice PDF
 */
export const downloadInvoicePdf = async (role, id) => {
  const endpoint = role === "admin" ? `/admin-invoices/download-invoice/${id}` : `/staff-invoices/download-invoice/${id}`;
  const response = await api.get(endpoint, {
    responseType: "blob",
  });
  return response.data;
};
