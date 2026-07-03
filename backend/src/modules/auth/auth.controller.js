import {
  createAdmin,
  createStaff,
  login,
  refreshToken,
  forgetPassword,
  resetPassword,
  changePassword,
  getMe,
  updateProfile,
} from "./auth.service.js";
import { sendCreated, sendSuccess } from "../../utils/response.js";
import logger from "../../utils/logger.js";

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
    const result = await login(req.user, req);
    return sendSuccess(res, result, "User logged in successfully");
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const result = await refreshToken(req.body.refreshToken);
    return sendSuccess(res, result, "Token Refreshed Successfully");
  } catch (error) {
    next(error);
  }
};

const forgotPasswordUser = async (req, res, next) => {
  try {
    const result = await forgetPassword(req.body.email);
    return sendSuccess(res, result, "Password reset link sent successfully");
  } catch (error) {
    next(error);
  }
};

const resetPasswordUser = async (req, res, next) => {
  try {
    const result = await resetPassword(req.params.token, req.body.password);
    return sendSuccess(res, result, "Password reset successfully");
  } catch (error) {
    next(error);
  }
};

const changePasswordUser = async (req, res, next) => {
  try {
    const result = await changePassword(
      req.user.id,
      req.body.oldPassword,
      req.body.newPassword,
    );
    return sendSuccess(res, result, "Password changed successfully");
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const result = await getMe(req.user.id);
    return sendSuccess(res, result, "User Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const updateProfileUser = async (req, res, next) => {
  try {
    const result = await updateProfile(req.user.id, req.body);
    return sendSuccess(res, result, "User Profile Updated Successfully");
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    return sendSuccess(res, null, "User logged out successfully");
    logger.info("User Logged Out Successfully");
  } catch (error) {
    next(error);
  }
};
export {
  signUpAdmin,
  signUpStaff,
  loginUsers,
  refreshAccessToken,
  forgotPasswordUser,
  resetPasswordUser,
  changePasswordUser,
  getUser,
  updateProfileUser,
  logoutUser,
};
