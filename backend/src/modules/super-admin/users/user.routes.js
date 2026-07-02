import express from "express";
import { authenticate } from "../../../middlewares/auth.js";
import authorizeRole from "../../../middlewares/rbac.js";
import { getAllUsers, userView } from "./user.controller.js";

const router = express.Router();

router.get(
  "/all-users",
  authenticate,
  authorizeRole("super_admin"),
  getAllUsers,
);

router.get(
  "/view-user/:id",
  authenticate,
  authorizeRole("super_admin"),
  userView,
);

export default router;
