import { v4 as uuidv4 } from "uuid";

const requestIdMiddleware = (req, res, next) => {
  const requestId = req.get("X-Request-ID") || uuidv4();
  req.requestId = requestId;
  res.set("X-Request-ID", requestId);
  next();
};

export default requestIdMiddleware;
