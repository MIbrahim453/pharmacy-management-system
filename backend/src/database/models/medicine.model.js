import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    stockQty: {
      type: Number,
      required: true,
    },
    reorderLevel: {
      type: Number,
    },
    tabPrice: {
      type: Number,
      required: true,
    },
    stripPrice: {
      type: Number,
      required: true,
    },
    packPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["inStock", "lowStock", "critical"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Medicine = mongoose.model("Medicine", medicineSchema);

export default Medicine;
