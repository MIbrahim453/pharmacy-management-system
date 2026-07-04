import express from "express";
import { authenticate } from "../../../middlewares/auth.js";
import authorizeRole from "../../../middlewares/rbac.js";
import validate from "../../../middlewares/validation.js";
import {
  getAllStaff,
  staffDelete,
  staffEdit,
  staffStatus,
  staffView,
} from "./staff.controller.js";
import {
  staffEditValidation,
  staffStatusValidation,
} from "./staff.validation.js";

const router = express.Router();

router.put(
  "/edit-staff/:id",
  authenticate,
  authorizeRole("admin"),
  validate(staffEditValidation),
  staffEdit,
);

router.delete(
  "/delete-staff/:id",
  authenticate,
  authorizeRole("admin"),
  staffDelete,
);

router.get(
  "/all-staff",
  authenticate,
  authorizeRole("admin"),
  getAllStaff,
);

router.get(
  "/view-staff/:id",
  authenticate,
  authorizeRole("admin"),
  staffView,
);

router.put(
  "/change-status/:id",
  authenticate,
  authorizeRole("admin"),
  validate(staffStatusValidation),
  staffStatus,
);

export default router;