import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transactionNumber: {
      type: String,
      required: true,
      unique: true,
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      required: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    type: {
      type: String,
      enum: ["inflow", "outflow"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    relatedTo: {
      type: String,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "Bank Transfer", "Cheque"],
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "pending", "failed"],
      default: "success",
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
