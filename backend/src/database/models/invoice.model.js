import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },
    purchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      default: null,
    },
    customerName: {
      type: String,
      required: true,
      default: null
    },
    customerPhone: {
      type: String,
      required: true,
      default: null
    },
    invoiceType: {
      type: String,
      enum: ["receivable", "payable"],
      required: true,
    },
    items: [
      {
        medicineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
          required: true,
        },
        medicineName: {
          type: String,
          required: true,
        },
        quantity: Number,
        unitPrice: Number,
        total: Number,
      },
    ],
    subTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Unpaid", "Pending"],
      default: "Unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "Bank Transfer", "Cheque"],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { timestamps: true },
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
