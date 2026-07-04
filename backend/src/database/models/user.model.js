import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    staffRole: {
      type: String,
      enum: ["Manager", "Pharmacist", "Cashier"],
      default: null,
    },
    staffCounter: {
      type: String,
    },
    staffInvoices: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    lastActive: {
      type: Date,
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

const User = mongoose.model("User", userSchema);

export default User;
