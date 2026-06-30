import joi from "joi";

const registerAdminValidation = joi.object({
  name: joi.string().min(3).max(30).required(),
  email: joi.string().email().required(),
  pharmacyName: joi.string().required(),
  city: joi.string().required(),
  registrationNumber: joi.string().required(),
});

const registerStaffValidation = joi.object({
  name: joi.string().min(3).max(30).required(),
  email: joi.string().email().required(),
  staffRole: joi.string().required(),
  pharmacyId: joi.string().required(),
});

const loginValidation = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

const forgotPasswordValidation = joi.object({
  email: joi.string().email().required(),
});

const resetPasswordValidation = joi.object({
  password: joi.string().min(6).required(),
});

const changePasswordValidation = joi.object({
  oldPassword: joi.string().required(),
  newPassword: joi.string().min(6).required(),
});

const profileValidation = joi.object({
  name: joi.string().min(3).max(30),
  email: joi.string().email(),
});

export {
  registerAdminValidation,
  registerStaffValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  profileValidation,
};
