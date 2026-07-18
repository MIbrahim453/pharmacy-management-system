import { sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";
  const details = err.details || null;

  logger.error(`[Error Handler] ${req.method} ${req.originalUrl} - Status: ${statusCode} - Message: ${message}`, {
    stack: err.stack,
    details,
  });

  return sendError(res, message, statusCode, details);
};

export default errorHandler;
