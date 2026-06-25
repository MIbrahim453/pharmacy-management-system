import { UnauthorizedError } from '../utils/errors.js'

const authorizeRole = async (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError("Access Denied. Login Required"));
    }
    const role = req.user.role.name;
    if (!roles.includes(role)) {
      return next(
        new UnauthorizedError("Access Denied. Insufficient Permissions"),
      );
    }
    next();
  };
};

export default authorizeRole;
