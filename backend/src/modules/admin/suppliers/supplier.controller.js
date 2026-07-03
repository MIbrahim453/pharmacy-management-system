import {
  addSupplier,
  editSupplier,
  deleteSupplier,
  viewSupplier,
  getSuppliers,
} from "./supplier.service.js";
import { sendCreated, sendSuccess } from "../../../utils/response.js";

const supplierCreate = async (req, res, next) => {
  try {
    const result = await addSupplier(req.user.id, req.body);
    return sendCreated(res, result, "Supplier Created Successfully");
  } catch (error) {
    next(error);
  }
};

const supplierEdit = async (req, res, next) => {
  try {
    const result = await editSupplier(req.user.id, req.params.id, req.body);
    return sendSuccess(res, result, "Supplier Updated Successfully");
  } catch (error) {
    next(error);
  }
};

const supplierDelete = async (req, res, next) => {
  try {
    const result = await deleteSupplier(req.params.id);
    return sendSuccess(res, result ?? null, "Supplier Deleted Successfully");
  } catch (error) {
    next(error);
  }
};

const supplierView = async (req, res, next) => {
  try {
    const result = await viewSupplier(req.params.id);
    return sendSuccess(res, result, "Supplier Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const getAllSuppliers = async (req, res, next) => {
  try {
    const result = await getSuppliers(req.query);
    return sendSuccess(res, result, "Suppliers Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

export {
  supplierCreate,
  supplierEdit,
  supplierDelete,
  supplierView,
  getAllSuppliers,
};
