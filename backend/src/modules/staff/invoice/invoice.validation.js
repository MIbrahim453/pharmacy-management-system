import joi from "joi";

const editInvoiceValidation = joi.object({
  customerName: joi.string().trim().min(2).max(100).required(),
  customerPhone: joi.string().trim().min(6).max(20).required(),
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
