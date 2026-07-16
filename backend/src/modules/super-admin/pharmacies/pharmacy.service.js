import Pharmacy from "../../../database/models/pharmacy.model.js";
import { NotFoundError, BadRequestError } from "../../../utils/errors.js";
import logger from "../../../utils/logger.js";
import User from "../../../database/models/user.model.js";
import Role from "../../../database/models/role.model.js";

const editPharmacy = async (id, data) => {
  const pharmacy = await Pharmacy.findById(id);
  if (!pharmacy) {
    throw new NotFoundError("Pharmacy not Found");
  }

  const editedPharmacy = await Pharmacy.findByIdAndUpdate(
    id,
    {
      $set: { ...data },
    },
    {
      new: true,
    },
  );

  logger.info("Pharmacy Updated Successfully");

  return editedPharmacy;
};

const deletePharmacy = async (id) => {
  const deletedPharmacy = await Pharmacy.findByIdAndDelete(id);

  if (!deletedPharmacy) {
    throw new BadRequestError("Failed To delete Pharmacy");
  }

  logger.info("Pharmacy Deleted Successfully");
};

const viewPharmacy = async (id) => {
  const pharmacy = await Pharmacy.findById(id);

  if (!pharmacy) {
    throw new NotFoundError("Pharmacy Not Found");
  }

  logger.info("Pharmacy Fetched Successfully");

  return pharmacy;
};

const getPharmacies = async (filters) => {
  const { id, pharmacy_name = "", city = "", startIndex = 0, limit = 10, order = "asc", searchTerm = "" } =
    filters;
  const sortDirection = order ? (order.toLowerCase() === "asc" ? 1 : -1) : -1;
  const pharmacies = await Pharmacy.find({
    $or: [
      { pharmacyName: { $regex: searchTerm || "", $options: "i" } },
      { city: { $regex: searchTerm || "", $options: "i" } },
    ],
    ...(id && { _id: id }),
    ...(pharmacy_name && { pharmacyName: pharmacy_name }),
    ...(city && { city: city }),
  })
    .skip(Number(startIndex))
    .limit(Number(limit))
    .sort({ updatedAt: sortDirection })
    .populate("owner", "-password")
    .populate("createdBy", "-password");

  logger.info("Pharmacies Fetched Successfully");

  return pharmacies;
};

const changeStatus = async (id, status) => {
  const pharmacy = await Pharmacy.findById(id);
  if (!pharmacy) {
    throw new NotFoundError("Pharmacy Not Found");
  }

  pharmacy.status = status;
  await pharmacy.save();

  logger.info("Pharmacy Status Changed Successfully");

  return pharmacy;
};

export {
  editPharmacy,
  deletePharmacy,
  viewPharmacy,
  getPharmacies,
  changeStatus,
};
