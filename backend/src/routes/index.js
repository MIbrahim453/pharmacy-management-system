import express from 'express'
import authRoutes from '../modules/auth/auth.routes.js'

const router = express.Router()

const API_PREFIX = "/api/v1"

router.use(`${API_PREFIX}/auth`, authRoutes)

export default router