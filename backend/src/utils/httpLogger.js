import morgan from "morgan";
import logger from "./logger.js";

morgan.token("request-id", (req) => req.requestId || "-");
morgan.token("user-id", (req) => req.user?.id || "-");

const format =
  ":request-id :remote-addr :user-id :method :url :status :res[content-length] - :response-time ms";

const stream = {
  write: (message) => {
    const logMessage = message.trim();
    logger.http(logMessage);
  },
};

const httpLogger = morgan(format, { stream });

export { httpLogger };
