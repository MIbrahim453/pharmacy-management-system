import User from "../../../database/models/user.model.js";
import Role from "../../../database/models/role.model.js";
import { NotFoundError } from "../../../utils/errors.js";

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
      .populate("pharmacyId", "pharmacy_name")
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
    pharmacyName: u.pharmacyId?.pharmacy_name || null,
    lastActive: u.lastActive,
    role: u.role?.name || null,
    status: u.status,
  }));

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
      select: "pharmacy_name city registrationNumber",
    })
    .populate({ path: "createdBy", select: "name email" })
    .lean();

  if (!user) {
    throw new NotFoundError("User Not Found");
  }

  return user;
};

export { getUsers, viewUser };
