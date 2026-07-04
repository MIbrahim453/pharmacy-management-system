import joi from "joi";

const medicineCreateValidation = joi.object({
  name: joi.string().min(2).max(100).required(),
  brand: joi.string().min(2).max(100).required(),
  category: joi.string().min(2).max(100).required(),
  expiryDate: joi.date().required(),
  stockQty: joi.number().integer().min(0).required(),
  reorderLevel: joi.number().integer().min(0).optional(),
  tabPrice: joi.number().positive().required(),
  stripPrice: joi.number().positive().required(),
  packPrice: joi.number().positive().required(),
});

const medicineEditValidation = joi
  .object({
    name: joi.string().min(2).max(100).optional(),
    brand: joi.string().min(2).max(100).optional(),
    category: joi.string().min(2).max(100).optional(),
    expiryDate: joi.date().optional(),
    stockQty: joi.number().integer().min(0).optional(),
    reorderLevel: joi.number().integer().min(0).optional(),
    tabPrice: joi.number().positive().optional(),
    stripPrice: joi.number().positive().optional(),
    packPrice: joi.number().positive().optional(),
  })
  .min(1);

export { medicineCreateValidation, medicineEditValidation };