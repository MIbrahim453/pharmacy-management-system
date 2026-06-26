import { createAdmin, createStaff, login } from "./auth.service.js";
import { sendCreated, sendSuccess } from "../../utils/response.js";

const signUpAdmin = async (req, res, next) => {
  try {
    const result = await createAdmin(req.user, req.body);
    return sendCreated(res, result, "Admin created successfully");
  } catch (error) {
    next(error);
  }
};

const signUpStaff = async (req, res, next) => {
  try {
    const result = await createStaff(req.user, req.body);
    return sendCreated(res, result, "Staff created successfully");
  } catch (error) {
    next(error);
  }
};

const loginUsers = async (req, res, next) => {
  try {
    const result = await login(req.user);
    return sendSuccess(res, result, "User logged in successfully");
  } catch (error) {
    next(error);
  }
};

export {
  signUpAdmin,
  signUpStaff,
  loginUsers,
};
