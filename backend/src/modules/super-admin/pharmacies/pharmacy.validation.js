import joi from "joi";

const createPharmacyValidation = joi.object({
  pharmacy_name: joi.string().required(),
  email: joi.string().email().required(),
  phone: joi.string().required(),
  address: joi.string().required(),
  registrationNumber: joi.string().required(),
  city: joi.string().required(),
  totalStaff: joi.number().min(0).default(0),
  status: joi.string().valid("active", "inactive").default("inactive"),
  owner: joi.string(),
  createdBy: joi.string(),
});

const editPharmacyValidation = joi.object({
  pharmacy_name: joi.string(),
  email: joi.string().email(),
  phone: joi.string(),
  address: joi.string(),
  registrationNumber: joi.string(),
  city: joi.string(),
  totalStaff: joi.number().min(0),
  status: joi.string().valid("active", "inactive"),
});


export {
  createPharmacyValidation,
  editPharmacyValidation,
};