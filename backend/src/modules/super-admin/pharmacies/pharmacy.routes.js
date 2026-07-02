import express from "express";
import { authenticate } from "../../../middlewares/auth.js";
import validate from "../../../middlewares/validation.js";
import authorizeRole from "../../../middlewares/rbac.js";
import { editPharmacyValidation } from "./pharmacy.validation.js";
import {
  dashboardStats,
  getAllPharmacies,
  pharmacyDelete,
  pharmacyEdit,
  pharmacyStatus,
  pharmacyView,
  signUpTrends,
} from "./pharmacy.controller.js";

const router = express.Router();

router.put(
  "/edit-pharmacy/:id",
  authenticate,
  authorizeRole("super_admin", "admin"),
  validate(editPharmacyValidation),
  pharmacyEdit,
);

router.delete(
  "/delete-pharmacy/:id",
  authenticate,
  authorizeRole("super_admin"),
  pharmacyDelete,
);

router.get(
  "/all-pharmacies",
  authenticate,
  authorizeRole("super_admin"),
  getAllPharmacies,
);

router.get(
  "/view-pharmacy/:id",
  authenticate,
  authorizeRole("super_admin", "admin"),
  pharmacyView,
);

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
  signUpTrends,
);

router.put(
  "/change-status/:id",
  authenticate,
  authorizeRole("super_admin"),
  pharmacyStatus,
);

export default router;
