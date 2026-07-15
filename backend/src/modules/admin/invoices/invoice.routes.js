import express from "express";
import { authenticate } from "../../../middlewares/auth.js";
import authorizeRole from "../../../middlewares/rbac.js";
import validate from "../../../middlewares/validation.js";
import {
  invoiceList,
  invoiceView,
  invoiceEdit,
  invoiceMarkPaid,
  invoiceDownload,
} from "./invoice.controller.js";
import { editInvoiceValidation } from "./invoice.validation.js";

const router = express.Router();

router.get(
  "/all-invoices",
  authenticate,
  authorizeRole("admin"),
  invoiceList,
);

router.get(
  "/view-invoice/:id",
  authenticate,
  authorizeRole("admin"),
  invoiceView,
);

router.put(
  "/edit-invoice/:id",
  authenticate,
  authorizeRole("admin"),
  validate(editInvoiceValidation),
  invoiceEdit,
);

router.put(
  "/mark-paid/:id",
  authenticate,
  authorizeRole("admin"),
  invoiceMarkPaid,
);

router.get(
  "/download-invoice/:id",
  authenticate,
  authorizeRole("admin"),
  invoiceDownload,
);

export default router;
