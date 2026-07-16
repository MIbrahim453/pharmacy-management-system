import mongoose from "mongoose";

const pharmacySchema = new mongoose.Schema(
  {
    pharmacyName: {
      type: String,
      required: true,
      alias: "pharmacy_name",
    },
    pharmacyEmail : {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      required: false,
      minlength: 11,
      maxlength: 14,
    },
    address: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    totalStaff: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "inactive",
      required: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 20,
    },
    criticalStockThreshold: {
      type: Number,
      default: 5,
    },
    discount: {
      type: Number,
      default: 0,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Pharmacy = mongoose.model("Pharmacy", pharmacySchema);

export default Pharmacy;

