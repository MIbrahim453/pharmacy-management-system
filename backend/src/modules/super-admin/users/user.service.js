import User from "../../../database/models/user.model.js";
import Role from "../../../database/models/role.model.js";
import { NotFoundError, BadRequestError } from "../../../utils/errors.js";
import logger from "../../../utils/logger.js";

const getUsers = async (query) => {
  const {
    searchTerm = "",
    role = "all",
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
  } = query;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);
  const skip = (pageNum - 1) * limitNum;

  const filter = {
    $or: [
      { name: { $regex: searchTerm || "", $options: "i" } },
      { email: { $regex: searchTerm || "", $options: "i" } },
    ],
  };

  if (role && role !== "all") {
    const roleDoc = await Role.findOne({ name: role });
    if (roleDoc) {
      filter.role = roleDoc._id;
    } else {
      return {
        users: [],
        total: 0,
        page: pageNum,
        limit: limitNum,
        totalPages: 0,
      };
    }
  }

  const sortDir = order === "asc" ? 1 : -1;
  const sortObj = { [sortBy]: sortDir };

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("name email status lastActive role pharmacyId")
      .populate("role", "name")
      .populate("pharmacyId", "pharmacyName")
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(filter),
  ]);

  const mapped = users.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    pharmacyName: u.pharmacyId?.pharmacyName || null,
    lastActive: u.lastActive,
    role: u.role?.name || null,
    status: u.status,
  }));

  logger.info("Retrieved users list");

  return {
    users: mapped,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

const viewUser = async (id) => {
  const user = await User.findById(id)
    .select("-password")
    .populate({ path: "role", select: "name description" })
    .populate({
      path: "pharmacyId",
      select: "pharmacyName city registrationNumber",
    })
    .populate({ path: "createdBy", select: "name email" })
    .lean();

  if (!user) {
    throw new NotFoundError("User Not Found");
  }

  logger.info("User Fetched Successfully");
  return user;
};

const changeUserStatus = async (id, status) => {
  const user = await User.findById(id);

  if (!user) {
    throw new NotFoundError("User Not Found");
  }

  if (!['active', 'inactive', 'suspended'].includes(status)) {
    throw new BadRequestError("Invalid status. Must be active, inactive, or suspended");
  }

  user.status = status;
  await user.save();

  const updatedUser = await User.findById(id)
    .select("-password")
    .populate({ path: "role", select: "name" })
    .populate({ path: "pharmacyId", select: "pharmacyName" })
    .lean();

  logger.info(`User status changed to ${status} for user: ${updatedUser.email}`);

  return updatedUser;
};

export { getUsers, viewUser, changeUserStatus };
