import api from "./axios";

/**
 * Creates a new purchase invoice and adds its items as inventory batches
 */
export const createPurchase = async (purchaseData) => {
  const payload = {
    supplierId: purchaseData.supplierId,
    invoiceNumber: purchaseData.invoiceNumber || "",
    purchaseDate: purchaseData.purchaseDate,
    notes: purchaseData.notes || "",
    items: (purchaseData.items || []).map((item) => ({
      medicineId: item.medicineId,
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
      purchaseUnit: item.purchaseUnit,
      purchaseQty: Number(item.purchaseQty),
      costPrice: Number(item.costPrice),
      sellingPrice: Number(item.sellingPrice),
      location: item.location || "",
      packaging: item.packaging || [],
    })),
  };
  const response = await api.post("/admin-purchases/create-purchase", payload);
  return response.data?.data;
};

/**
 * Fetches all purchase logs
 */
export const getAllPurchases = async (params = {}) => {
  const response = await api.get("/admin-purchases/all-purchases", { params });
  return response.data?.data || [];
};

/**
 * Fetches details for a single purchase log
 */
export const viewPurchase = async (id) => {
  const response = await api.get(`/admin-purchases/view-purchase/${id}`);
  return response.data?.data;
};
