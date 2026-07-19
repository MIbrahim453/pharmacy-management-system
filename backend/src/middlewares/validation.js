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

    const detailedMessage = error.details.map(detail => {
      let msg = detail.message.replace(/"/g, '');
      msg = msg.charAt(0).toUpperCase() + msg.slice(1);
      return msg;
    }).join('. ');

    return next(new ValidationError(detailedMessage, error.details));
  }

  req.body = value;
  next();
}

export default validate