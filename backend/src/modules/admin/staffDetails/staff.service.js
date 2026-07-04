import User from "../../../database/models/user.model.js";
import Pharmacy from "../../../database/models/pharmacy.model.js";
import Role from "../../../database/models/role.model.js";
import logger from "../../../utils/logger.js";
import { BadRequestError, NotFoundError } from "../../../utils/errors.js";

const editStaff = async (userId, id, data) => {
  const findStaff = await User.findById(id);

  if (!findStaff) {
    throw new NotFoundError("Staff not Found");
  }

  const updateStaff = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        name: data.name,
        email: data.email,
        staffRole: data.role,
        staffCounter: data.counter || "",
        createdBy: userId,
      },
    },
    {
      new: true,
    },
  );

  const staff = await User.findById(updateStaff._id)
    .populate("createdBy", "name email")
    .populate("pharmacyId", "pharmacy_name");

  logger.info("Staff Updated Successfully");

  return staff;
};

const deleteStaff = async (id) => {
  const deleteStaff = await User.findByIdAndDelete(id);

  if (!deleteStaff) {
    throw new BadRequestError("Failed To Delete Staff");
  }

  logger.info("Staff Deleted Successfully");
};

const getStaff = async (filters) => {
  const {
    id,
    name = "",
    email = "",
    pharmacyId,
    startIndex = 0,
    limit = 1000,
    order = "asc",
  } = filters;

  const sortDirection = order ? (order.toLowerCase() === "asc" ? 1 : -1) : -1;

  const staffRoleObj = await Role.findOne({ name: "staff" });

  const staff = await User.find({
    ...(staffRoleObj && { role: staffRoleObj._id }),
    ...(pharmacyId && { pharmacyId }),
    $or: [
      { name: { $regex: name, $options: "i" } },
      { email: { $regex: email, $options: "i" } },
    ],
    ...(id && { _id: id }),
    ...(name && { name: name }),
    ...(email && { email: email }),
  })
    .skip(Number(startIndex))
    .limit(Number(limit))
    .sort({ updatedAt: sortDirection })
    .populate("createdBy", "name email")
    .populate("pharmacyId", "pharmacy_name");

  logger.info("Staff Fetched Successfully");

  return staff;
};

const viewStaff = async (id) => {
  const staff = await User.findById(id)
    .populate("createdBy", "name email")
    .populate("pharmacyId", "pharmacy_name");

  if (!staff) {
    throw new NotFoundError("Staff Not Found");
  }

  logger.info("Staff Fetched Successfully");

  return staff;
};

const changeStatus = async (id, status) => {
  const staff = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        status: status,
      },
    },
    {
      new: true,
    },
  )
    .populate("createdBy", "name email")
    .populate("pharmacyId", "pharmacy_name");

  if (!staff) {
    throw new NotFoundError("Staff Not Found");
  }

  logger.info("Staff Status Changed Successfully");

  return staff;
};

export { editStaff, deleteStaff, getStaff, viewStaff, changeStatus };
