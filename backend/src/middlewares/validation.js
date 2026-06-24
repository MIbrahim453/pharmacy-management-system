import logger from "../utils/logger.js";
import { ValidationError } from "../utils/errors.js";

const validate = (schema) => async (req,res,next) => {
    const { error, value} = schema.validate(req.body, {
        abortEarly : false,
        stripUnknown: true,
    })
    if (error) {
    logger.error("Validation Error", {
      details: error.details,
      path: req.path,
      requestId: req.requestId,
    });

    return next(new ValidationError("Validation failed", error.details));
  }

  req.body = value;
  next();
}

export default validate