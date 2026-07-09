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
    genericName: m.genericName || "",
    category: m.category?.name || m.category || "",
    manufacturer: m.manufacturer || "",
    saleUnit: m.saleUnit || "",
    sellingPrice: m.sellingPrice || 0,
    stock: m.stockQty || 0,
    reorder: m.reorderLevel || 0,
    expiry: m.expiryDate
      ? new Date(m.expiryDate).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "—",
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
        : m.status || "Critical",
    exp: getExpiryStatus(m.expiryDate),
  };
};

// Map frontend data to backend payload
export const mapFrontendToBackend = (data) => {
  return {
    name: data.name,
    genericName: data.genericName,
    category: data.category,
    manufacturer: data.manufacturer,
    saleUnit: data.saleUnit,
    sellingPrice: data.sellingPrice ? Number(data.sellingPrice) : 0,
    reorderLevel: data.reorderLevel ? Number(data.reorderLevel) : 0,
  };
};

export const getAllMedicines = async (searchTerm = "") => {
  const response = await api.get("/admin-medicines/all-medicines", {
    params: {
      searchTerm,
      limit: 1000,
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
