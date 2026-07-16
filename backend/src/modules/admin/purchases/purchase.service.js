import Purchase from "../../../database/models/purchase.model.js";
import User from "../../../database/models/user.model.js";
import Medicine from "../../../database/models/medicine.model.js";
import MedicineBatch from "../../../database/models/medicineBatch.model.js";
import { syncMedicineStockAndExpiry } from "../../../utils/sync.js";
import { calculateCalculatedStock } from "../../../utils/conversion.js";
import logger from "../../../utils/logger.js";
import { BadRequestError, NotFoundError } from "../../../utils/errors.js";
import Invoice from "../../../database/models/invoice.model.js";
import { generateUniqueNumber } from "../../../utils/helper.js";
import Supplier from "../../../database/models/supplier.model.js";
import Payment from "../../../database/models/payment.model.js";

const createPurchase = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user || !user.pharmacyId) {
    throw new BadRequestError("User is not associated with any pharmacy");
  }

  const {
    supplierId,
    invoiceNumber,
    purchaseDate,
    paymentMethod,
    notes,
    items,
  } = data;

  const supplier = await Supplier.findById(supplierId);
  if (!supplier) {
    throw new NotFoundError("Supplier not found");
  }
  const purchaseNumber = generateUniqueNumber("PUR");

  const uniqueMedicineIds = new Set();
  const processedItems = [];
  let totalAmount = 0;

  for (const item of items) {
    uniqueMedicineIds.add(item.medicineId.toString());

    const medicineObj = await Medicine.findById(item.medicineId);
    if (!medicineObj) {
      throw new NotFoundError(`Medicine with ID ${item.medicineId} not found`);
    }

    const calculatedQty = calculateCalculatedStock(
      item.purchaseUnit,
      item.purchaseQty,
      item.packaging || [],
      medicineObj.saleUnit,
    );

    totalAmount += calculatedQty * item.costPrice;

    processedItems.push({
      medicineId: item.medicineId,
      medicineName: medicineObj.name,
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
      purchaseUnit: item.purchaseUnit,
      purchaseQty: item.purchaseQty,
      packaging: item.packaging || [],
      calculatedQty,
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice,
      location: item.location || "",
    });
  }
  const purchase = await Purchase.create({
    purchaseNumber,
    pharmacyId: user.pharmacyId,
    supplierId,
    purchaseDate,
    items: processedItems,
    notes: notes || "",
    totalAmount,
    status: "received",
    createdBy: userId,
  });

  const invoiceItems = processedItems.map((item) => ({
    medicineId: item.medicineId,
    medicineName: item.medicineName,
    quantity: item.calculatedQty,
    unitPrice: item.costPrice,
    total: item.calculatedQty * item.costPrice,
  }));

  const invoiceNumberForInvoice = purchaseNumber;

  const invoice = await Invoice.create({
    invoiceNumber: invoiceNumberForInvoice,
    pharmacyId: user.pharmacyId,
    supplierId,
    purchaseId: purchase._id,
    invoiceType: "payable",
    customerName: `${supplier.name} - ${supplier.contact} Supplier`,
    customerPhone: supplier.phone,
    items: invoiceItems,
    subTotal: totalAmount,
    grandTotal: totalAmount,
    discount: 0,
    tax: 0,
    paymentStatus: "Paid",
    paymentMethod: data.paymentMethod,
    createdBy: userId,
  });

  purchase.invoiceId = invoice._id
  await purchase.save();

  for (const item of processedItems) {
    const existingBatch = await MedicineBatch.findOne({
      medicineId: item.medicineId,
      batchNumber: item.batchNumber,
      pharmacyId: user.pharmacyId,
    });

    if (existingBatch) {
      existingBatch.initialQty += item.calculatedQty;
      existingBatch.currentQty += item.calculatedQty;
      existingBatch.purchaseQty += item.purchaseQty;
      existingBatch.purchaseUnit = item.purchaseUnit;
      existingBatch.packaging = item.packaging;
      existingBatch.costPrice = item.costPrice;
      existingBatch.supplierId = supplierId;
      existingBatch.expiryDate = item.expiryDate;
      existingBatch.location = item.location || existingBatch.location;
      existingBatch.sellingPrice = item.sellingPrice;

      if (new Date(item.expiryDate) > new Date()) {
        existingBatch.status = "active";
      }
      await existingBatch.save();
    } else {
      await MedicineBatch.create({
        medicineId: item.medicineId,
        batchNumber: item.batchNumber,
        supplierId,
        pharmacyId: user.pharmacyId,
        expiryDate: item.expiryDate,
        purchaseUnit: item.purchaseUnit,
        purchaseQty: item.purchaseQty,
        packaging: item.packaging,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
        initialQty: item.calculatedQty,
        currentQty: item.calculatedQty,
        location: item.location || "",
        pharmacyId: user.pharmacyId,
        status: "active",
      });
    }
  }

  for (const medicineId of uniqueMedicineIds) {
    await syncMedicineStockAndExpiry(medicineId, null, userId);
  }

  const payment = await Payment.create({
    pharmacyId: user.pharmacyId,
    invoiceId: invoice._id,
    type: "outflow",
    amount: totalAmount,
    paymentGateway: data.paymentMethod,
    status: "completed",
    performedBy: user._id,
  });


  const populatedPurchase = await Purchase.findById(purchase._id)
    .populate("supplierId", "name contact phone")
    .populate("createdBy", "name email")
    .populate("invoiceId", "invoiceNumber" )
    .populate(
      "items.medicineId",
      "name brand genericName manufacturer saleUnit sellingPrice",
    );

  const populatedInvoice = await Invoice.findById(invoice._id)
    .populate("pharmacyId", "pharmacyName address phone")
    .populate("supplierId", "name contact phone")
    .populate("createdBy", "name email")
    .populate(
      "items.medicineId",
      "name brand genericName manufacturer saleUnit sellingPrice",
    );
  logger.info(
    `Purchase ${purchaseNumber} Created and Stock Synchronized Successfully`,
  );

  return populatedPurchase;
};

const getPurchases = async (userId, filters = {}) => {
  const {
    supplierId,
    purchaseNumber = "",
    startDate,
    endDate,
    startIndex = 0,
    limit = 1000,
    order = "desc",
  } = filters;

  const user = await User.findById(userId);
  if (!user || !user.pharmacyId) {
    return [];
  }

  const sortDirection = order.toLowerCase() === "asc" ? 1 : -1;

  const query = {};

  if (supplierId) {
    query.supplierId = supplierId;
  }

  if (purchaseNumber) {
    query.purchaseNumber = { $regex: purchaseNumber, $options: "i" };
  }

  if (startDate || endDate) {
    query.purchaseDate = {};
    if (startDate) {
      query.purchaseDate.$gte = new Date(startDate);
    }
    if (endDate) {
      query.purchaseDate.$lte = new Date(endDate);
    }
  }

  query.pharmacyId = user.pharmacyId;

  const purchases = await Purchase.find(query)
    .skip(Number(startIndex))
    .limit(Number(limit))
    .sort({ purchaseDate: sortDirection })
    .populate("supplierId", "name contact phone")
    .populate("invoiceId", "invoiceNumber")
    .populate("createdBy", "name email");

  logger.info("Purchases Fetched Successfully");

  return purchases;
};

const viewPurchase = async (userId, id) => {
  const user = await User.findById(userId);
  if (!user || !user.pharmacyId) {
    throw new NotFoundError("Purchase Not Found");
  }

  const purchase = await Purchase.findOne({
    _id: id,
    pharmacyId: user.pharmacyId,
  })
    .populate("supplierId", "name contact phone")
    .populate("createdBy", "name email")
    .populate("invoiceId", "invoiceNumber")
    .populate(
      "items.medicineId",
      "name brand category genericName manufacturer saleUnit sellingPrice",
    );

  if (!purchase) {
    throw new NotFoundError("Purchase Not Found");
  }

  logger.info("Purchase Fetched Successfully");

  return purchase;
};

export { createPurchase, getPurchases, viewPurchase };

