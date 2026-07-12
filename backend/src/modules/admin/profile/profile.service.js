import Pharmacy from "../../../database/models/pharmacy.model.js";
import { NotFoundError } from "../../../utils/errors.js";

const addPharmacyDetail = async (id, data) => {
  const pharmacy = await Pharmacy.findById(id).populate("owner", "-password");

  if (!pharmacy) {
    throw new NotFoundError("Pharmacy Not Found");
  }

  const fields = ["pharmacyEmail", "address", "phone", "totalStaff"];
  fields.forEach((field) => {
    if (data[field] !== undefined) {
      pharmacy[field] = data[field];
    }
  });

  await pharmacy.save();
  return pharmacy;
};

const pharmacySettings = async (id, data) => {
  const pharmacy = await Pharmacy.findById(id)
    .populate("owner", "-password")
    .populate("createdBy", "-password");

  if (!pharmacy) {
    throw new NotFoundError("Pharmacy Not Found");
  }

  if (data.discount !== undefined) {
    pharmacy.discount = data.discount;
  }
  if (data.lowStockThreshold !== undefined) {
    pharmacy.lowStockThreshold = data.lowStockThreshold;
  }
  if (data.criticalStockThreshold !== undefined) {
    pharmacy.criticalStockThreshold = data.criticalStockThreshold;
  }

  await pharmacy.save();
  return pharmacy;
};

export { addPharmacyDetail, pharmacySettings };