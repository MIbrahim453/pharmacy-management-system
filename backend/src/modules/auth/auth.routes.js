import express from "express";
import { loginUsers, signUpAdmin, signUpStaff } from "./auth.controller.js";
import authorizeRole from "../../middlewares/rbac.js";
import validate from "../../middlewares/validation.js";
import {
  registerAdminValidation,
  registerStaffValidation,
  loginValidation,
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

router.post(
  "/login",
  validate(loginValidation),
  authenticateLocal,
  loginUsers,
);

export default router;
