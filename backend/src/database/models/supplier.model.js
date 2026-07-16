import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    minlength: 11,
    maxlength: 14,
  },
  lastOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  payable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  },
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pharmacy",
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;

