import { UnauthorizedError } from "../utils/errors.js";

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError("Access Denied. Login Required"));
    }

    const role = req.user.role?.name ?? req.user.role;
    if (!roles.includes(role)) {
      return next(
        new UnauthorizedError("Access Denied. Insufficient Permissions"),
      );
    }

    next();
  };
};

export default authorizeRole;
