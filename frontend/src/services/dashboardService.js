import api from "./axios";

/**
 * Fetch general dashboard statistics (KPIs, alert counts, shelf warnings).
 */
export const getDashboardStats = async () => {
  const response = await api.get("/admin-dashboard/dashboard-stats");
  return response.data?.data;
};

/**
 * Fetch revenue trends for charts (daily, weekly, monthly, yearly).
 * @param {string} period - "daily" | "weekly" | "monthly" | "yearly"
 */
export const getRevenueTrends = async (period) => {
  const response = await api.get(`/admin-dashboard/revenue-trends/${period}`);
  return response.data?.data;
};

/**
 * Fetch top selling medicines.
 */
export const getTopSellingMedicines = async () => {
  const response = await api.get("/admin-dashboard/top-selling-medicines");
  return response.data?.data;
};
