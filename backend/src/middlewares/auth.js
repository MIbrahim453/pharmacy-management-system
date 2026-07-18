import { passport } from "../config/passport.js";
import logger from "../utils/logger.js";
import { sendError } from "../utils/response.js";
import { UnauthorizedError } from "../utils/errors.js"
const authenticateLocal = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      logger.info("Local authentication error");
      return sendError(res, err.message || "Authentication error", 401);
    }
    if (!user) {
      const message = info?.message || "Invalid credentials";
      logger.warn(`Authentication failed: ${message}`, {
        email: req.body.email,
        ip: req.ip,
        requestId: req.requestId,
      });
      return sendError(res, message, 401);
    }

    req.user = user;
    next();
  })(req, res, next);
};

const authenticate = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      logger.error("JWT authentication error: ", err);
      return next(err);
    }
    if (!user) {
      const message = info?.message || "Unauthorized access";
      logger.warn(`JWT Authentication failed: ${message}`, {
        ip: req.ip,
        requestId: req.requestId,
      });
      return next(new UnauthorizedError(message));
    }
    req.user = user;
    next();
  })(req, res, next);
};

export { authenticateLocal, authenticate };
