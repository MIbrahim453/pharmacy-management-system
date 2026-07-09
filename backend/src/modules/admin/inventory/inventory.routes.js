import express from "express";
import { authenticate } from "../../../middlewares/auth.js";
import authorizeRole from "../../../middlewares/rbac.js";
import validate from "../../../middlewares/validation.js";
import {
  inventoryList,
  inventoryStats,
  batchesForMedicineList,
  batchUpdate,
  batchDiscard,
} from "./inventory.controller.js";
import { batchEditValidation } from "./inventory.validation.js";

const router = express.Router();

router.get(
  "/stats",
  authenticate,
  authorizeRole("admin"),
  inventoryStats,
);

router.get(
  "/all",
  authenticate,
  authorizeRole("admin"),
  inventoryList,
);

router.get(
  "/batches/:medicineId",
  authenticate,
  authorizeRole("admin"),
  batchesForMedicineList,
);

router.put(
  "/edit-batch/:id",
  authenticate,
  authorizeRole("admin"),
  validate(batchEditValidation),
  batchUpdate,
);

router.put(
  "/discard-batch/:id",
  authenticate,
  authorizeRole("admin"),
  batchDiscard,
);

export default router;
