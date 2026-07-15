import mongoose from "mongoose";

const invoiceBatchAllocationSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      required: true,
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },
    medicineBatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicineBatch",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true },
);

invoiceBatchAllocationSchema.index({ invoiceId: 1 });
invoiceBatchAllocationSchema.index({ medicineBatchId: 1 });
invoiceBatchAllocationSchema.index({ pharmacyId: 1 });

const InvoiceBatchAllocation = mongoose.model(
  "InvoiceBatchAllocation",
  invoiceBatchAllocationSchema,
);


export default InvoiceBatchAllocation;
