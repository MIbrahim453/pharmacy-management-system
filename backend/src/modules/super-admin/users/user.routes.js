import express from "express";
import { authenticate } from "../../../middlewares/auth.js";
import authorizeRole from "../../../middlewares/rbac.js";
import validate from "../../../middlewares/validation.js";
import { getAllUsers, userView, userStatusChange } from "./user.controller.js";
import { userStatusValidation } from "./user.validation.js";

const router = express.Router();

router.get(
  "/all-users",
  authenticate,
  authorizeRole("super_admin"),
  getAllUsers,
);

router.get(
  "/view-user/:id",
  authenticate,
  authorizeRole("super_admin"),
  userView,
);

router.put(
  "/change-status/:id",
  authenticate,
  authorizeRole("super_admin"),
  validate(userStatusValidation),
  userStatusChange,
);

export default router;
