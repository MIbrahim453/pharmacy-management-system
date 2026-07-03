import Supplier from "../../../database/models/supplier.model.js";
import User from "../../../database/models/user.model.js";
import logger from "../../../utils/logger.js";
import { BadRequestError, NotFoundError } from "../../../utils/errors.js";

const addSupplier = async (userId, data) => {
  const user = await User.findById(userId);

  const existingSupplier = await Supplier.findOne({
    name: data.name,
    pharmacyId: user?.pharmacyId,
  });

  if (existingSupplier) {
    throw new BadRequestError("Supplier already exists For this Pharmacy");
  }
  const createSupplier = await Supplier.create({
    ...data,
    pharmacyId: user?.pharmacyId,
    createdBy: user?._id,
  });

  const supplier = await Supplier.findById(createSupplier._id)
    .populate("pharmacyId", "pharmacy_name")
    .populate("createdBy", "name email");

  logger.info("Supplier Added Successfully");

  return supplier;
};

const editSupplier = async (userId, id, data) => {
  const findSupplier = await Supplier.findById(id);

  if (!findSupplier) {
    throw new NotFoundError("Supplier Not Found");
  }

  const updateSupplier = await Supplier.findByIdAndUpdate(
    id,
    {
      $set: {
        name: data.name,
        contact: data.contact,
        phone: data.phone,
        status: data.status,
        createdBy: userId,
      },
    },
    {
      new: true,
    },
  );

  const supplier = await Supplier.findById(updateSupplier._id)
    .populate("pharmacyId", "pharmacy_name")
    .populate("createdBy", "name email");

  logger.info("Supplier Updated Successfully");

  return supplier;
};

const deleteSupplier = async (id) => {
  const deleteSupplier = await Supplier.findByIdAndDelete(id);

  if (!deleteSupplier) {
    throw new BadRequestError("Failed To delete Supplier");
  }

  logger.info("Supplier Deleted Successfully");
};

const viewSupplier = async (id) => {
  const supplier = await Supplier.findById(id)
    .populate("pharmacyId", "pharmacy_name")
    .populate("createdBy", "name email");

  if (!supplier) {
    throw new NotFoundError("Supplier Not Found");
  }

  logger.info("Supplier Fetched Successfully");

  return supplier;
};

const getSuppliers = async (filters) => {
  const {
    id,
    name = "",
    contact = "",
    startIndex = 0,
    limit = 1000,
    order = "asc",
  } = filters;

  const sortDirection = order ? (order.toLowerCase() === "asc" ? 1 : -1) : -1;

  const suppliers = await Supplier.find({
    $or: [
      { name: { $regex: name, $options: "i" } },
      { contact: { $regex: contact, $options: "I" } },
    ],
    ...(id && { _id: id }),
    ...(name && { name: name }),
    ...(contact && { contact: contact }),
  })
    .skip(Number(startIndex))
    .limit(Number(limit))
    .sort({ updatedAt: sortDirection })
    .populate("pharmacyId", "pharmacy_name")
    .populate("createdBy", "name email");

  logger.info("Suppliers Fetched Successfully");

  return suppliers;
};

export {
  addSupplier,
  editSupplier,
  deleteSupplier,
  viewSupplier,
  getSuppliers,
};
