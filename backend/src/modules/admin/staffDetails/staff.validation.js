import joi from "joi";

const staffEditValidation = joi.object({
  name: joi.string().min(2).max(100).required(),
  email: joi.string().email().required(),
  role: joi.string().required(),
  counter: joi.string().optional().allow(""),
});

const staffStatusValidation = joi.object({
  status: joi.string().valid("active", "inactive", "suspended").required(),
});

export { staffEditValidation, staffStatusValidation };