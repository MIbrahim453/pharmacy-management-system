import joi from "joi";

const conversionStepValidation = joi.object({
  from: joi.string().required(),
  to: joi.string().required(),
  factor: joi.number().integer().min(1).required(),
});

const purchaseCreateValidation = joi.object({
  supplierId: joi.string().required(),
  purchaseDate: joi.date().required(),
  paymentMethod: joi.string().valid("Cash", "Card", "Bank Transfer", "Cheque").optional().default("Cash"),
  notes: joi.string().allow("").optional(),
  items: joi
    .array()
    .items(
      joi.object({
        medicineId: joi.string().required(),
        batchNumber: joi.string().min(1).required(),
        expiryDate: joi.date().required(),
        purchaseUnit: joi.string().required(),
        purchaseQty: joi.number().integer().min(1).required(),
        packaging: joi.array().items(conversionStepValidation).optional().default([]),
        costPrice: joi.number().min(0).required(),
        sellingPrice: joi.number().min(0).required(),
        location: joi.string().allow("").optional(),
      })
    )
    .min(1)
    .required(),
});

export { purchaseCreateValidation };
