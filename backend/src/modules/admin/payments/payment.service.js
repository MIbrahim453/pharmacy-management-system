import Payment from "../../../database/models/payment.model.js";
import User from "../../../database/models/user.model.js";
import logger from "../../../utils/logger.js";
import Invoice from "../../../database/models/invoice.model.js";
import { BadRequestError } from "../../../utils/errors.js";

const paymentStats = async (userId) => {
  const user = await User.findOne({ _id: userId, status: "active" });
  if (!user) {
    throw new BadRequestError("User not found");
  }

  const customerPendingPayments = await Payment.find({
    status: "pending",
    type: "inflow",
    pharmacyId: user.pharmacyId,
  });
  const customerTotalPendingAmount = customerPendingPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const customerPayments = await Payment.find({
    status: "completed",
    type: "inflow",
    pharmacyId: user.pharmacyId,
  });

  const customerTotalPaidAmount = customerPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const supplierPaidAmount = await Payment.find({
    status: "completed",
    type: "outflow",
    pharmacyId: user.pharmacyId,
  });
  const supplierTotalPaidAmount = supplierPaidAmount.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  logger.info("Payment Stats Fetched Successfully");

  return {
    totalCustomerPendingPayments: customerPendingPayments.length,
    customerTotalPendingAmount,
    totalCustomerPayments: customerPayments.length,
    customerTotalPaidAmount,
    totalSupplierPayments: supplierPaidAmount.length,
    supplierTotalPaidAmount,
  };
};

const getPayments = async (userId, filter) => {
  const user = await User.findOne({ _id: userId, status: "active" });
  if (!user) {
    throw new BadRequestError("User not found");
  }
  const customerPendingPayments = await Invoice.find({
    paymentStatus: "Unpaid",
    invoiceType: "receivable",
    pharmacyId: user.pharmacyId,
  });

  const customerPayments = await Invoice.find({
    paymentStatus: "Paid",
    invoiceType: "receivable",
    pharmacyId: user.pharmacyId,
  });

  const supplierPayments = await Invoice.find({
    paymentStatus: "Paid",
    invoiceType: "payable",
    pharmacyId: user.pharmacyId,
  }).populate("supplierId", "name");
  
  return {
    customerPendingPayments,
    customerPayments,
    supplierPayments,
  };
};

export {
  paymentStats, 
  getPayments,
}
