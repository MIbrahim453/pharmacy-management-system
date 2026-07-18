import express from "express";
import {
  loginUsers,
  refreshAccessToken,
  signUpAdmin,
  signUpStaff,
  forgotPasswordUser,
  resetPasswordUser,
  changePasswordUser,
  getUser,
  updateProfileUser,
  deleteAccountUser,
  logoutUser,
} from "./auth.controller.js";
import authorizeRole from "../../middlewares/rbac.js";
import validate from "../../middlewares/validation.js";
import { authLimiter, changePasswordLimiter } from "../../middlewares/rateLimiter.js";
import {
  registerAdminValidation,
  registerStaffValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  profileValidation,
  changePasswordValidation,
} from "./auth.validation.js";
import { authenticate, authenticateLocal } from "../../middlewares/auth.js";

const router = express.Router();

router.post(
  "/register-pharmacy",
  validate(registerAdminValidation),
  authenticate,
  authorizeRole("super_admin"),
  signUpAdmin,
);

router.post(
  "/register-staff",
  validate(registerStaffValidation),
  authenticate,
  authorizeRole("admin"),
  signUpStaff,
);

router.post("/login", authLimiter, validate(loginValidation), authenticateLocal, loginUsers);

router.post("/refresh-token", refreshAccessToken);

router.post(
  "/forgot-password",
  validate(forgotPasswordValidation),
  forgotPasswordUser,
);

router.post(
  "/reset-password/:token",
  validate(resetPasswordValidation),
  resetPasswordUser,
);

router.post(
  "/change-password",
  authenticate,
  changePasswordLimiter,
  validate(changePasswordValidation),
  changePasswordUser,
);
router.get("/me", authenticate, getUser);
router.put(
  "/profile",
  authenticate,
  validate(profileValidation),
  updateProfileUser,
);
router.delete(
  "/profile",
  authenticate,
  authorizeRole("admin", "staff"),
  deleteAccountUser,
);
router.post("/logout", authenticate, logoutUser);

export default router;