import {
  getMedicines,
  getMedicineCategoryNames,
  createInvoice,
} from "./pos.service.js";
import { sendCreated, sendSuccess } from "../../../utils/response.js";

const getPosMedicines = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const result = await getMedicines(userId, req.query);
    return sendSuccess(res, result, "Medicines Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const getPosMedicineCategoryNames = async (req, res, next) => {
  try {
    const result = await getMedicineCategoryNames();
    return sendSuccess(res, result, "Medicine Categories Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const createPosInvoice = async (req, res, next) => {
  try {
    const result = await createInvoice(req.user.id, req.body);
    return sendCreated(res, result, "Invoice Created Successfully");
  } catch (error) {
    next(error);
  }
};

export { getPosMedicines, getPosMedicineCategoryNames, createPosInvoice };