import { getUsers, viewUser, changeUserStatus } from "./user.service.js";
import { sendSuccess } from "../../../utils/response.js";
import { BadRequestError } from "../../../utils/errors.js";

const getAllUsers = async (req, res, next) => {
  try {
    const result = await getUsers(req.query);
    return sendSuccess(res, result, "Users Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const userView = async (req, res, next) => {
  try {
    const result = await viewUser(req.params.id);
    return sendSuccess(res, result, "User Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const userStatusChange = async (req, res, next) => {
  try {
    if (req.user.id === req.params.id) {
      throw new BadRequestError("You cannot change your own account status");
    }
    const result = await changeUserStatus(req.params.id, req.body.status);
    return sendSuccess(res, result, "User Status Changed Successfully");
  } catch (error) {
    next(error);
  }
};

export { getAllUsers, userView, userStatusChange };
