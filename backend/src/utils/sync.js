import Medicine from "../database/models/medicine.model.js";
import MedicineBatch from "../database/models/medicineBatch.model.js";
import Pharmacy from "../database/models/pharmacy.model.js";

export const syncMedicineStockAndExpiry = async (medicineId) => {
  const today = new Date();

  await MedicineBatch.updateMany(
    {
      medicineId,
      expiryDate: { $lte: today },
      status: "active",
    },
    {
      $set: { status: "expired" },
    }
  );

  const activeBatches = await MedicineBatch.find({
    medicineId,
    status: "active",
    currentQty: { $gt: 0 },
  }).sort({ expiryDate: 1 });

  let totalStock = 0;
  activeBatches.forEach((batch) => {
    totalStock += batch.currentQty;
  });

  const earliestBatch = activeBatches[0];
  const soonestExpiry = earliestBatch ? earliestBatch.expiryDate : null;
  const sellingPrice = earliestBatch ? earliestBatch.sellingPrice : 0;

  const medicine = await Medicine.findById(medicineId);
  if (!medicine) return;

  const pharmacySettings = await Pharmacy.findOne({ owner: medicine.createdBy });
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

  await medicine.save();
};
