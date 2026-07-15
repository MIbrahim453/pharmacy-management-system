import api from "./axios";

export const getPosMedicines = async (searchTerm = "", category = "") => {
  const response = await api.get("/staff-pos/all-medicines", {
    params: {
      searchTerm,
      category: category === "All" ? "" : category,
      limit: 100, // Fetch a reasonably large list to browse/search
    },
  });
  return response.data?.data || [];
};

export const getPosCategories = async () => {
  const response = await api.get("/staff-pos/category-names");
  return response.data?.data || [];
};

export const createPosInvoice = async (invoiceData) => {
  const response = await api.post("/staff-pos/create-invoice", invoiceData);
  return response.data?.data;
};

