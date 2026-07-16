import joi from "joi";

const dashboardPeriodValidation = joi.object({
  period: joi.string().valid("daily", "weekly", "monthly", "yearly").required(),
});

export { dashboardPeriodValidation };
