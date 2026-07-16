import { getPayments, paymentStats } from "./payment.service.js";
import { sendSuccess } from "../../../utils/response.js";

const paymentList = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const result = await getPayments(userId, req.query);
    return sendSuccess(res, result, "Payments Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const paymentSummary = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const result = await paymentStats(userId, req.query);
    return sendSuccess(res, result, "Payment Stats Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

export { paymentList, paymentSummary };
