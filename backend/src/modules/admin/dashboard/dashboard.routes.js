import express from "express";
import { authenticate } from "../../../middlewares/auth.js";
import authorizeRole from "../../../middlewares/rbac.js";
import validate from "../../../middlewares/validation.js";
import {
  dashboardStats,
  revenueTrendList,
  topSellingMedicinesList,
} from "./dashboard.controller.js";
import { dashboardPeriodValidation } from "./dashboard.validation.js";

const router = express.Router();

router.get(
  "/dashboard-stats",
  authenticate,
  authorizeRole("admin"),
  dashboardStats,
);

router.get(
  "/revenue-trends/:period",
  authenticate,
  authorizeRole("admin"),
  validate(dashboardPeriodValidation),
  revenueTrendList,
);

router.get(
  "/top-selling-medicines",
  authenticate,
  authorizeRole("admin"),
  topSellingMedicinesList,
);

export default router;
