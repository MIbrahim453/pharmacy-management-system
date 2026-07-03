import express from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import pharmacyRoutes from "../modules/super-admin/pharmacies/pharmacy.routes.js";
import analyticsRoutes from "../modules/super-admin/analytics/analytics.routes.js";
import userRoutes from "../modules/super-admin/users/user.routes.js";
import medicineRoutes from "../modules/admin/medicines/medicine.routes.js";

const router = express.Router();

const API_PREFIX = "/api/v1";

router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/super-admin-pharmacies`, pharmacyRoutes);
router.use(`${API_PREFIX}/super-admin-analytics`, analyticsRoutes);
router.use(`${API_PREFIX}/super-admin-users`, userRoutes);
router.use(`${API_PREFIX}/admin-medicines`, medicineRoutes);

export default router;