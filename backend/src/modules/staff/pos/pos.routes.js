import express from "express";
import { authenticate } from "../../../middlewares/auth.js";
import authorizeRole from "../../../middlewares/rbac.js";
import validate from "../../../middlewares/validation.js";
import {
  getPosMedicines,
  getPosMedicineCategoryNames,
  createPosInvoice,
} from "./pos.controller.js";
import {
  posMedicinesQueryValidation,
  createInvoiceValidation,
} from "./pos.validation.js";

const router = express.Router();

router.get(
  "/all-medicines",
  authenticate,
  authorizeRole("staff"),
  validate(posMedicinesQueryValidation),
  getPosMedicines,
);

router.get(
  "/category-names",
  authenticate,
  authorizeRole("staff"),
  getPosMedicineCategoryNames,
);

router.post(
  "/create-invoice",
  authenticate,
  authorizeRole("staff"),
  validate(createInvoiceValidation),
  createPosInvoice,
);

export default router;