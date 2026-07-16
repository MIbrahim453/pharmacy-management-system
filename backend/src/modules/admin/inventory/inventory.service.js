import Medicine from "../../../database/models/medicine.model.js";
import User from "../../../database/models/user.model.js";
import MedicineBatch from "../../../database/models/medicineBatch.model.js";
import logger from "../../../utils/logger.js";
import { syncMedicineStockAndExpiry } from "../../../utils/sync.js";
import { BadRequestError, NotFoundError } from "../../../utils/errors.js";

const getInventoryStats = async (userId) => {
  const user = await User.findById(userId);
  const pharmacyId = user?.pharmacyId;

  const userMedicineIds = pharmacyId
    ? await Medicine.find({ pharmacyId }).select("_id")
    : [];
  const scopedMedicineIds = userMedicineIds.map((medicine) => medicine._id);

  const medInStock = await Medicine.countDocuments({
    status: "inStock",
    pharmacyId,
  });
  const medLowStock = await Medicine.countDocuments({
    status: "lowStock",
    pharmacyId,
  });
  const medCritical = await Medicine.countDocuments({
    status: "critical",
    pharmacyId,
  });

  const belowReorderMedicines = await Medicine.countDocuments({
    pharmacyId,
    reorderLevel: { $gt: 0 },
    $expr: {
      $lte: ["$stockQty", "$reorderLevel"],
    },
  });

  const today = new Date();
  const next30Days = new Date(today.getDate() + 30);

  const inventoryQuery =
    scopedMedicineIds.length > 0
      ? { medicineId: { $in: scopedMedicineIds } }
      : { medicineId: { $in: [] } };

  const expiringIn30Days = await MedicineBatch.countDocuments({
    ...inventoryQuery,
    status: "active",
    expiryDate: {
      $gte: today,
      $lte: next30Days,
    },
  });

  const expired = await MedicineBatch.countDocuments({
    ...inventoryQuery,
    status: "expired",
  });
  const discarded = await MedicineBatch.countDocuments({
    ...inventoryQuery,
    status: "discarded",
  });
  const totalActive = await MedicineBatch.countDocuments({
    ...inventoryQuery,
    status: "active",
  });

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

// Helper Function
const getMedicinesWithBatches = async (userId, query = {}) => {
  const user = await User.findById(userId);
  const pharmacyId = user?.pharmacyId;

  const medicines = await Medicine.find({ pharmacyId, ...query })
    .populate("category", "name")
    .populate("createdBy", "name email");

  const result = [];
  for (const medicine of medicines) {
    const batches = await MedicineBatch.find({
      medicineId: medicine._id,
    }).populate("supplierId", "name contact phone");

    result.push({
      ...medicine.toObject(),
      batches,
    });
  }
  return result;
};

const getInventory = async (userId) => {
  const allMedicines = await getMedicinesWithBatches(userId, {});

  const lowStock = await getMedicinesWithBatches(userId, {
    status: { $in: ["lowStock", "critical"] },
  });

  const today = new Date();
  const next30Days = new Date(today.getDate() + 30);

  const user = await User.findById(userId);
  const pharmacyId = user?.pharmacyId;
  const userMedicineIds = pharmacyId
    ? await Medicine.find({ pharmacyId }).select("_id")
    : [];
  const scopedMedicalIds = userMedicineIds.map((medicine) => medicine._id);

  const expiringSoonBatches = await MedicineBatch.find({
    medicineId: { $in: scopedMedicalIds },
    status: "active",
    expiryDate: { $gte: today, $lte: next30Days },
  });

  const expiringSoonMedIds = Array.from(
    new Set(expiringSoonBatches.map((b) => b.medicineId.toString())),
  );

  const expireSoon = await getMedicinesWithBatches(userId, {
    _id: { $in: expiringSoonMedIds },
  });

  const expiredBatches = await MedicineBatch.find({
    medicineId: { $in: scopedMedicalIds },
    status: "expired",
  });

  const expiredMedIds = Array.from(
    new Set(expiredBatches.map((b) => b.medicineId.toString())),
  );

  const expired = await getMedicinesWithBatches(userId, {
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

const getBatchesForMedicine = async (userId, medicineId) => {
  const user = await User.findById(userId);
  const pharmacyId = user?.pharmacyId;

  const medicine = await Medicine.findOne({ _id: medicineId, pharmacyId });
  if (!medicine) {
    throw new NotFoundError("Medicine Not Found");
  }

  const batches = await MedicineBatch.find({ medicineId }).populate(
    "supplierId",
    "name contact phone",
  );

  logger.info(`Batches for Medicine ${medicineId} Fetched Successfully`);
  return batches;
};

const updateBatch = async (userId, batchId, data) => {
  const batch = await MedicineBatch.findById(batchId);
  if (!batch) {
    throw new NotFoundError("Batch Not Found");
  }

  const medicine = await Medicine.findById(batch.medicineId);
  const user = await User.findById(userId);
  const pharmacyId = user?.pharmacyId;
  if (!medicine || medicine.pharmacyId?.toString() !== pharmacyId?.toString()) {
    throw new NotFoundError("Batch Not Found");
  }

  const fields = [
    "batchNumber",
    "expiryDate",
    "costPrice",
    "sellingPrice",
    "currentQty",
    "supplierId",
    "location",
  ];
  fields.forEach((field) => {
    if (data[field] !== undefined) {
      batch[field] = data[field];
    }
  });

  if (batch.expiryDate && new Date(batch.expiryDate) <= new Date()) {
    batch.status = "expired";
  } else if (
    batch.status === "expired" &&
    batch.expiryDate &&
    new Date(batch.expiryDate) > new Date()
  ) {
    batch.status = "active";
  }

  await batch.save();

  await syncMedicineStockAndExpiry(batch.medicineId, null, userId);

  const updatedBatch = await MedicineBatch.findById(batchId).populate(
    "supplierId",
    "name contact phone",
  );

  logger.info(`Batch ${batchId} Updated and Stock Synchronized`);
  return updatedBatch;
};

const discardBatch = async (userId, batchId) => {
  const batch = await MedicineBatch.findById(batchId);
  if (!batch) {
    throw new NotFoundError("Batch Not Found");
  }

  const medicine = await Medicine.findById(batch.medicineId);
  if (!medicine || medicine.createdBy?.toString() !== userId?.toString()) {
    throw new NotFoundError("Batch Not Found");
  }

  batch.status = "discarded";
  batch.currentQty = 0;
  await batch.save();

  await syncMedicineStockAndExpiry(batch.medicineId, null, userId);

  const updatedBatch = await MedicineBatch.findById(batchId).populate(
    "supplierId",
    "name contact phone",
  );

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
