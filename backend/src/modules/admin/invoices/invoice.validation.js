import joi from "joi";

const editInvoiceValidation = joi.object({
  customerName: joi.string().trim().min(2).max(100).required(),
  customerPhone: joi
    .string()
    .trim()
    .min(11)
    .max(14)
    .required()
    .messages({
      "string.min": "Customer number should be min 11 or max 14 digits",
      "string.max": "Customer number should be min 11 or max 14 digits",
      "any.required": "Customer number is required",
    }),
  paymentMethod: joi
    .string()
    .valid("Cash", "Card", "Bank Transfer", "Cheque")
    .required(),
  discount: joi.number().min(0).default(0),
  items: joi
    .array()
    .items(
      joi.object({
        medicineId: joi.string().required(),
        quantity: joi.number().integer().min(1).required(),
      }),
    )
    .min(1)
    .required(),
});

export { editInvoiceValidation };

