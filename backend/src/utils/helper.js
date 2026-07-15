import crypto from "crypto";
import bcrypt from "bcrypt";

const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

const passwordGenerator = (length = 8) => {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
};

const generateUniqueNumber = (symbol) => {
  const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  const year = new Date().getFullYear();

  return `${symbol}-${year}-${randomHex}`;
};

export { generateToken, passwordGenerator, generateUniqueNumber };
