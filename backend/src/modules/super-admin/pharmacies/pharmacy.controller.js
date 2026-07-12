import {
  changeStatus,
  deletePharmacy,
  editPharmacy,
  getPharmacies,
  viewPharmacy,
} from "./pharmacy.service.js";
import { sendSuccess } from "../../../utils/response.js";
import { UnauthorizedError } from "../../../utils/errors.js";

const pharmacyEdit = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await editPharmacy(id, req.body);
    return sendSuccess(res, result, "Pharmacy Edited Successfully");
  } catch (error) {
    next(error);
  }
};

const pharmacyDelete = async (req, res, next) => {
  try {
    const result = await deletePharmacy(req.params.id);
    return sendSuccess(res, result, "Pharmacy Deleted Successfully");
  } catch (error) {
    next(error);
  }
};

const getAllPharmacies = async (req, res, next) => {
  try {
    const result = await getPharmacies(req.query);
    return sendSuccess(res, result, "Pharmacies Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const pharmacyView = async (req, res, next) => {
  try {
    const role = req.user.role?.name ?? req.user.role;
    if (role === "admin" && String(req.user.pharmacyId) !== String(req.params.id)) {
      throw new UnauthorizedError("Access Denied. You can only view details of your own pharmacy.");
    }
    const result = await viewPharmacy(req.params.id);
    return sendSuccess(res, result, "Pharmacy Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const pharmacyStatus = async (req, res, next) => {
  try {
    const result = await changeStatus(req.params.id, req.body.status);
    return sendSuccess(res, result, "Pharmacy Status Changed Successfully");
  } catch (error) {
    next(error);
  }
};

export {
  pharmacyEdit,
  pharmacyDelete,
  getAllPharmacies,
  pharmacyView,
  pharmacyStatus,
};