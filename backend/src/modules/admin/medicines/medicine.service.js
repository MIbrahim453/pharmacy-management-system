import Medicine from "../../../database/models/medicine.model.js";
import User from "../../../database/models/user.model.js";
import Category from "../../../database/models/category.model.js";
import logger from "../../../utils/logger.js";
import { BadRequestError, NotFoundError } from "../../../utils/errors.js";
import MedicineBatch from "../../../database/models/medicineBatch.model.js";

const addMedicine = async (userId, data) => {
  const user = await User.findOne({ _id: userId, status: "active" });
  const pharmacyId = user?.pharmacyId;

  const existingMedicine = await Medicine.findOne({
    pharmacyId,
    name: data.name,
  });
  if (existingMedicine) {
    throw new BadRequestError(
      "Medicine Already Registered. You can edit or delete it to add a new one",
    );
  }

  const categoryId = await Category.findOne({ name: data.category });

  const createMedicine = await Medicine.create({
    name: data.name,
    genericName: data.genericName,
    category: categoryId,
    manufacturer: data.manufacturer,
    saleUnit: data.saleUnit,
    stockQty: 0,
    reorderLevel: data.reorderLevel || 0,
    status: "critical",
    createdBy: userId,
    pharmacyId,
  });

  const medicine = await Medicine.findById(createMedicine._id)
    .populate("category")
    .populate("createdBy", "name email");

  logger.info("Medicine Added Successfully");

  return medicine;
};

const editMedicine = async (userId, id, data) => {
  const findMedicine = await Medicine.findById(id);
  if (!findMedicine) {
    throw new NotFoundError("Medicine Not Found");
  }

  const user = await User.findOne({ _id: userId, status: "active" });
  const pharmacyId = user?.pharmacyId;
  if (pharmacyId && findMedicine.pharmacyId?.toString() !== pharmacyId.toString()) {
    throw new NotFoundError("Medicine Not Found");
  }

  const categoryId = await Category.findOne({ name: data.category });

  await Medicine.findByIdAndUpdate(id, {
    $set: {
      name: data.name,
      genericName: data.genericName,
      category: categoryId,
      manufacturer: data.manufacturer,
      saleUnit: data.saleUnit,
      reorderLevel: data.reorderLevel,
      createdBy: userId,
    },
  });

  const medicine = await Medicine.findById(id)
    .populate("category")
    .populate("createdBy", "name email");

  logger.info("Medicine Updated Successfully");

  return medicine;
};

const deleteMedicine = async (id) => {
  const activeBatchesCount = await MedicineBatch.countDocuments({
    medicineId: id,
  });
  if (activeBatchesCount > 0) {
    throw new BadRequestError(
      "Cannot delete medicine with active inventory batches or history",
    );
  }

  const deleteMed = await Medicine.findByIdAndDelete(id);
  if (!deleteMed) {
    throw new BadRequestError("Failed To delete Medicine");
  }

  logger.info("Medicine Deleted Successfully");
};

const viewMedicine = async (id) => {
  const medicine = await Medicine.findById(id)
    .populate("category")
    .populate("createdBy", "name email");

  if (!medicine) {
    throw new NotFoundError("Medicine Not Found");
  }

  logger.info("Medicine Fetched Successfully");

  return medicine;
};

const getMedicines = async (userId, filters) => {
  const {
    id,
    name = "",
    category = "",
    startIndex = 0,
    limit = 10,
    order = "asc",
    searchTerm = "",
  } = filters;

  const sortDirection = order ? (order.toLowerCase() === "asc" ? 1 : -1) : -1;
  const catId = [];

    if (category) {
      const categories = await Category.find({
        name: { $regex: category, $options: "i" },
      }).select("_id");
      categories.forEach((item) => catId.push(item._id));
    }

  if (searchTerm) {
    const categories = await Category.find({
      name: { $regex: searchTerm, $options: "i" },
    }).select("_id");
    categories.forEach((category) => {
      catId.push(category._id);
    });
  }

  const user = await User.findOne({ _id: userId, status: "active" });
  const pharmacyId = user?.pharmacyId;

  const queryObj = { pharmacyId };

  if (category && catId.length > 0) {
    queryObj.category = { $in: catId };
  }

  if (searchTerm) {
    queryObj.$or = [
      { name: { $regex: searchTerm, $options: "i" } },
      { genericName: { $regex: searchTerm, $options: "i" } },
      { manufacturer: { $regex: searchTerm, $options: "i" } },
    ];
  }

  if (id) queryObj._id = id;
  if (name) queryObj.name = name;

  const medicines = await Medicine.find(queryObj)
    .skip(Number(startIndex))
    .limit(Number(limit))
    .sort({ updatedAt: sortDirection })
    .populate("category", "name")
    .populate("createdBy", "name email");

  logger.info("Medicines Fetched Successfully");

  return medicines;
};

const getMedicineCategoryNames = async () => {
  const categories = await Category.find()
    .select("name -_id")
    .sort({ name: 1 });
  logger.info("Medicine Categories Fetched Successfully");
  return categories.map((category) => category.name);
};

export {
  addMedicine,
  editMedicine,
  deleteMedicine,
  viewMedicine,
  getMedicines,
  getMedicineCategoryNames,
};
