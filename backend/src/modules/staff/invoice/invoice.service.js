import Medicine from "../../../database/models/medicine.model.js";
import User from "../../../database/models/user.model.js";
import Invoice from "../../../database/models/invoice.model.js";
import MedicineBatch from "../../../database/models/medicineBatch.model.js";
import InvoiceBatchAllocation from "../../../database/models/invoiceBatchAllocation.model.js";
import logger from "../../../utils/logger.js";
import { BadRequestError } from "../../../utils/errors.js";
import mongoose from "mongoose";
import { syncMedicineStockAndExpiry } from "../../../utils/sync.js";
import Payment from "../../../database/models/payment.model.js";

const editInvoice = async (userId, id, data) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  const user = await User.findById(userId).session(session);
  if (!user) {
    throw new BadRequestError("User Not Found");
  }

  const invoice = await Invoice.findById(id).session(session);

  if (!invoice) {
    throw new BadRequestError("Invoice Not Found");
  }
  if (invoice.paymentStatus === "Paid") {
    throw new BadRequestError("Cannot Edit Paid Invoice");
  }

  const prevAllocations = await InvoiceBatchAllocation.find({
    invoiceId: invoice._id,
  }).session(session);

  for (const allocation of prevAllocations) {
    const batch = await MedicineBatch.findById(
      allocation.medicineBatchId,
    ).session(session);
    batch.currentQty += allocation.quantity;

    await batch.save({ session });
  }

  const medicineIds = [
    ...new Set(prevAllocations.map((item) => item.medicineId)),
  ];

  for (const medicineId of medicineIds) {
    await syncMedicineStockAndExpiry(medicineId, session, userId);
  }

  await InvoiceBatchAllocation.deleteMany(
    {
      invoiceId: invoice._id,
    },
    { session },
  );

  const invoiceItems = [];
  const allocatedBatches = [];
  let subTotal = 0;

  for (const item of data.items) {
    const medicine = await Medicine.findById(item.medicineId).session(session);
    if (!medicine) {
      throw new BadRequestError(
        `Medicine with id ${item.medicineId} not found`,
      );
    }
    if (medicine.stockQty < item.quantity) {
      throw new BadRequestError(`Insufficient stock for ${medicine.name}.`);
    }

    let remainingQty = item.quantity;

    const batches = await MedicineBatch.find({
      medicineId: item.medicineId,
      pharmacyId: user.pharmacyId,
      status: "active",
      expiryDate: { $gte: new Date() },
      currentQty: { $gt: 0 },
    })
      .sort({ expiryDate: 1 })
      .session(session);

    const currentMedicineBatches = [];

    for (const batch of batches) {
      if (remainingQty === 0) break;

      const deductQty = Math.min(batch.currentQty, remainingQty);

      currentMedicineBatches.push({
        batch,
        deductQty,
      });

      remainingQty -= deductQty;
    }
    if (remainingQty > 0) {
      throw new BadRequestError(`Insufficient stock for ${medicine.name}`);
    }
    allocatedBatches.push({
      medicine,
      batches: currentMedicineBatches,
      requestedQty: item.quantity,
    });
  }

  for (const allocation of allocatedBatches) {
    const { medicine, requestedQty, batches } = allocation;

    for (const batchAllocation of batches) {
      batchAllocation.batch.currentQty -= batchAllocation.deductQty;

      await batchAllocation.batch.save({
        session,
      });

      await InvoiceBatchAllocation.create(
        [
          {
            invoiceId: invoice._id,
            pharmacyId: invoice.pharmacyId,
            medicineId: medicine._id,
            medicineBatchId: batchAllocation.batch._id,
            quantity: batchAllocation.deductQty,
          },
        ],
        { session },
      );
    }

    await syncMedicineStockAndExpiry(medicine._id, session, userId);

    const unitPrice = medicine.sellingPrice;

    const total = requestedQty * unitPrice;

    subTotal += total;

    invoiceItems.push({
      medicineId: medicine._id,
      medicineName: medicine.name,
      quantity: requestedQty,
      unitPrice,
      total,
    });
  }

  invoice.customerName = data.customerName;
  invoice.customerPhone = data.customerPhone;
  invoice.paymentMethod = data.paymentMethod;
  invoice.items = invoiceItems;
  invoice.subTotal = subTotal;
  invoice.discount = data.discount ?? 0;
  invoice.grandTotal = subTotal - (data.discount ?? 0);

  await invoice.save({ session });

  await session.commitTransaction();

  logger.info(`Invoice Updated Successfully : ${invoice.invoiceNumber}`);

  return invoice;
};

const getInvoiceForStaff = async (userId, filter = {}) => {
  const {
    invoiceId,
    status,
    customerName,
    customerPhone,
    startDate,
    endDate,
    startIndex = 0,
    limit = 10,
    searchTerm = "",
  } = filter;
  const user = await User.findById(userId);
  if (!user) {
    throw new BadRequestError("User Not Found");
  }

  const invoices = await Invoice.find({
    createdBy: user._id,
    pharmacyId: user.pharmacyId,
    $or: [
      {
        invoiceNumber: { $regex: searchTerm, $options: "i" },
      },
      {
        customerName: { $regex: searchTerm, $options: "i" },
      },
      {
        customerPhone: { $regex: searchTerm, $options: "i" },
      },
    ],
    ...(invoiceId && { invoiceNumber: invoiceId }),
    ...(status && { paymentStatus: status }),
    ...(customerName && { customerName }),
    ...(customerPhone && { customerPhone }),
    ...(startDate &&
      endDate && {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      }),
  })
    .populate("pharmacyId", "pharmacyName address phone")
    .populate("createdBy", "name staffCounter")
    .populate(
      "items.medicineId",
      "name brand genericName manufacturer saleUnit sellingPrice",
    )
    .sort({ createdAt: -1 });

  logger.info("Invoices Fetched Successfully");

  return invoices;
};

const markPaid = async (userId, invoiceId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const user = await User.findById(userId).session(session);
  if (!user) {
    throw new BadRequestError("User Not Found");
  }
  const invoice = await Invoice.findById(invoiceId).session(session);
  if (!invoice) {
    throw new BadRequestError("Invoice Not Found");
  }
  if (invoice.paymentStatus === "Paid") {
    throw new BadRequestError("Invoice Already Paid");
  }
  invoice.paymentStatus = "Paid";

  await invoice.save({ session });

  const payment = await Payment.create(
    [
      {
        invoiceId: invoice._id,
        pharmacyId: user.pharmacyId,
        amount: invoice.grandTotal,
        type: "inflow",
        paymentGateway: invoice.paymentMethod,
        status: "completed",
        performedBy: user._id,
      },
    ],
    { session },
  );

  await session.commitTransaction();

  const populatedInvoice = await Invoice.findById(invoice._id)
    .populate("pharmacyId", "pharmacyName address phone")
    .populate("createdBy", "name staffCounter")
    .populate(
      "items.medicineId",
      "name brand genericName manufacturer saleUnit sellingPrice",
    );

  const populatedPayment = await Payment.findById(payment[0]._id).populate(
    "performedBy",
    "name staffCounter",
  );

  logger.info(`Invoice Marked as Paid: ${invoice.invoiceNumber}`);

  return {
    invoice: populatedInvoice,
    payment: populatedPayment,
  };
};

const viewInvoice = async (userId, invoiceId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new BadRequestError("User Not Found");
  }
  const invoice = await Invoice.findById(invoiceId)
    .populate("pharmacyId", "pharmacyName address phone")
    .populate("createdBy", "name staffCounter")
    .populate(
      "items.medicineId",
      "name genericName manufacturer saleUnit sellingPrice",
    )
    .populate("createdBy", "name staffCounter");

  logger.info(`Invoice Fetched Successfully: ${invoice.invoiceNumber}`);

  return invoice;
};
const downloadInvoice = async (userId, invoiceId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new BadRequestError("User Not Found");
  }

  const invoice = await Invoice.findById(invoiceId)
    .populate("pharmacyId", "pharmacyName address phone email")
    .populate("createdBy", "name staffCounter")
    .populate(
      "items.medicineId",
      "name genericName manufacturer saleUnit sellingPrice",
    );

  if (!invoice) {
    throw new BadRequestError("Invoice Not Found");
  }

  if (invoice.createdBy._id.toString() !== user._id.toString()) {
    throw new BadRequestError("Unauthorized to access this invoice");
  }

  logger.info(`Invoice Downloaded: ${invoice.invoiceNumber}`);

  return invoice;
};

export { editInvoice, getInvoiceForStaff, markPaid, viewInvoice, downloadInvoice };
