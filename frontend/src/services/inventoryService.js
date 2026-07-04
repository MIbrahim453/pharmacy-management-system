import api from "./axios";
import { mapBackendToFrontend } from "./medicineService";

/**
 * Fetches overall inventory stats
 */
export const getInventoryStats = async () => {
  const response = await api.get("/admin-inventory/stats");
  return response.data?.data;
};

/**
 * Fetches categorised inventory lists
 */
export const getInventoryList = async () => {
  const response = await api.get("/admin-inventory/all");
  const data = response.data?.data || {};
  return {
    allMedicines: (data.allMedicines || []).map(mapBackendToFrontend),
    lowStock: (data.lowStock || []).map(mapBackendToFrontend),
    expireSoon: (data.expireSoon || []).map(mapBackendToFrontend),
    expired: (data.expired || []).map(mapBackendToFrontend),
  };
};
