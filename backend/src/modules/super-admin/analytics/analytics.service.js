import User from "../../../database/models/user.model.js";
import Pharmacy from "../../../database/models/pharmacy.model.js";
import logger from "../../../utils/logger.js";
import loginHistory from "../../../database/models/loginHistory.model.js";

const avgHourlySignIns = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const hourlySignIns = await loginHistory.aggregate([
    {
      $match: {
        loginAt: {
          $gte: startOfDay,
        },
      },
    },
    {
      $group: {
        _id: {
          $hour: "$loginAt",
        },
        totalSignIns: {
          $sum: 1,
        },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        _id: 0,
        hour: "$_id",
        totalSignIns: 1,
      },
    },
  ]);

  logger.info("Hourly SignIns Fetched Successfully");

  return hourlySignIns;
};

const avgPharmacyByCites = async () => {
  const pharmaciesByCities = await Pharmacy.aggregate([
    {
      $group: {
        _id: "$city",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ]);

  const totalPharmacies = await Pharmacy.countDocuments();

  const result = pharmaciesByCities.map((city) => {
    return {
      city: city._id,
      count: city.count,
      percentage: Number(((city.count / totalPharmacies) * 100).toFixed(1)),
    };
  });

  const topCities = result.slice(0, 5);

  const othersCount = result
    .slice(5)
    .reduce((sum, city) => sum + city.count, 0);

  topCities.push({
    city: "Others",
    count: othersCount,
    percentage: Number(((othersCount / totalPharmacies) * 100).toFixed(1)),
  });

  logger.info("Pharmacies Percentage By Cities Calculated Successfully");

  return topCities;
};

const getAnalytics = async () => {
  const activeUsers = await User.countDocuments({ status: "active" });

  const activePharmacies = await Pharmacy.countDocuments({ status: "active" });

  const suspendedPharmacies = await Pharmacy.countDocuments({
    status: "suspended",
  });

  return {
    activePharmacies,
    activeUsers,
    suspendedPharmacies,
  };
};

export { avgHourlySignIns, avgPharmacyByCites, getAnalytics };
