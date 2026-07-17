import User from "../../database/models/user.model.js";
import Role from "../../database/models/role.model.js";
import mongoose from "mongoose";
import Medicine from "../../database/models/medicine.model.js";
import MedicineBatch from "../../database/models/medicineBatch.model.js";
import Invoice from "../../database/models/invoice.model.js";
import InvoiceBatchAllocation from "../../database/models/invoiceBatchAllocation.model.js";
import Purchase from "../../database/models/purchase.model.js";
import Payment from "../../database/models/payment.model.js";
import Supplier from "../../database/models/supplier.model.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
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
import loginHistory from "../../database/models/loginHistory.model.js";

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
    pharmacyName: pharmacyName,
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
    `Admin Created with email : ${admin.email} and Pharmacy name: ${pharmacy.pharmacyName}`,
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
      pharmacyName: pharmacy.pharmacyName,
      city: pharmacy.city,
      registrationNumber: pharmacy.registrationNumber,
      owner: pharmacy.owner,
    },
  };
};

const createStaff = async (user, data) => {
  const { name, email, pharmacyId, staffRole, staffCounter } = data;

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

  const pharmacy = await Pharmacy.findById(pharmacyId).select("pharmacyName");

  const staff = await User.create({
    name,
    email,
    password: hashPassword,
    role: userRole._id,
    staffRole,
    staffCounter,
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
      pharmacyName: pharmacy?.pharmacyName,
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
      staffCounter: staff.staffCounter,
      pharmacyId: staff.pharmacyId,
      createdBy: staff.createdBy,
    },
  };
};

const generateToken = (user, rememberMe) => {
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
      rememberMe: rememberMe ? true : false,
    },
    config.jwt.refreshSecret,
    {
      expiresIn: rememberMe ? config.jwt.rememberMeExpiry : config.jwt.refreshSecretExpiry,
    },
  );

  return { accessToken, refreshToken };
};

const login = async (user, rememberMe = false, req) => {
  const token = generateToken(user, rememberMe);

  await loginHistory.create({
    user: user._id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  await User.findOneAndUpdate(
    { _id: user.id, status: "active" },
    { lastActive: new Date() }
  );

  const userWithRole = await User.findOne({ _id: user.id, status: "active" })
    .select("-password")
    .populate("role", "name")
    .populate("pharmacyId");

  logger.info("User Logged In Successfully");

  return { userWithRole, token };
};

const refreshToken = async (refreshTokenValue) => {
  const payload = jwt.verify(refreshTokenValue, config.jwt.refreshSecret);
  if (!payload || payload.type !== "refresh") {
    throw new UnauthorizedError("Invalid Refresh Token");
  }
  const user = await User.findOne({ _id: payload.id, status: "active" })
    .select("-password")
    .populate("role", "name");
  if (!user) {
    throw new UnauthorizedError("User Not Found");
  }
  const token = generateToken(user, payload.rememberMe);

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
  const user = await User.findOne({ _id: userId, status: "active" }).populate("role", "name");
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
  const user = await User.findOne({ _id: userId, status: "active" })
    .populate("role", "name")
    .populate("pharmacyId", "pharmacyName");
  if (!user) {
    throw new BadRequestError("User Not Found");
  }
  return user;
};

const updateProfile = async (userId, data) => {
  const user = await User.findOne({ _id: userId, status: "active" })
    .populate("role", "name")
    .populate("pharmacyId", "pharmacyName");
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

const deleteAccount = async (userId) => {
  const session = await mongoose.startSession();

  try {
    let deletedMessage = "Account deleted successfully";
    let deletedEmail = "";

    await session.withTransaction(async () => {
      const user = await User.findOne({ _id: userId, status: "active" })
        .populate("role", "name")
        .session(session);

      if (!user) {
        throw new NotFoundError("User Not Found");
      }

      const role = user.role?.name ?? user.role;
      const pharmacyId = user.pharmacyId;
      deletedEmail = user.email;

      if (role === "admin" && pharmacyId) {
        await Promise.all([
          User.deleteMany({ pharmacyId }, { session }),
          Medicine.deleteMany({ pharmacyId }, { session }),
          MedicineBatch.deleteMany({ pharmacyId }, { session }),
          InvoiceBatchAllocation.deleteMany({ pharmacyId }, { session }),
          Invoice.deleteMany({ pharmacyId }, { session }),
          Purchase.deleteMany({ pharmacyId }, { session }),
          Payment.deleteMany({ pharmacyId }, { session }),
          Supplier.deleteMany({ pharmacyId }, { session }),
          Pharmacy.deleteOne({ _id: pharmacyId }, { session }),
        ]);

        deletedMessage = "Account and associated pharmacy data deleted successfully";
      } else {
        await User.deleteOne({ _id: user._id }, { session });
      }
    });

    logger.info(`Account deleted for user :${deletedEmail}`);

    return {
      message: deletedMessage,
    };
  } finally {
    await session.endSession();
  }
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
  deleteAccount,
};
