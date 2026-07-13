import {
  addMedicine,
  editMedicine,
  deleteMedicine,
  viewMedicine,
  getMedicines,
  getMedicineCategoryNames,
} from "./medicine.service.js";
import { sendCreated, sendSuccess } from "../../../utils/response.js";

const medicineCreate = async (req, res, next) => {
  try {
    const result = await addMedicine(req.user.id, req.body);
    return sendCreated(res, result, "Medicine Created Successfully");
  } catch (error) {
    next(error);
  }
};

const medicineEdit = async (req, res, next) => {
  try {
    const result = await editMedicine(req.user.id, req.params.id, req.body);
    return sendSuccess(res, result, "Medicine Updated Successfully");
  } catch (error) {
    next(error);
  }
};

const medicineDelete = async (req, res, next) => {
  try {
    const result = await deleteMedicine(req.params.id);
    return sendSuccess(res, result ?? null, "Medicine Deleted Successfully");
  } catch (error) {
    next(error);
  }
};

const medicineView = async (req, res, next) => {
  try {
    const result = await viewMedicine(req.params.id);
    return sendSuccess(res, result, "Medicine Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const getAllMedicines = async (req, res, next) => {
  try {
    const result = await getMedicines(req.user.id, req.query);
    return sendSuccess(res, result, "Medicines Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const getMedicineCategoryNamesController = async (req, res, next) => {
  try {
    const result = await getMedicineCategoryNames();
    return sendSuccess(res, result, "Medicine Categories Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

export {
  medicineCreate,
  medicineEdit,
  medicineDelete,
  medicineView,
  getAllMedicines,
  getMedicineCategoryNamesController,
};