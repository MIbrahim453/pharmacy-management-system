import api from "./axios";
import { mapBackendToFrontend } from "./medicineService";

/**
 * Maps backend batch fields to frontend format
 */
export const mapBatchToFrontend = (b) => {
  if (!b) return null;
  return {
    id: b._id,
    batchNumber: b.batchNumber,
    expiry: b.expiryDate
      ? new Date(b.expiryDate).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "—",
    expiryDateStr: b.expiryDate
      ? new Date(b.expiryDate).toISOString().split("T")[0]
      : "",
    initialQty: b.initialQty,
    currentQty: b.currentQty,
    costPrice: b.costPrice || 0,
    sellingPrice: b.sellingPrice || 0,
    supplier: b.supplierId?.name || "—",
    supplierId: b.supplierId?._id || b.supplierId || "",
    status:
      b.status === "active"
        ? "Active"
        : b.status === "expired"
        ? "Expired"
        : "Discarded",
    location: b.location || "",
  };
};

/**
 * Fetches overall inventory stats
 */
export const getInventoryStats = async () => {
  const response = await api.get("/admin-inventory/stats");
  return response.data?.data;
};

/**
 * Fetches categorised inventory lists with nested batches mapped
 */
export const getInventoryList = async () => {
  const response = await api.get("/admin-inventory/all");
  const data = response.data?.data || {};

  const mapMedicine = (m) => {
    const mapped = mapBackendToFrontend(m);
    return {
      ...mapped,
      batches: (m.batches || []).map(mapBatchToFrontend),
    };
  };

  return {
    allMedicines: (data.allMedicines || []).map(mapMedicine),
    lowStock: (data.lowStock || []).map(mapMedicine),
    expireSoon: (data.expireSoon || []).map(mapMedicine),
    expired: (data.expired || []).map(mapMedicine),
  };
};

/**
 * Fetches all batches for a specific medicine
 */
export const getInventoryBatches = async (medicineId) => {
  const response = await api.get(`/admin-inventory/batches/${medicineId}`);
  const data = response.data?.data || [];
  return data.map(mapBatchToFrontend);
};

/**
 * Updates a batch's information (stock qty, expiry, cost, supplier)
 */
export const editBatch = async (id, batchData) => {
  const payload = {
    batchNumber: batchData.batchNumber,
    expiryDate: batchData.expiryDate,
    costPrice: Number(batchData.costPrice),
    sellingPrice: Number(batchData.sellingPrice),
    currentQty: Number(batchData.currentQty),
    location: batchData.location || "",
    supplierId: batchData.supplierId || null,
  };
  const response = await api.put(`/admin-inventory/edit-batch/${id}`, payload);
  return mapBatchToFrontend(response.data?.data);
};

/**
 * Discards a batch (zeros out stock quantity and sets status to discarded)
 */
export const discardBatch = async (id) => {
  const response = await api.put(`/admin-inventory/discard-batch/${id}`);
  return mapBatchToFrontend(response.data?.data);
};
