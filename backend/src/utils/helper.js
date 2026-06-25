import crypto from "crypto"

const generateToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
}

const passwordGenerator = (length = 8) => {
    return crypto.randomBytes(length).toString('hex')
}
export { 
    generateToken,
    passwordGenerator
}