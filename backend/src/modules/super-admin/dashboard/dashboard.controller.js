import { getDashboardStats, getSignUpTrend } from "./dashboard.service.js";
import { sendSuccess } from "../../../utils/response.js";

const dashboardStats = async (req, res, next) => {
  try {
    const result = await getDashboardStats();
    return sendSuccess(res, result, "Dashboard Stats Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const signUpTrends = async (req, res, next) => {
  try {
    const result = await getSignUpTrend(req.params.period);
    return sendSuccess(res, result, "Sign Up Trends Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

export { dashboardStats, signUpTrends };