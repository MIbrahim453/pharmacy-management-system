import Medicine from "../../../database/models/medicine.model.js";
import MedicineBatch from "../../../database/models/medicineBatch.model.js";
import logger from "../../../utils/logger.js";
import { syncMedicineStockAndExpiry } from "../../../utils/sync.js";
import { BadRequestError, NotFoundError } from "../../../utils/errors.js";

const getInventoryStats = async () => {
  const medInStock = await Medicine.countDocuments({ status: "inStock" });
  const medLowStock = await Medicine.countDocuments({ status: "lowStock" });
  const medCritical = await Medicine.countDocuments({ status: "critical" });
  
  const belowReorderMedicines = await Medicine.countDocuments({
    reorderLevel: { $gt: 0 },
    $expr: {
      $lte: ["$stockQty", "$reorderLevel"],
    },
  });

  const today = new Date();
  const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiringIn30Days = await MedicineBatch.countDocuments({
    status: "active",
    expiryDate: {
      $gte: today,
      $lte: next30Days,
    },
  });

  const expired = await MedicineBatch.countDocuments({ status: "expired" });
  const discarded = await MedicineBatch.countDocuments({ status: "discarded" });
  const totalActive = await MedicineBatch.countDocuments({ status: "active" });

  logger.info("Inventory Stats Fetched Successfully");

  return {
    medInStock,
    medLowStock,
    medCritical,
    belowReorderMedicines,
    expiringIn30Days,
    expired,
    discarded,
    totalActive,
  };
};

const getMedicinesWithBatches = async (query) => {
  const medicines = await Medicine.find(query)
    .populate("category", "name")
    .populate("createdBy", "name email");

  const result = [];
  for (const medicine of medicines) {
    const batches = await MedicineBatch.find({ medicineId: medicine._id })
      .populate("supplierId", "name contact phone");

    result.push({
      ...medicine.toObject(),
      batches,
    });
  }
  return result;
};

const getInventory = async () => {
  const allMedicines = await getMedicinesWithBatches({});

  const lowStock = await getMedicinesWithBatches({
    status: { $in: ["lowStock", "critical"] },
  });

  const today = new Date();
  const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiringSoonBatches = await MedicineBatch.find({
    status: "active",
    expiryDate: { $gte: today, $lte: next30Days },
  });
  
  const expiringSoonMedIds = Array.from(
    new Set(expiringSoonBatches.map((b) => b.medicineId.toString()))
  );
  
  const expireSoon = await getMedicinesWithBatches({
    _id: { $in: expiringSoonMedIds },
  });

  const expiredBatches = await MedicineBatch.find({ status: "expired" });
  
  const expiredMedIds = Array.from(
    new Set(expiredBatches.map((b) => b.medicineId.toString()))
  );
  
  const expired = await getMedicinesWithBatches({
    _id: { $in: expiredMedIds },
  });

  logger.info("Inventory Lists Fetched Successfully");

  return {
    allMedicines,
    lowStock,
    expireSoon,
    expired,
  };
};

const getBatchesForMedicine = async (medicineId) => {
  const batches = await MedicineBatch.find({ medicineId })
    .populate("supplierId", "name contact phone");
    
  logger.info(`Batches for Medicine ${medicineId} Fetched Successfully`);
  return batches;
};

const updateBatch = async (batchId, data) => {
  const batch = await MedicineBatch.findById(batchId);
  if (!batch) {
    throw new NotFoundError("Batch Not Found");
  }

  const fields = ["batchNumber", "expiryDate", "costPrice", "sellingPrice", "currentQty", "supplierId", "location"];
  fields.forEach((field) => {
    if (data[field] !== undefined) {
      batch[field] = data[field];
    }
  });

  if (batch.expiryDate && new Date(batch.expiryDate) <= new Date()) {
    batch.status = "expired";
  } else if (batch.status === "expired" && batch.expiryDate && new Date(batch.expiryDate) > new Date()) {
    batch.status = "active";
  }

  await batch.save();

  await syncMedicineStockAndExpiry(batch.medicineId);

  const updatedBatch = await MedicineBatch.findById(batchId)
    .populate("supplierId", "name contact phone");

  logger.info(`Batch ${batchId} Updated and Stock Synchronized`);
  return updatedBatch;
};

const discardBatch = async (batchId) => {
  const batch = await MedicineBatch.findById(batchId);
  if (!batch) {
    throw new NotFoundError("Batch Not Found");
  }

  batch.status = "discarded";
  batch.currentQty = 0;
  await batch.save();

  await syncMedicineStockAndExpiry(batch.medicineId);

  const updatedBatch = await MedicineBatch.findById(batchId)
    .populate("supplierId", "name contact phone");

  logger.info(`Batch ${batchId} Discarded and Stock Synchronized`);
  return updatedBatch;
};

export {
  getInventoryStats,
  getInventory,
  getBatchesForMedicine,
  updateBatch,
  discardBatch,
};
