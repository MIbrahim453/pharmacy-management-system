import express from "express";
import { authenticate } from "../../../middlewares/auth.js";
import authorizeRole from "../../../middlewares/rbac.js";
import validate from "../../../middlewares/validation.js";
import {
  getAllMedicines,
  getMedicineCategoryNamesController,
  medicineCreate,
  medicineDelete,
  medicineEdit,
  medicineView,
} from "./medicine.controller.js";
import {
  medicineCreateValidation,
  medicineEditValidation,
} from "./medicine.validation.js";

const router = express.Router();

router.post(
  "/create-medicine",
  authenticate,
  authorizeRole("admin"),
  validate(medicineCreateValidation),
  medicineCreate,
);

router.put(
  "/edit-medicine/:id",
  authenticate,
  authorizeRole("admin"),
  validate(medicineEditValidation),
  medicineEdit,
);

router.delete(
  "/delete-medicine/:id",
  authenticate,
  authorizeRole("admin"),
  medicineDelete,
);

router.get(
  "/view-medicine/:id",
  authenticate,
  authorizeRole("admin"),
  medicineView,
);

router.get(
  "/all-medicines",
  authenticate,
  authorizeRole("admin"),
  getAllMedicines,
);

router.get(
  "/category-names",
  authenticate,
  authorizeRole("admin"),
  getMedicineCategoryNamesController,
);

export default router;