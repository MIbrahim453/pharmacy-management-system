import api from "./axios";

// Helper to determine expiry status
const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return "ok";
  const today = new Date();
  const exp = new Date(expiryDate);
  const diffTime = exp.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "err";
  if (diffDays < 180) return "warn"; // Less than 6 months
  return "ok";
};

// Map backend medicine model to frontend representation
export const mapBackendToFrontend = (m) => {
  if (!m) return null;
  return {
    id: m._id,
    name: m.name,
    brand: m.brand,
    category: m.category?.name || m.category || "",
    stock: m.stockQty,
    reorder: m.reorderLevel || 0,
    pricePerTab: m.tabPrice,
    pricePerStrip: m.stripPrice,
    pricePerPack: m.packPrice,
    expiry: m.expiryDate
      ? new Date(m.expiryDate).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "",
    expiryDateStr: m.expiryDate
      ? new Date(m.expiryDate).toISOString().split("T")[0]
      : "",
    status:
      m.status === "inStock"
        ? "In stock"
        : m.status === "lowStock"
        ? "Low stock"
        : m.status === "critical"
        ? "Critical"
        : m.status || "In stock",
    exp: getExpiryStatus(m.expiryDate),
  };
};

// Map frontend data to backend payload
export const mapFrontendToBackend = (data) => {
  return {
    name: data.name,
    brand: data.brand,
    category: data.category,
    expiryDate: data.expiryDate,
    stockQty: Number(data.stockQty),
    reorderLevel: data.reorderLevel ? Number(data.reorderLevel) : undefined,
    tabPrice: Number(data.tabPrice),
    stripPrice: Number(data.stripPrice),
    packPrice: Number(data.packPrice),
    status: data.status,
  };
};

export const getAllMedicines = async (searchTerm = "") => {
  const response = await api.get("/admin-medicines/all-medicines", {
    params: {
      searchTerm,
      limit: 1000, // Fetch all for local client-side category filtering and pagination
    },
  });
  const data = response.data?.data || [];
  return data.map(mapBackendToFrontend);
};

export const createMedicine = async (formData) => {
  const payload = mapFrontendToBackend(formData);
  const response = await api.post("/admin-medicines/create-medicine", payload);
  return mapBackendToFrontend(response.data?.data);
};

export const editMedicine = async (id, formData) => {
  const payload = mapFrontendToBackend(formData);
  const response = await api.put(`/admin-medicines/edit-medicine/${id}`, payload);
  return mapBackendToFrontend(response.data?.data);
};

export const deleteMedicine = async (id) => {
  const response = await api.delete(`/admin-medicines/delete-medicine/${id}`);
  return response.data;
};

export const viewMedicine = async (id) => {
  const response = await api.get(`/admin-medicines/view-medicine/${id}`);
  return mapBackendToFrontend(response.data?.data);
};

export const getCategoryNames = async () => {
  const response = await api.get("/admin-medicines/category-names");
  return response.data?.data || [];
};
