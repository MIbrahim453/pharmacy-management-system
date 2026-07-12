import express from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import pharmacyRoutes from "../modules/super-admin/pharmacies/pharmacy.routes.js";
import analyticsRoutes from "../modules/super-admin/analytics/analytics.routes.js";
import dashboardRoutes from "../modules/super-admin/dashboard/dashboard.routes.js";
import profileRoutes from "../modules/admin/profile/profile.routes.js";
import userRoutes from "../modules/super-admin/users/user.routes.js";
import medicineRoutes from "../modules/admin/medicines/medicine.routes.js";
import supplierRoutes from "../modules/admin/suppliers/supplier.routes.js";
import staffRoutes from "../modules/admin/staffDetails/staff.routes.js";
import inventoryRoutes from "../modules/admin/inventory/inventory.routes.js";
import purchaseRoutes from "../modules/admin/purchases/purchase.routes.js";
import posRoutes from "../modules/staff/pos/pos.routes.js";

const router = express.Router();

const API_PREFIX = "/api/v1";

router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/super-admin-pharmacies`, pharmacyRoutes);
router.use(`${API_PREFIX}/super-admin-analytics`, analyticsRoutes);
router.use(`${API_PREFIX}/super-admin-dashboard`, dashboardRoutes);
router.use(`${API_PREFIX}/admin-profile`, profileRoutes);
router.use(`${API_PREFIX}/super-admin-users`, userRoutes);
router.use(`${API_PREFIX}/admin-medicines`, medicineRoutes);
router.use(`${API_PREFIX}/admin-suppliers`, supplierRoutes);
router.use(`${API_PREFIX}/admin-staff-details`, staffRoutes);
router.use(`${API_PREFIX}/admin-inventory`, inventoryRoutes);
router.use(`${API_PREFIX}/admin-purchases`, purchaseRoutes);
router.use(`${API_PREFIX}/staff-pos`, posRoutes);

export default router;