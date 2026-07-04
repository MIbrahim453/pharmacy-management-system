import Medicine from "../../../database/models/medicine.model.js";
import logger from "../../../utils/logger.js";
import { BadRequestError } from "../../../utils/errors.js";

const getInventoryStats = async () => {
  const medInStock = await Medicine.countDocuments({ status: "inStock" });
  const medLowStock = await Medicine.countDocuments({ status: "lowStock" });
  const belowReorderMedicines = await Medicine.countDocuments({
    reorderLevel: { $ne: null },
    $expr: {
      $lte: ["$stockQty", "$reorderLevel"],
    },
  });

  const today = new Date();
  const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiryIn30Days = await Medicine.countDocuments({
    expiryDate: {
      $gte: today,
      $lte: next30Days,
    },
  });

  const expired = await Medicine.countDocuments({
    expiryDate: {
      $lt: today,
    },
  });

  logger.info("Inventory Stats Fetched Successfully");

  return {
    medInStock,
    belowReorderMedicines,
    expiryIn30Days,
    expired,
  };
};

const getInventory = async (status) => {
  const allMedicines = await Medicine.find().populate("category", "name");

  const lowStock = await Medicine.find({
    status: "lowStock",
  }).populate("category", "name");

  const today = new Date();
  const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expireSoon = await Medicine.find({
    expiryDate: {
      $gte: today,
      $lte: next30Days,
    },
  }).populate("category", "name");

  const expired = await Medicine.find({
    expiryDate: {
      $lt: today,
    },
  }).populate("category", "name");

  logger.info("Inventory Fetched Successfully");

  return {
    allMedicines,
    lowStock,
    expireSoon,
    expired,
  };
};

export { getInventoryStats, getInventory };
