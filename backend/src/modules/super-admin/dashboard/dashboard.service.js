import Pharmacy from "../../../database/models/pharmacy.model.js";
import { NotFoundError, BadRequestError } from "../../../utils/errors.js";
import logger from "../../../utils/logger.js";
import User from "../../../database/models/user.model.js";
import Role from "../../../database/models/role.model.js";

const getDashboardStats = async () => {
  const totalPharmacies = await Pharmacy.countDocuments();

  const cities = (await Pharmacy.distinct("city")).length;

  const activeUsers = await User.countDocuments({ status: "active" });

  const activePharmacies = await Pharmacy.countDocuments({ status: "active" });

  const inActivePharmacies = await Pharmacy.countDocuments({
    status: "inactive",
  });

  const suspendedPharmacies = await Pharmacy.countDocuments({
    status: "suspended",
  });

  const staffRole = await Role.findOne({ name: "staff" });

  const activeStaff = await User.countDocuments({
    role: staffRole._id,
    status: "active",
  });

  const avgUsers =
    totalPharmacies === 0 ? 0 : Math.round(activeStaff / totalPharmacies);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const newPharmacies = await Pharmacy.countDocuments({
    createdAt: { $gte: startOfMonth },
  });

  const recentPharmacies = await Pharmacy.find()
    .populate("owner", "-password")
    .sort({ createdAt: -1 })
    .limit(5);

  logger.info("Dashboard Stats Fetched Successfully");

  return {
    totalPharmacies,
    cities,
    activeUsers,
    activePharmacies,
    inActivePharmacies,
    suspendedPharmacies,
    activeStaff,
    avgUsers,
    newPharmacies,
    recentPharmacies,
  };
};

const getSignUpTrend = async (period) => {
  const now = new Date();
  let startDate;
  let pipeline = [];

  switch (period) {
    case "daily":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);

      pipeline = [
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            signUp: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
        {
          $project: {
            _id: 0,
            label: "$_id",
            signUp: 1,
          },
        },
      ];
      break;
    case "weekly":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      pipeline = [
        {
          $match: {
            createdAt: {
              $gte: startDate,
            },
          },
        },
        {
          $project: {
            week: {
              $min: [
                {
                  $ceil: {
                    $divide: [
                      {
                        $dayOfMonth: "$createdAt",
                      },
                      7,
                    ],
                  },
                },
                4,
              ],
            },
          },
        },
        {
          $group: {
            _id: "$week",
            signUp: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
        {
          $project: {
            _id: 0,
            label: {
              $concat: [
                "Week ",
                {
                  $toString: "$_id",
                },
              ],
            },
            signUp: 1,
          },
        },
      ];
      break;

    case "monthly":
      startDate = new Date(now.getFullYear(), 0, 1);

      pipeline = [
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%m",
                date: "$createdAt",
              },
            },
            signUp: { $sum: 1 },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
        {
          $project: {
            _id: 0,
            label: "$_id",
            signUp: 1,
          },
        },
      ];
      break;

    case "yearly":
      startDate = new Date(now.getFullYear() - 4, 0, 1);

      pipeline = [
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y",
                date: "$createdAt",
              },
            },
            signUp: { $sum: 1 },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
        {
          $project: {
            _id: 0,
            label: "$_id",
            signUp: 1,
          },
        },
      ];
      break;

    default:
      throw new Error("Invalid period");
  }

  const signUpTrend = await User.aggregate(pipeline);

  logger.info("Sign Up Trend Fetched Successfully");

  return signUpTrend;
};

export { getDashboardStats, getSignUpTrend };
