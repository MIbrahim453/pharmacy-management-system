import joi from "joi";
import logger from "../../../utils/logger.js";
import { ValidationError } from "../../../utils/errors.js";

const dashboardPeriodValidation = joi.object({
  period: joi.string().valid("daily", "weekly", "monthly", "yearly").required(),
});

export { dashboardPeriodValidation };