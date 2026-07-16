import {
  dashboardStats as getDashboardStats,
  revenueTrends as getRevenueTrends,
  topSellingMedicines as getTopSellingMedicines,
} from "./dashboard.service.js";
import { sendSuccess } from "../../../utils/response.js";

const dashboardStats = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const result = await getDashboardStats(userId);
    return sendSuccess(res, result, "Dashboard Stats Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const revenueTrendList = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const result = await getRevenueTrends(userId, req.params.period);
    return sendSuccess(res, result, "Revenue Trends Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const topSellingMedicinesList = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const result = await getTopSellingMedicines(userId);
    return sendSuccess(res, result, "Top Selling Medicines Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

export { dashboardStats, revenueTrendList, topSellingMedicinesList };
