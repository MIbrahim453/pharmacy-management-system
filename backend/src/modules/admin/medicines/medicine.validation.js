import joi from "joi";

const medicineCreateValidation = joi.object({
  name: joi.string().min(2).max(100).required(),
  genericName: joi.string().min(2).max(100).required(),
  category: joi.string().min(2).max(100).required(),
  manufacturer: joi.string().min(2).max(100).required(),
  saleUnit: joi.string().min(1).max(50).required(),
  sellingPrice: joi.number().min(0).optional().default(0),
  reorderLevel: joi.number().integer().min(0).optional(),
});

const medicineEditValidation = joi
  .object({
    name: joi.string().min(2).max(100).optional(),
    genericName: joi.string().min(2).max(100).optional(),
    category: joi.string().min(2).max(100).optional(),
    manufacturer: joi.string().min(2).max(100).optional(),
    saleUnit: joi.string().min(1).max(50).optional(),
    sellingPrice: joi.number().min(0).optional(),
    reorderLevel: joi.number().integer().min(0).optional(),
  })
  .min(1);

export { medicineCreateValidation, medicineEditValidation };
