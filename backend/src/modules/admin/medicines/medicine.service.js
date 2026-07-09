import Medicine from "../../../database/models/medicine.model.js";
import Category from "../../../database/models/category.model.js";
import logger from "../../../utils/logger.js";
import { BadRequestError, NotFoundError } from "../../../utils/errors.js";
import MedicineBatch from "../../../database/models/medicineBatch.model.js";

const addMedicine = async (userId, data) => {
  const existingMedicine = await Medicine.findOne({
    createdBy: userId,
    name: data.name,
  });
  if (existingMedicine) {
    throw new BadRequestError(
      "Medicine Already Registered. You can edit or delete it to add a new one"
    );
  }

  let categoryId;
  const existingCategory = await Category.findOne({ name: data.category });
  if (existingCategory) {
    categoryId = existingCategory._id;
  } else {
    const newCategory = await Category.create({ name: data.category });
    categoryId = newCategory._id;
  }

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

  let categoryId;
  const existingCategory = await Category.findOne({ name: data.category });
  if (existingCategory) {
    categoryId = existingCategory._id;
  } else {
    const newCategory = await Category.create({ name: data.category });
    categoryId = newCategory._id;
  }

  await Medicine.findByIdAndUpdate(
    id,
    {
      $set: {
        name: data.name,
        genericName: data.genericName,
        category: categoryId,
        manufacturer: data.manufacturer,
        saleUnit: data.saleUnit,
        sellingPrice: data.sellingPrice,
        reorderLevel: data.reorderLevel,
        createdBy: userId,
      },
    }
  );

  const medicine = await Medicine.findById(id)
    .populate("category")
    .populate("createdBy", "name email");

  logger.info("Medicine Updated Successfully");

  return medicine;
};

const deleteMedicine = async (id) => {
  const activeBatchesCount = await MedicineBatch.countDocuments({ medicineId: id });
  if (activeBatchesCount > 0) {
    throw new BadRequestError("Cannot delete medicine with active inventory batches or history.");
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

const getMedicines = async (filters) => {
  const { id, name = "", category = "", startIndex = 0, limit = 1000, order = "asc", searchTerm = "" } = filters;

  const sortDirection = order ? (order.toLowerCase() === "asc" ? 1 : -1) : -1;
  const catId = [];
  
  if (searchTerm) {
    const categories = await Category.find({
      name: { $regex: searchTerm, $options: "i" }
    }).select("_id");
    categories.forEach(category => {
      catId.push(category._id);
    });
  }

  const medicines = await Medicine.find({
    $or: [
      {
        name: { $regex: searchTerm || "", $options: "i" }
      },
      {
        genericName: { $regex: searchTerm || "", $options: "i" }
      },
      {
        manufacturer: { $regex: searchTerm || "", $options: "i" }
      },
      ...(catId.length > 0 ? [{ category: { $in: catId } }] : [])
    ],
    ...(id && { _id: id }),
    ...(name && { name: name })
  })
    .skip(Number(startIndex))
    .limit(Number(limit))
    .sort({ updatedAt: sortDirection })
    .populate("category", "name")
    .populate("createdBy", "name email");

  logger.info("Medicines Fetched Successfully");

  return medicines;
};

const getMedicineCategoryNames = async () => {
  const categories = await Category.find().select("name -_id").sort({ name: 1 });
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
