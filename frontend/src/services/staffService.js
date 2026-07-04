import api from "./axios";

// Map backend staff details user model to frontend representation
export const mapBackendToFrontend = (s) => {
  if (!s) return null;
  return {
    id: s._id,
    name: s.name,
    email: s.email,
    role: s.staffRole || "Pharmacist",
    counter: s.staffCounter || "",
    invoices: 0,
    last: s.lastActive
      ? new Date(s.lastActive).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Never",
    status:
      s.status === "active"
        ? "Active"
        : s.status === "suspended"
        ? "Suspended"
        : "Inactive",
  };
};

/**
 * Registers a new staff member under the admin's pharmacy
 * @param {object} data - Form data containing name, email, role, counter, and pharmacyId
 */
export const registerStaff = async (data) => {
  const response = await api.post("/auth/register-staff", {
    name: data.name,
    email: data.email,
    staffRole: data.role,
    staffCounter: data.counter || undefined,
    pharmacyId: data.pharmacyId,
  });
  return response.data?.data?.staff;
};

/**
 * Fetches all staff members under the admin's pharmacy
 * @param {string} pharmacyId - Pharmacy ID of the logged in admin
 * @param {string} searchTerm - Search query to filter staff by name/email
 */
export const getAllStaff = async (pharmacyId, searchTerm = "") => {
  const response = await api.get("/admin-staff-details/all-staff", {
    params: {
      pharmacyId,
      name: searchTerm,
      limit: 1000, // Fetch all for local client-side pagination
    },
  });
  const data = response.data?.data || [];
  return data.map(mapBackendToFrontend);
};

/**
 * Updates an existing staff member's details
 * @param {string} id - Staff user ID
 * @param {object} data - Updated details containing name, email, role, and counter
 */
export const editStaffDetails = async (id, data) => {
  const response = await api.put(`/admin-staff-details/edit-staff/${id}`, {
    name: data.name,
    email: data.email,
    role: data.role,
    counter: data.counter || "",
  });
  return mapBackendToFrontend(response.data?.data);
};

/**
 * Deletes a staff member
 * @param {string} id - Staff user ID
 */
export const deleteStaffDetails = async (id) => {
  const response = await api.delete(`/admin-staff-details/delete-staff/${id}`);
  return response.data;
};

/**
 * Updates a staff member's active/suspended status
 * @param {string} id - Staff user ID
 * @param {string} status - New status: 'active', 'inactive', or 'suspended'
 */
export const changeStaffStatus = async (id, status) => {
  const response = await api.put(`/admin-staff-details/change-status/${id}`, {
    status,
  });
  return mapBackendToFrontend(response.data?.data);
};
