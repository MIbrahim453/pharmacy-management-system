import {
  createPurchase,
  getPurchases,
  viewPurchase,
} from "./purchase.service.js";
import { sendSuccess, sendCreated } from "../../../utils/response.js";

const purchaseCreate = async (req, res, next) => {
  try {
    const result = await createPurchase(req.user.id, req.body);
    return sendCreated(res, result, "Purchase Created and Inventory Updated Successfully");
  } catch (error) {
    next(error);
  }
};

const purchaseList = async (req, res, next) => {
  try {
    const result = await getPurchases(req.query);
    return sendSuccess(res, result, "Purchases Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const purchaseView = async (req, res, next) => {
  try {
    const result = await viewPurchase(req.params.id);
    return sendSuccess(res, result, "Purchase Details Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

export { purchaseCreate, purchaseList, purchaseView };
