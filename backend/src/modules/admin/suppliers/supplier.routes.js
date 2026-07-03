import express from "express";
import { authenticate } from "../../../middlewares/auth.js";
import authorizeRole from "../../../middlewares/rbac.js";
import validate from "../../../middlewares/validation.js";
import {
  getAllSuppliers,
  supplierCreate,
  supplierDelete,
  supplierEdit,
  supplierView,
} from "./supplier.controller.js";
import {
  supplierCreateValidation,
  supplierEditValidation,
} from "./supplier.validation.js";

const router = express.Router();

router.post(
  "/create-supplier",
  authenticate,
  authorizeRole("admin"),
  validate(supplierCreateValidation),
  supplierCreate,
);

router.put(
  "/edit-supplier/:id",
  authenticate,
  authorizeRole("admin"),
  validate(supplierEditValidation),
  supplierEdit,
);

router.delete(
  "/delete-supplier/:id",
  authenticate,
  authorizeRole("admin"),
  supplierDelete,
);

router.get(
  "/view-supplier/:id",
  authenticate,
  authorizeRole("admin"),
  supplierView,
);

router.get(
  "/all-suppliers",
  authenticate,
  authorizeRole("admin"),
  getAllSuppliers,
);

export default router;