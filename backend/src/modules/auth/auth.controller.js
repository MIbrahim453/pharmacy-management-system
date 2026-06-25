import { createAdmin, createStaff } from "./auth.service.js"
import { sendCreated } from '../../utils/response.js'

const signUpAdmin = async(req, res, next) => {
    try {
        const result = await createAdmin(req.body)
        return sendCreated(res, result, "Admin created successfully")
    } catch (error) {
        next(error)
    }
}

const signUpStaff = async (req, res, next) => {
    try {
        const result = await createStaff(req.body)
        return sendCreated(res, result, "Staff created successfully")
    } catch (error) {
        
    }
}
export { 
    signUpAdmin,
    signUpStaff
}