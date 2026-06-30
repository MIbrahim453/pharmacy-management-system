import express from 'express'
import authRoutes from '../modules/auth/auth.routes.js'
import pharmacyRoutes from '../modules/super-admin/pharmacies/pharmacy.routes.js'

const router = express.Router()

const API_PREFIX = "/api/v1"

router.use(`${API_PREFIX}/auth`, authRoutes)
router.use(`${API_PREFIX}/super-admin-pharmacies`, pharmacyRoutes)

export default router