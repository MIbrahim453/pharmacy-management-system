import joi from "joi";

const supplierCreateValidation = joi.object({
  name: joi.string().min(2).max(100).required(),
  contact: joi.string().min(2).max(100).required(),
  phone: joi
    .string()
    .trim()
    .min(11)
    .max(14)
    .required()
    .messages({
      "string.min": "Phone number should be min 11 or max 14 digits",
      "string.max": "Phone number should be min 11 or max 14 digits",
      "any.required": "Phone number is required",
    }),
  status: joi.string().valid("active", "inactive").optional(),
});

const supplierEditValidation = joi
  .object({
    name: joi.string().min(2).max(100).optional(),
    contact: joi.string().min(2).max(100).optional(),
    phone: joi
      .string()
      .trim()
      .min(11)
      .max(14)
      .optional()
      .messages({
        "string.min": "Phone number should be min 11 or max 14 digits",
        "string.max": "Phone number should be min 11 or max 14 digits",
      }),
    status: joi.string().valid("active", "inactive").optional(),
  })
  .min(1);

export { supplierCreateValidation, supplierEditValidation };
