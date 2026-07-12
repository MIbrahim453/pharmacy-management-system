import express from "express";
import { authenticate } from "../../../middlewares/auth.js";
import authorizeRole from "../../../middlewares/rbac.js";
import validate from "../../../middlewares/validation.js";
import {
  updatePharmacyDetail,
  updatePharmacySetting,
} from "./profile.controller.js";
import {
  updatePharmacyDetailValidation,
  updatePharmacySettingValidation,
} from "./profile.validation.js";

const router = express.Router();

router.put(
  "/pharmacy-detail",
  authenticate,
  authorizeRole("admin"),
  validate(updatePharmacyDetailValidation),
  updatePharmacyDetail,
);

router.put(
  "/pharmacy-settings",
  authenticate,
  authorizeRole("admin"),
  validate(updatePharmacySettingValidation),
  updatePharmacySetting,
);

export default router;