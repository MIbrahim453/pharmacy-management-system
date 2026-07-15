import joi from "joi";

const posMedicinesQueryValidation = joi.object({
  id: joi.string().optional(),
  name: joi.string().optional(),
  category: joi.string().optional(),
  searchTerm: joi.string().optional(),
  startIndex: joi.number().integer().min(0).default(0),
  limit: joi.number().integer().min(1).max(100).default(10),
  order: joi.string().valid("asc", "desc").default("asc"),
});

const createInvoiceValidation = joi.object({
  customerName: joi.string().min(2).max(100).required(),
  customerPhone: joi.string().min(6).max(20).required(),
  paymentMethod: joi.string().valid("Cash", "Card", "Bank Transfer", "Cheque").required(),
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

export { posMedicinesQueryValidation, createInvoiceValidation };