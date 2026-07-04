import { getInventoryStats, getInventory } from "./inventory.service.js";
import { sendSuccess } from "../../../utils/response.js";

const inventoryStats = async (req, res, next) => {
  try {
    const result = await getInventoryStats();
    return sendSuccess(res, result, "Inventory Stats Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const inventoryList = async (req, res, next) => {
  try {
    const result = await getInventory(req.query.status);
    return sendSuccess(res, result, "Inventory Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

export { inventoryStats, inventoryList };