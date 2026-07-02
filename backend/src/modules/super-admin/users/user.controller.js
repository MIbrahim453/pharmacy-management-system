import { getUsers, viewUser } from "./user.service.js";
import { sendSuccess } from "../../../utils/response.js";

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

export { getAllUsers, userView };
