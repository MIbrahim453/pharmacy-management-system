import api from "./axios";

// Map backend supplier model to frontend representation
export const mapBackendToFrontend = (s) => {
  if (!s) return null;
  return {
    id: s._id,
    name: s.name,
    contact: s.contact,
    phone: s.phone,
    status: s.status === "active" ? "Active" : "Pending",
  };
};

// Map frontend data to backend payload
export const mapFrontendToBackend = (data) => {
  return {
    name: data.name,
    contact: data.contact,
    phone: data.phone,
    status: data.status,
  };
};

export const getAllSuppliers = async (searchTerm = "") => {
  const response = await api.get("/admin-suppliers/all-suppliers", {
    params: {
      name: searchTerm,
      limit: 10,
      order: "asc",
    },
  });
  const data = response.data?.data || [];
  return data.map(mapBackendToFrontend);
};

export const createSupplier = async (formData) => {
  const payload = mapFrontendToBackend(formData);
  const response = await api.post("/admin-suppliers/create-supplier", payload);
  return mapBackendToFrontend(response.data?.data);
};

export const editSupplier = async (id, formData) => {
  const payload = mapFrontendToBackend(formData);
  const response = await api.put(`/admin-suppliers/edit-supplier/${id}`, payload);
  return mapBackendToFrontend(response.data?.data);
};

export const deleteSupplier = async (id) => {
  const response = await api.delete(`/admin-suppliers/delete-supplier/${id}`);
  return response.data;
};

export const viewSupplier = async (id) => {
  const response = await api.get(`/admin-suppliers/view-supplier/${id}`);
  return mapBackendToFrontend(response.data?.data);
};

