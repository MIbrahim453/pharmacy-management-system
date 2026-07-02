import express from "express";
import { authenticate } from "../../../middlewares/auth.js";
import authorizeRole from "../../../middlewares/rbac.js";
import {
  analyticsCard,
  getHourlySignIns,
  getPharmaciesByCity,
} from "./analytics.controller.js";

const router = express.Router();

router.get(
  "/hourly-signIns",
  authenticate,
  authorizeRole("super_admin"),
  getHourlySignIns,
);

router.get(
  "/pharmacy-by-city",
  authenticate,
  authorizeRole("super_admin"),
  getPharmaciesByCity,
);

router.get(
  "/analytics",
  authenticate,
  authorizeRole("super_admin"),
  analyticsCard,
);

export default router;
