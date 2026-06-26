import joi from 'joi'

const registerAdminValidation = joi.object({
    name: joi.string().min(3).max(30).required(),
    email: joi.string().email().required(),
    pharmacyName: joi.string().required(),
    city: joi.string().required(),
    registrationNumber: joi.string().required()
})

const registerStaffValidation = joi.object({
    name: joi.string().min(3).max(30).required(),
    email: joi.string().email().required(),
    staffRole: joi.string().required(),
    pharmacyId: joi.string().required()
})

const loginValidation = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
})

export {
    registerAdminValidation,
    registerStaffValidation,
    loginValidation
}