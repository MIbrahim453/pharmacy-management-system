import Medicine from "../database/models/medicine.model.js";
import MedicineBatch from "../database/models/medicineBatch.model.js";
import Pharmacy from "../database/models/pharmacy.model.js";
import User from "../database/models/user.model.js";

export const syncMedicineStockAndExpiry = async (medicineId, session = null, userId = null) => {
  const today = new Date();

  const medicineQuery = Medicine.findById(medicineId);
  if (session) {
    medicineQuery.session(session);
  }
  const medicine = await medicineQuery;
  if (!medicine) return;

  if (userId) {
    const user = await User.findById(userId);
    const pharmacyId = user?.pharmacyId;
    if (!pharmacyId) return;
    if (medicine.pharmacyId?.toString() !== pharmacyId.toString()) return;
  }

  await MedicineBatch.updateMany(
    {
      medicineId,
      expiryDate: { $lte: today },
      status: "active",
    },
    {
      $set: { status: "expired" },
    },
    session ? { session } : undefined,
  );

  const activeBatchesQuery = MedicineBatch.find({
    medicineId,
    status: "active",
    currentQty: { $gt: 0 },
  }).sort({ expiryDate: 1 });

  if (session) {
    activeBatchesQuery.session(session);
  }

  const activeBatches = await activeBatchesQuery;

  let totalStock = 0;
  activeBatches.forEach((batch) => {
    totalStock += batch.currentQty;
  });

  const earliestBatch = activeBatches[0];
  const soonestExpiry = earliestBatch ? earliestBatch.expiryDate : null;
  const sellingPrice = earliestBatch ? earliestBatch.sellingPrice : 0;

  const pharmacyQuery = Pharmacy.findById(medicine.pharmacyId);
  if (session) {
    pharmacyQuery.session(session);
  }
  const pharmacySettings = await pharmacyQuery;
  const criticalThreshold = pharmacySettings ? pharmacySettings.criticalStockThreshold : 10;
  const lowThreshold = pharmacySettings ? pharmacySettings.lowStockThreshold : 20;

  let newStatus = "inStock";
  if (totalStock <= criticalThreshold) {
    newStatus = "critical";
  } else if (totalStock <= lowThreshold) {
    newStatus = "lowStock";
  }

  medicine.stockQty = totalStock;
  medicine.expiryDate = soonestExpiry;
  medicine.sellingPrice = sellingPrice;
  medicine.status = newStatus;

  await medicine.save(session ? { session } : undefined);
};