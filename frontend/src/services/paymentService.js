import api from "./axios";

/**
 * Fetch all payments list
 */
export const getPayments = async (params = {}) => {
  const response = await api.get("/admin-payments/all-payments", { params });
  return response.data?.data;
};

/**
 * Fetch payment stats
 */
export const getPaymentStats = async (params = {}) => {
  const response = await api.get("/admin-payments/payment-stats", { params });
  return response.data?.data;
};
