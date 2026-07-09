import express from "express";
import { authenticate } from "../../../middlewares/auth.js";
import authorizeRole from "../../../middlewares/rbac.js";
import validate from "../../../middlewares/validation.js";
import {
  purchaseCreate,
  purchaseList,
  purchaseView,
} from "./purchase.controller.js";
import { purchaseCreateValidation } from "./purchase.validation.js";

const router = express.Router();

router.post(
  "/create-purchase",
  authenticate,
  authorizeRole("admin"),
  validate(purchaseCreateValidation),
  purchaseCreate,
);

router.get(
  "/all-purchases",
  authenticate,
  authorizeRole("admin"),
  purchaseList,
);

router.get(
  "/view-purchase/:id",
  authenticate,
  authorizeRole("admin"),
  purchaseView,
);

export default router;
