import express from "express";
import { authenticate } from "../../../middlewares/auth.js";
import authorizeRole from "../../../middlewares/rbac.js";
import { dashboardStats, signUpTrends } from "./dashboard.controller.js";
import { dashboardPeriodValidation } from "./dashboard.validation.js";
import validate from "../../../middlewares/validation.js";

const router = express.Router();

router.get(
  "/dashboard-stats",
  authenticate,
  authorizeRole("super_admin"),
  dashboardStats,
);

router.get(
  "/sign-up-trends/:period",
  authenticate,
  authorizeRole("super_admin"),
  validate(dashboardPeriodValidation),
  signUpTrends,
);

export default router;