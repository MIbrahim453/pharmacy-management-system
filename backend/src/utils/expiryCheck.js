import MedicineBatch from "../database/models/medicineBatch.model.js";
import { syncMedicineStockAndExpiry } from "./sync.js";

export const checkAndExpireBatches = async () => {
  const today = new Date();

  const expiredBatches = await MedicineBatch.find({
    expiryDate: { $lte: today },
    status: "active",
  });

  if (expiredBatches.length === 0) {
    return;
  }

  await MedicineBatch.updateMany(
    {
      _id: { $in: expiredBatches.map((b) => b._id) },
    },
    {
      $set: { status: "expired" },
    }
  );

  const affectedMedicineIds = Array.from(
    new Set(expiredBatches.map((b) => b.medicineId.toString()))
  );

  for (const id of affectedMedicineIds) {
    await syncMedicineStockAndExpiry(id);
  }
};
