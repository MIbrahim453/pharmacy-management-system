import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema({
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true,
  },
  batchNumber: {
    type: String,
    required: true,
    trim: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  purchaseUnit: {
    type: String,
    required: true,
    trim: true,
  },
  purchaseQty: {
    type: Number,
    required: true,
    min: 1,
  },
  packaging: {
    type: [
      new mongoose.Schema(
        {
          from: { type: String, required: true, trim: true },
          to: { type: String, required: true, trim: true },
          factor: { type: Number, required: true, min: 1 },
        },
        { _id: false },
      ),
    ],
    default: [],
  },
  calculatedQty: {
    type: Number,
    required: true,
    min: 1,
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  sellingPrice: {
    type: Number,
    default: 0,
    min: 0,
  },
  location: {
    type: String,
    trim: true,
    default: "",
  },
});

const purchaseSchema = new mongoose.Schema(
  {
    purchaseNumber: {
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
      required: true,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    items: [purchaseItemSchema],
    notes: {
      type: String,
      default: "",
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["received", "cancelled"],
      default: "received",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Purchase = mongoose.model("Purchase", purchaseSchema);

export default Purchase;
