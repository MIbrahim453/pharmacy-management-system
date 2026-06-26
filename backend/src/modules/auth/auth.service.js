import User from "../../database/models/user.model.js";
import Role from "../../database/models/role.model.js";
import { BadRequestError, ConflictError } from "../../utils/errors.js";
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
} from "../../utils/emailTemplate.js";

const loginUrl = `${config.frontendUrl}/login`;

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
    createdBy: null,
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
    .populate("role", "name");
  logger.info("User Logged In Successfully");
  return { userWithRole, token };
};

export { createAdmin, createStaff, login };
