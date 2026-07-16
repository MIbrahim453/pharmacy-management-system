import User from "../../../database/models/user.model.js";
import Invoice from "../../../database/models/invoice.model.js";
import Medicine from "../../../database/models/medicine.model.js";
import { BadRequestError } from "../../../utils/errors.js";
import logger from "../../../utils/logger.js";
import MedicineBatch from "../../../database/models/medicineBatch.model.js";
import { paymentStats } from "../payments/payment.service.js";

const dashboardStats = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new BadRequestError("User not found");
  }

  const totalMedicines = await Medicine.countDocuments({
    pharmacyId: user.pharmacyId,
  }).populate("category", "name");

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setHours(23, 59, 59, 999);

  const totalInvoices = await Invoice.countDocuments({
    pharmacyId: user.pharmacyId,
    paymentStatus: "Paid",
    purchaseId: null,
    invoiceType: "receivable",
    createdAt: { $gte: startDate, $lte: endDate },
  });

  const unitsSold = await Invoice.aggregate([
    {
      $match: {
        pharmacyId: user.pharmacyId,
        paymentStatus: "Paid",
        purchaseId: null,
        invoiceType: "receivable",
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $unwind: "$items",
    },
    {
      $group: {
        _id: null,
        totalUnits: {
          $sum: "$items.quantity",
        },
      },
    },
  ]);

  const revenueToday = await Invoice.aggregate([
    {
      $match: {
        pharmacyId: user.pharmacyId,
        paymentStatus: "Paid",
        purchaseId: null,
        invoiceType: "receivable",
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: "$grandTotal",
        },
      },
    },
  ]);

  const pendingPaymentsToday = await Invoice.find({
    paymentStatus: "Unpaid",
    purchaseId: null,
    pharmacyId: user.pharmacyId,
    invoiceType: "receivable",
    createdAt: { $gte: startDate, $lte: endDate },
  });

  const totalPendingPayment = pendingPaymentsToday.reduce(
    (sum, payment) => sum + payment.grandTotal,
    0,
  );
  const lowStock = await Medicine.countDocuments({
    pharmacyId: user.pharmacyId,
    status: "lowStock",
  });
  const critical = await Medicine.countDocuments({
    pharmacyId: user.pharmacyId,
    status: "critical",
  });
  const medBatchExpirySoon = await MedicineBatch.countDocuments({
    pharmacyId: user.pharmacyId,
    expiryDate: {
      $lt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    status: "active",
  });

  logger.info("Dashboard Stats Fetched Successfully");

  return {
    totalMedicines,
    totalInvoices,
    unitsSold: unitsSold[0]?.totalUnits || 0,
    revenueToday: revenueToday[0]?.totalRevenue || 0,
    totalPendingPayment,
    lowStock,
    critical,
    medBatchExpirySoon,
  };
};

const revenueTrends = async (userId, period) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new BadRequestError("User not found");
  }
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
            invoiceType: "receivable",
            pharmacyId: user.pharmacyId,
            paymentStatus: "Paid",
            purchaseId: null,
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
            revenue: {
              $sum: "$grandTotal",
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ];
      break;
    case "weekly":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);

      pipeline = [
        {
          $match: {
            invoiceType: "receivable",
            pharmacyId: user.pharmacyId,
            paymentStatus: "Paid",
            purchaseId: null,
            createdAt: { $gte: startDate },
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
            revenue: {
              $sum: "$grandTotal",
            },
            totalInvoices: {
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
                "W",
                {
                  $toString: "$_id",
                },
              ],
            },
            revenue: 1,
            totalInvoices: 1,
          },
        },
      ];
      break;
    case "monthly":
      startDate = new Date(now.getFullYear(), 0, 1);
      pipeline = [
        {
          $match: {
            invoiceType: "receivable",
            pharmacyId: user.pharmacyId,
            paymentStatus: "Paid",
            purchaseId: null,
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
            revenue: {
              $sum: "$grandTotal",
            },
            totalInvoices: {
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
            revenue: 1,
            totalInvoices: 1,
          },
        },
      ];
      break;
    case "yearly":
      startDate = new Date(now.getFullYear() - 4, 0, 1);
      pipeline = [
        {
          $match: {
            invoiceType: "receivable",
            pharmacyId: user.pharmacyId,
            paymentStatus: "Paid",
            purchaseId: null,
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
            revenue: {
              $sum: "$grandTotal",
            },
            totalInvoices: {
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
            revenue: 1,
            totalInvoices: 1,
          },
        },
      ];
      break;
    default:
      throw new BadRequestError("Invalid period");
      break;
  }

  const revenueTrend = await Invoice.aggregate(pipeline);

  logger.info("Revenue Trend Fetched Successfully");

  return revenueTrend;
};

const topSellingMedicines = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new BadRequestError("User not found");
  }

  const topSelling = await Invoice.aggregate([
    {
      $match: {
        pharmacyId: user.pharmacyId,
        paymentStatus: "Paid",
        purchaseId: null,
        invoiceType: "receivable",
      },
    },
    {
      $unwind: "$items",
    },
    {
      $group: {
        _id: "$items.medicineId",
        medicineName: {
          $first: "$items.medicineName",
        },
        totalUnitsSold: {
          $sum: "$items.quantity",
        },
        totalRevenue: {
          $sum: "$items.total",
        },
        totalInvoices: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        totalUnitsSold: -1,
      },
    },
    {
      $limit: 5,
    },
    {
      $project: {
        _id: 0,
        medicineId: "$_id",
        medicineName: 1,
        totalUnitsSold: 1,
        totalRevenue: 1,
        totalInvoices: 1,
      },
    },
  ]);

  logger.info("Top Selling Medicines Fetched Successfully");

  return topSelling;
};

export { dashboardStats, revenueTrends, topSellingMedicines };
