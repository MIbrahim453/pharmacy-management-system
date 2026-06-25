import express from 'express'
import { signUpAdmin, signUpStaff } from './auth.controller.js'
import authorizeRole from '../../middlewares/rbac.js'
import validate from '../../middlewares/validation.js'
import { registerAdminValidation, registerStaffValidation } from './auth.validation.js'


const router = express.Router()

router.post(
    '/register-pharmacy',
    authorizeRole('super_admin'),
    validation(registerAdminValidation),
    signUpAdmin
)

router.post(
    '/register-staff',
    authorizeRole('admin'),
    validation(registerStaffValidation),
    signUpStaff
)

export default router