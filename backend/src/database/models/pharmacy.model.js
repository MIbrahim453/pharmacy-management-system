import mongoose from "mongoose";

const pharmacySchema = new mongoose.Schema(
  {
    pharmacy_name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
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
    maxStaff: {
      type: Number,
      min: 2,
      max: 20,
      default: 10,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
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
  },
  { timestamps: true },
);

const Pharmacy = mongoose.model("Pharmacy", pharmacySchema);

export default Pharmacy;
