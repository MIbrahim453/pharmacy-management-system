import MedicineBatch from "../database/models/medicineBatch.model.js";
import Medicine from "../database/models/medicine.model.js";
import { syncMedicineStockAndExpiry } from "./sync.js";
import User from "../database/models/user.model.js";

export const checkAndExpireBatches = async (userId = null) => {
  const today = new Date();

  let medicineIdFilter = {};
  if (userId) {
    const user = await User.findById(userId);
    const pharmacyId = user?.pharmacyId;
    if (!pharmacyId) return;

    const userMedicines = await Medicine.find({ pharmacyId }).select("_id");
    if (!userMedicines.length) return;

    medicineIdFilter = { medicineId: { $in: userMedicines.map((medicine) => medicine._id) } };
  }

  const expiredBatches = await MedicineBatch.find({
    ...medicineIdFilter,
    expiryDate: { $lte: today },
    status: "active",
  });

  if (expiredBatches.length === 0) {
    return;
  }

  await MedicineBatch.updateMany(
    {
      ...medicineIdFilter,
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
    await syncMedicineStockAndExpiry(id, null, userId);
  }
};
