import User from "../../database/models/user.model.js";
import Role from "../../database/models/role.model.js";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "../../utils/errors.js";
import bcrypt from "bcrypt";
import { passwordGenerator } from "../../utils/helper.js";
import Pharmacy from "../../database/models/pharmacy.model.js";
import logger from "../../utils/logger.js";
import jwt from "jsonwebtoken";
import { config } from "../../config/index.js";
import sendEmail from "../../config/email.js";
import {
  adminEmailTemplate,
  staffEmailTemplate,
  resetPasswordEmailTemplate,
} from "../../utils/emailTemplate.js";

const loginUrl = `${config.frontendUrl}/login`;
const resetPasswordExpiryMinutes = 15;

const createAdmin = async (user, data) => {
  const { name, email, pharmacyName, city, registrationNumber } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError("User with this email already exist");
  }

  const password = passwordGenerator();
  const hashPassword = await bcrypt.hash(password, 12);
  const userRole = await Role.findOne({ name: "admin" });

  if (!userRole) {
    throw new BadRequestError("Invalid role");
  }

  const admin = await User.create({
    name,
    email,
    password: hashPassword,
    role: userRole._id,
    createdBy: user.id,
  });

  const pharmacy = await Pharmacy.create({
    pharmacy_name: pharmacyName,
    city,
    registrationNumber,
    owner: admin._id,
    createdBy: user.id,
  });

  admin.pharmacyId = pharmacy._id;
  await admin.save();

  await sendEmail({
    to: email,
    subject: "Admin Account Created",
    html: adminEmailTemplate({
      name,
      email,
      password,
      pharmacyName,
      city,
      registrationNumber,
      loginUrl,
    }),
  });

  logger.info(
    `Admin Created with email : ${admin.email} and Pharmacy name: ${pharmacy.pharmacy_name}`,
  );

  return {
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: userRole.name,
      pharmacyId: admin.pharmacyId,
      createdBy: admin.createdBy,
    },
    pharmacy: {
      id: pharmacy._id,
      pharmacy_name: pharmacy.pharmacy_name,
      city: pharmacy.city,
      registrationNumber: pharmacy.registrationNumber,
      owner: pharmacy.owner,
    },
  };
};

const createStaff = async (user, data) => {
  const { name, email, pharmacyId, staffRole } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError("User with this email already exist");
  }

  const password = passwordGenerator();
  const hashPassword = await bcrypt.hash(password, 12);
  const userRole = await Role.findOne({ name: "staff" });

  if (!userRole) {
    throw new BadRequestError("Invalid role");
  }

  const pharmacy = await Pharmacy.findById(pharmacyId).select("pharmacy_name");

  const staff = await User.create({
    name,
    email,
    password: hashPassword,
    role: userRole._id,
    staffRole,
    createdBy: user.id,
    pharmacyId,
  });

  await sendEmail({
    to: email,
    subject: "Staff Account Created",
    html: staffEmailTemplate({
      name,
      email,
      password,
      staffRole,
      pharmacyName: pharmacy?.pharmacy_name,
      loginUrl,
    }),
  });

  logger.info(`Staff Created with email : ${staff.email}`);

  return {
    staff: {
      id: staff._id,
      name: staff.name,
      email: staff.email,
      role: userRole.name,
      staffRole: staff.staffRole,
      pharmacyId: staff.pharmacyId,
      createdBy: staff.createdBy,
    },
  };
};

const generateToken = (user) => {
  const accessToken = jwt.sign(
    {
      id: user._id,
      email: user.email,
      type: "access",
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  );

  const refreshToken = jwt.sign(
    {
      id: user._id,
      email: user.email,
      type: "refresh",
    },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshSecretExpiry,
    },
  );

  return { accessToken, refreshToken };
};

const login = async (user) => {
  const token = generateToken(user);
  const userWithRole = await User.findById(user.id)
    .select("-password")
    .populate("role", "name")
    .populate("pharmacyId", "pharmacy_name");
  logger.info("User Logged In Successfully");
  return { userWithRole, token };
};

const refreshToken = async (refreshTokenValue) => {
  const payload = jwt.verify(refreshTokenValue, config.jwt.refreshSecret);
  if (!payload || payload.type !== "refresh") {
    throw new UnauthorizedError("Invalid Refresh Token");
  }
  const user = await User.findById(payload.id)
    .select("-password")
    .populate("role", "name");
  if (!user) {
    throw new UnauthorizedError("User Not Found");
  }
  const token = generateToken(user);

  logger.info(`Token refreshed for user :${user.email}`);

  return token;
};

const forgetPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError("User Not Found");
  }

  const resetToken = jwt.sign(
    {
      id: user._id,
      email: user.email,
      type: "reset",
    },
    config.jwt.secret,
    { expiresIn: `${resetPasswordExpiryMinutes}m` },
  );

  const resetLink = `${config.frontendUrl}/reset-password?token=${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: "Password Reset Request",
    html: resetPasswordEmailTemplate({
      name: user.name,
      email: user.email,
      resetLink,
      expiryMinutes: resetPasswordExpiryMinutes,
    }),
  });

  logger.info(`Password reset email sent to ${user.email}`);

  return {
    message: "Password reset link sent successfully",
  };
};

const resetPassword = async (token, password) => {
  const payload = jwt.verify(token, config.jwt.secret);

  if (!payload || payload.type !== "reset") {
    throw new UnauthorizedError("Invalid Reset Token");
  }

  const hashPassword = await bcrypt.hash(password, 12);
  const user = await User.findByIdAndUpdate(
    payload.id,
    { password: hashPassword },
    { new: true },
  ).select("-password");

  if (!user) {
    throw new BadRequestError("User Not Found");
  }

  logger.info(`Password reset successful for user :${user.email}`);

  return {
    message: "Password reset successfully",
  };
};

const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).populate("role", "name");
  if (!user) {
    throw new BadRequestError("User Not Found");
  }
  const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordMatch) {
    throw new BadRequestError("Invalid Old Password");
  }
  const hashPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashPassword;
  await user.save();
  return { message: "Password changed successfully" };
};

const getMe = async (userId) => {
  const user = await User.findById(userId)
    .populate("role", "name")
    .populate("pharmacyId", "pharmacy_name");
  if (!user) {
    throw new BadRequestError("User Not Found");
  }
  return user;
};

const updateProfile = async (userId, data) => {
  const user = await User.findById(userId)
    .populate("role", "name")
    .populate("pharmacyId", "pharmacy_name");
  if (!user) {
    throw new BadRequestError("User Not Found");
  }

  if (data.name) {
    user.name = data.name;
  }
  if (data.email && data.email !== user.email) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new ConflictError("User with this email already exist");
    }
    user.email = data.email;
  }
  await user.save();
  return user;
};
export {
  createAdmin,
  createStaff,
  login,
  refreshToken,
  forgetPassword,
  resetPassword,
  changePassword,
  getMe,
  updateProfile,
};
