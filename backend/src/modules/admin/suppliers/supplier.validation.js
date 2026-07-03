import joi from "joi";

const supplierCreateValidation = joi.object({
  name: joi.string().min(2).max(100).required(),
  contact: joi.string().min(2).max(100).required(),
  phone: joi.string().min(6).max(20).required(),
  status: joi.string().valid("active", "inactive").optional(),
});

const supplierEditValidation = joi
  .object({
    name: joi.string().min(2).max(100).optional(),
    contact: joi.string().min(2).max(100).optional(),
    phone: joi.string().min(6).max(20).optional(),
    status: joi.string().valid("active", "inactive").optional(),
  })
  .min(1);

export { supplierCreateValidation, supplierEditValidation };