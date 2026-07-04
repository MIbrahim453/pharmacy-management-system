import {
  editStaff,
  deleteStaff,
  getStaff,
  viewStaff,
  changeStatus,
} from "./staff.service.js";
import { sendSuccess } from "../../../utils/response.js";

const staffEdit = async (req, res, next) => {
  try {
    const result = await editStaff(req.user.id, req.params.id, req.body);
    return sendSuccess(res, result, "Staff Updated Successfully");
  } catch (error) {
    next(error);
  }
};

const staffDelete = async (req, res, next) => {
  try {
    const result = await deleteStaff(req.params.id);
    return sendSuccess(res, result ?? null, "Staff Deleted Successfully");
  } catch (error) {
    next(error);
  }
};

const getAllStaff = async (req, res, next) => {
  try {
    const result = await getStaff(req.query);
    return sendSuccess(res, result, "Staff Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const staffView = async (req, res, next) => {
  try {
    const result = await viewStaff(req.params.id);
    return sendSuccess(res, result, "Staff Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const staffStatus = async (req, res, next) => {
  try {
    const result = await changeStatus(req.params.id, req.body.status);
    return sendSuccess(res, result, "Staff Status Changed Successfully");
  } catch (error) {
    next(error);
  }
};

export {
  staffEdit,
  staffDelete,
  getAllStaff,
  staffView,
  staffStatus,
};