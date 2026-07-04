import express from "express";
import { authenticate } from "../../../middlewares/auth.js";
import authorizeRole from "../../../middlewares/rbac.js";
import { inventoryList, inventoryStats } from "./inventory.controller.js";

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

export default router;