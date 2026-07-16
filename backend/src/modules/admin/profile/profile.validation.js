import joi from "joi";

const updatePharmacyDetailValidation = joi.object({
    pharmacyEmail: joi.string().email().optional().allow(""),
    address: joi.string().min(2).max(255).optional().allow(""),
    phone: joi.string().min(6).max(20).optional().allow(""),
    totalStaff: joi.number().integer().min(0).optional().allow(null, ""),
  }).min(1);

const updatePharmacySettingValidation = joi.object({
    discount: joi.number().min(0).max(100).optional(),
    lowStockThreshold: joi.number().min(0).optional(),
    criticalStockThreshold: joi.number().min(0).optional(),
  })
  .min(1);

export { updatePharmacyDetailValidation, updatePharmacySettingValidation };
