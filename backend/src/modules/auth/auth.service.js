import User from "../../database/models/user.model.js";
import Role from "../../database/models/role.model.js";
import { BadRequestError, ConflictError } from "../../utils/errors.js";
import bcrypt from "bcrypt";
import { passwordGenerator } from "../../utils/helper.js";
import Pharmacy from "../../database/models/pharmacy.model.js";
import logger from "../../utils/logger.js";

const createAdmin = async (data) => {
  const { name, email, pharmacyName, city, registrationNumber } = data;

  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    throw new ConflictError("User with this email already exist");
  }
  const password = passwordGenerator();
  const hashPassword = await bcrypt.hash(password, 12);
  const role = "admin";
  const userRole = await Role.findOne({ name: role });

  if (!userRole) {
    throw new BadRequestError("Invalid role");
  }

  const admin = await User.create({
    name,
    email,
    password,
    role: userRole._id,
    createdBy: null,
  });
  const pharmacy = await Pharmacy.create({
    name: pharmacyName,
    city,
    registrationNumber,
    owner: admin._id,
    createdBy: null,
  });

  admin.pharmacyId = pharmacy._id;
  await admin.save();

  logger.info(
    `Admin Created with email : ${admin.email} and Pharmacy name: ${pharmacy.name}`,
  );
};

const createStaff = async(data) => {
    const {name, email, pharmacyId, staffRole} = data;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      throw new ConflictError("User with this email already exist");
    }
    const password = passwordGenerator();
    const hashPassword = await bcrypt.hash(password, 12);
    const role = "staff";
    const userRole = await Role.findOne({ name: role });

    if (!userRole) {
      throw new BadRequestError("Invalid role");
    }

    const staff = await User.create({
      name,
      email,
      password,
      role: userRole._id,
      staffRole,
      createdBy: null,
      pharmacyId
    });

    logger.info(`Staff Created with email : ${staff.email}`);
}

export { createAdmin, createStaff };
