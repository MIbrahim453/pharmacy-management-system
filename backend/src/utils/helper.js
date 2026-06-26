import crypto from "crypto"
import bcrypt from 'bcrypt'

const generateToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
}

const passwordGenerator = (length = 8) => {
    return crypto.randomBytes(length).toString('hex').slice(0,length)
}

export { 
    generateToken,
    passwordGenerator,
}