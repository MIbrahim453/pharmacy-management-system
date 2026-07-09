import mongoose from "mongoose";

const packagingStepSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
    trim: true,
  },
  to: {
    type: String,
    required: true,
    trim: true,
  },
  factor: {
    type: Number,
    required: true,
    min: 1,
  },
}, { _id: false });

const medicineBatchSchema = new mongoose.Schema(
  {
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
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
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
      type: [packagingStepSchema],
      default: [],
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
    initialQty: {
      type: Number,
      required: true,
      min: 1,
    },
    currentQty: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "expired", "discarded"],
      default: "active",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

medicineBatchSchema.index({ medicineId: 1, batchNumber: 1 }, { unique: true });

const MedicineBatch = mongoose.model("MedicineBatch", medicineBatchSchema);

export default MedicineBatch;
