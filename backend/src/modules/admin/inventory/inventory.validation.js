import joi from "joi";

const batchEditValidation = joi.object({
  batchNumber: joi.string().optional(),
  expiryDate: joi.date().optional(),
  costPrice: joi.number().min(0).optional(),
  sellingPrice: joi.number().min(0).optional(),
  currentQty: joi.number().integer().min(0).optional(),
  location: joi.string().allow("").optional(),
  supplierId: joi.string().optional().allow(null, ""),
});

export { batchEditValidation };
