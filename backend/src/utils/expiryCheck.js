import MedicineBatch from "../database/models/medicineBatch.model.js";
import User from "../database/models/user.model.js";
import { syncMedicineStockAndExpiry } from "./sync.js";

export const checkAndExpireBatches = async (userId = null) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const batchFilter = {
    expiryDate: { $lte: today },
    status: "active",
  };

  if (userId) {
    const user = await User.findById(userId).select("pharmacyId");

    if (!user?.pharmacyId) {
      return;
    }

    batchFilter.pharmacyId = user.pharmacyId;
  }

  const expiredBatches =
    await MedicineBatch.find(batchFilter).select("_id medicineId");

  if (expiredBatches.length === 0) {
    return;
  }

  await MedicineBatch.updateMany(
    {
      _id: {
        $in: expiredBatches.map((batch) => batch._id),
      },
    },
    {
      $set: {
        status: "expired",
      },
    },
  );

  const affectedMedicineIds = [
    ...new Set(expiredBatches.map((batch) => batch.medicineId.toString())),
  ];

  await Promise.all(
    affectedMedicineIds.map((medicineId) =>
      syncMedicineStockAndExpiry(medicineId, null, userId),
    ),
  );
};
