import joi from "joi";

const userStatusValidation = joi.object({
  status: joi.string().valid("active", "inactive", "suspended").required(),
});

export { userStatusValidation };
