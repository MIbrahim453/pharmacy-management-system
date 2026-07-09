import {
  getInventoryStats,
  getInventory,
  getBatchesForMedicine,
  updateBatch,
  discardBatch,
} from "./inventory.service.js";
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
    const result = await getInventory();
    return sendSuccess(res, result, "Inventory Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const batchesForMedicineList = async (req, res, next) => {
  try {
    const result = await getBatchesForMedicine(req.params.medicineId);
    return sendSuccess(res, result, "Batches Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const batchUpdate = async (req, res, next) => {
  try {
    const result = await updateBatch(req.params.id, req.body);
    return sendSuccess(res, result, "Batch Updated Successfully");
  } catch (error) {
    next(error);
  }
};

const batchDiscard = async (req, res, next) => {
  try {
    const result = await discardBatch(req.params.id);
    return sendSuccess(res, result, "Batch Discarded Successfully");
  } catch (error) {
    next(error);
  }
};

export {
  inventoryStats,
  inventoryList,
  batchesForMedicineList,
  batchUpdate,
  batchDiscard,
};
