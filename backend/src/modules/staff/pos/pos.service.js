import Medicine from "../../../database/models/medicine.model.js";
import Category from "../../../database/models/category.model.js";
import User from "../../../database/models/user.model.js";
import Invoice from "../../../database/models/invoice.model.js";
import MedicineBatch from "../../../database/models/medicineBatch.model.js";
import { syncMedicineStockAndExpiry } from "../../../utils/sync.js";
import { BadRequestError, NotFoundError } from "../../../utils/errors.js";
import logger from "../../../utils/logger.js";
import mongoose from "mongoose";
import { generateUniqueNumber } from "../../../utils/helper.js";
import InvoiceBatchAllocation from "../../../database/models/invoiceBatchAllocation.model.js";
import Payment from "../../../database/models/payment.model.js"

const getMedicines = async (userId, filters = {}) => {
  const {
    id = "",
    name = "",
    category = "",
    startIndex = 0,
    limit = 10,
    order = "asc",
    searchTerm = "",
  } = filters;

  const sortDirection = order.toLowerCase() === "asc" ? 1 : -1;
  const catId = [];

  if (category) {
    const categories = await Category.find({
      name: { $regex: category, $options: "i" },
    }).select("_id");
    categories.forEach((item) => catId.push(item._id));
  }

  if (searchTerm) {
    const categories = await Category.find({
      name: { $regex: searchTerm, $options: "i" },
    }).select("_id");
    categories.forEach((item) => catId.push(item._id));
  }

  const user = await User.findOne({ _id: userId, status: "active" });
  const pharmacyId = user?.pharmacyId;

  const queryObj = { pharmacyId };

  if (category && catId.length > 0) {
    queryObj.category = { $in: catId };
  }

  if (searchTerm) {
    // Search term matches either name, genericName, manufacturer, or matching category names
    queryObj.$or = [
      { name: { $regex: searchTerm, $options: "i" } },
      { genericName: { $regex: searchTerm, $options: "i" } },
      { manufacturer: { $regex: searchTerm, $options: "i" } },
    ];
  }

  if (id) queryObj._id = id;
  if (name) queryObj.name = name;

  const medicines = await Medicine.find(queryObj)
    .skip(Number(startIndex))
    .limit(Number(limit))
    .sort({ updatedAt: sortDirection })
    .populate("category", "name")
    .populate("createdBy", "name email");

  logger.info("Medicine Fetched Successfully");

  return medicines;
};

const getMedicineCategoryNames = async () => {
  const categories = await Category.find()
    .select("name -_id")
    .sort({ name: 1 });
  logger.info("Medicine Categories Fetched Successfully");
  return categories.map((category) => category.name);
};

const createInvoice = async (userId, data) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  const user = await User.findOne({ _id: userId, status: "active" }).session(session);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (!user.pharmacyId) {
    throw new BadRequestError("User is not associated with any pharmacy");
  }
  const {
    customerName,
    customerPhone,
    paymentMethod,
    discount = 0,
    items,
  } = data;

  if (!items || items.length === 0) {
    throw new BadRequestError("Invoice must contain Items");
  }

  const invoiceItems = [];
  const allocatedBatches = [];
  let subTotal = 0;

  for (const item of items) {
    const medicine = await Medicine.findById(item.medicineId).session(session);
    if (!medicine) {
      throw new BadRequestError("Medicine Not Found");
    }

    if (medicine.pharmacyId?.toString() !== user.pharmacyId?.toString()) {
      throw new BadRequestError("Medicine Not Found");
    }
    if (medicine.stockQty < item.quantity) {
      throw new BadRequestError(`Insufficient stock for ${medicine.name}`);
    }

    let remainingQty = item.quantity;

    const batches = await MedicineBatch.find({
      medicineId: medicine._id,
      pharmacyId: user.pharmacyId,
      status: "active",
      expiryDate: { $gte: new Date() },
      currentQty: { $gt: 0 },
    })
      .sort({ expiryDate: 1 })
      .session(session);

    if (batches.length === 0) {
      throw new BadRequestError(`${medicine.name} has no available stock.`);
    }

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
      throw new BadRequestError(`Insufficient stock for ${medicine.name}.`);
    }

    allocatedBatches.push({
      medicine,
      batches: currentMedicineBatches,
      requestedQty: item.quantity,
    });
  }
  for (const allocation of allocatedBatches) {
    const { medicine, batches, requestedQty } = allocation;

    for (const batchAllocation of batches) {
      batchAllocation.batch.currentQty -= batchAllocation.deductQty;

      await batchAllocation.batch.save({ session });
    }

    await syncMedicineStockAndExpiry(medicine._id, session, userId);

    const unitPrice = medicine.sellingPrice;
    const total = unitPrice * requestedQty;

    subTotal += total;

    invoiceItems.push({
      medicineId: medicine._id,
      medicineName: medicine.name,
      quantity: requestedQty,
      unitPrice,
      total,
    });
  }

  const grandTotal = subTotal - discount;
  const invoiceNumber = generateUniqueNumber("INV");
  const createdInvoice = await Invoice.create(
    [{
      invoiceNumber,
      pharmacyId: user.pharmacyId,
      customerName,
      customerPhone,
      paymentMethod,
      invoiceType: "receivable",
      items: invoiceItems,
      subTotal,
      discount,
      grandTotal,
      createdBy: user._id,
    }],
    { session },
  );

  for (const allocation of allocatedBatches) {
    const { medicine, batches } = allocation;

    for (const batchAllocation of batches) {
      await InvoiceBatchAllocation.create(
        [
          {
            invoiceId: createdInvoice[0]._id,
            medicineId: medicine._id,
            pharmacyId: user.pharmacyId,
            medicineBatchId: batchAllocation.batch._id,
            quantity: batchAllocation.deductQty,
          },
        ],
        { session },
      );
    }
  }

  await session.commitTransaction();
  
  const invoice = await Invoice.findById(createdInvoice[0]._id)
    .populate("pharmacyId", "pharmacyName address phone")
    .populate("createdBy", "name staffCounter")
    .populate(
      "items.medicineId",
      "name brand genericName manufacturer saleUnit sellingPrice",
    );

  logger.info(`Invoice Created Successfully: ${invoiceNumber}`);

  return invoice;
};

export { getMedicines, getMedicineCategoryNames, createInvoice };
