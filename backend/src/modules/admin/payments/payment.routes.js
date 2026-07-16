import express from "express";
import { authenticate } from "../../../middlewares/auth.js";
import authorizeRole from "../../../middlewares/rbac.js";
import {
  paymentList,
  paymentSummary,
} from "./payment.controller.js";

const router = express.Router();

router.get(
  "/all-payments",
  authenticate,
  authorizeRole("admin"),
  paymentList,
);

router.get(
  "/payment-stats",
  authenticate,
  authorizeRole("admin"),
  paymentSummary,
);

export default router;
