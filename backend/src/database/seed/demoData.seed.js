import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";

import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import Pharmacy from "../models/pharmacy.model.js";
import Category from "../models/category.model.js";
import Supplier from "../models/supplier.model.js";
import Medicine from "../models/medicine.model.js";
import MedicineBatch from "../models/medicineBatch.model.js";
import Purchase from "../models/purchase.model.js";
import Invoice from "../models/invoice.model.js";
import InvoiceBatchAllocation from "../models/invoiceBatchAllocation.model.js";
import Payment from "../models/payment.model.js";

import seedRoles from "./role.seed.js";
import seedCategories from "./category.seed.js";

const run = async () => {
  try {
    const mongoUri = `${process.env.MONGODB_URI}/${process.env.DB_NAME}`;
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri, {
      connectTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
    });
    console.log("Connected successfully!");

    // Run base seeders first
    console.log("Seeding base roles and categories...");
    await seedRoles();
    await seedCategories();

    // 1. Get Roles
    const adminRole = await Role.findOne({ name: "admin" });
    const staffRole = await Role.findOne({ name: "staff" });
    if (!adminRole || !staffRole) {
      throw new Error("Admin or Staff role not found in database.");
    }

    // 2. Find or Create Pharmacy
    let pharmacy = await Pharmacy.findOne({ pharmacyName: "Care Pharmacy" });
    if (!pharmacy) {
      pharmacy = await Pharmacy.findOne({ registrationNumber: "REG-HEALTH-12345" });
    }
    if (!pharmacy) {
      pharmacy = await Pharmacy.create({
        pharmacyName: "Care Pharmacy",
        pharmacyEmail: "care@example.com",
        phone: "03001234567",
        city: "Karachi",
        registrationNumber: "REG-HEALTH-12345",
        status: "active",
        lowStockThreshold: 20,
        criticalStockThreshold: 5,
        discount: 10,
      });
      console.log("Created Care Pharmacy");
    } else {
      pharmacy.status = "active";
      pharmacy.pharmacyName = "Care Pharmacy";
      await pharmacy.save();
    }

    // 3. Find or Create Admin
    const hashedPassword = await bcrypt.hash("123456", 10);
    let adminUser = await User.findOne({ email: "admin@example.com" });
    if (!adminUser) {
      adminUser = await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: adminRole._id,
        pharmacyId: pharmacy._id,
        status: "active",
      });
      console.log("Created admin@example.com");
    } else {
      adminUser.pharmacyId = pharmacy._id;
      adminUser.role = adminRole._id;
      adminUser.status = "active";
      await adminUser.save();
    }

    // 4. Update Pharmacy Owner
    pharmacy.owner = adminUser._id;
    pharmacy.createdBy = adminUser._id;
    await pharmacy.save();

    // 5. Find or Create Staff
    let staffUser = await User.findOne({ email: "staff@example.com" });
    if (!staffUser) {
      staffUser = await User.create({
        name: "Staff User",
        email: "staff@example.com",
        password: hashedPassword,
        role: staffRole._id,
        staffRole: "Pharmacist",
        staffCounter: "Counter 1",
        pharmacyId: pharmacy._id,
        status: "active",
        createdBy: adminUser._id,
      });
      console.log("Created staff@example.com");
    } else {
      staffUser.pharmacyId = pharmacy._id;
      staffUser.role = staffRole._id;
      staffUser.status = "active";
      await staffUser.save();
    }

    // 6. Find or Create Supplier
    let supplier = await Supplier.findOne({ pharmacyId: pharmacy._id, name: "Universal Pharma Distributors" });
    if (!supplier) {
      supplier = await Supplier.create({
        name: "Universal Pharma Distributors",
        contact: "Mr. Khan",
        phone: "03001234567",
        pharmacyId: pharmacy._id,
        status: "active",
        createdBy: adminUser._id,
      });
      console.log("Created Supplier");
    }

    // 7. Find standard Categories
    const analgesicsCat = await Category.findOne({ name: "Analgesics" });
    const antibioticsCat = await Category.findOne({ name: "Antibiotics" });
    const antacidsCat = await Category.findOne({ name: "Antacids" });

    // 8. Find or Create Medicines
    const medicineDefs = [
      { name: "Panadol 500mg", genericName: "Paracetamol", category: analgesicsCat._id, manufacturer: "GSK", saleUnit: "Tablet", sellingPrice: 15 },
      { name: "Augmentin 375mg", genericName: "Co-Amoxiclav", category: antibioticsCat._id, manufacturer: "GSK", saleUnit: "Tablet", sellingPrice: 60 },
      { name: "Zantac 150mg", genericName: "Ranitidine", category: antacidsCat._id, manufacturer: "GSK", saleUnit: "Tablet", sellingPrice: 20 },
    ];

    const medicines = [];
    for (const def of medicineDefs) {
      let med = await Medicine.findOne({ pharmacyId: pharmacy._id, name: def.name });
      if (!med) {
        med = await Medicine.create({
          ...def,
          pharmacyId: pharmacy._id,
          createdBy: adminUser._id,
          stockQty: 0,
          status: "critical",
        });
        console.log(`Created Medicine ${def.name}`);
      } else {
        med.category = def.category;
        med.sellingPrice = def.sellingPrice;
        await med.save();
      }
      medicines.push(med);
    }

    // 9. Clear old demo transactions to prevent clutter
    console.log("Clearing old transaction seed data...");
    await MedicineBatch.deleteMany({ pharmacyId: pharmacy._id });
    await Purchase.deleteMany({ pharmacyId: pharmacy._id });
    await Invoice.deleteMany({ pharmacyId: pharmacy._id });
    await InvoiceBatchAllocation.deleteMany({ pharmacyId: pharmacy._id });
    await Payment.deleteMany({ pharmacyId: pharmacy._id });

    // 10. Generate dates
    // 7 different dates of last month (June 2026)
    const lastMonthDates = [
      new Date(2026, 5, 2, 10, 0, 0),
      new Date(2026, 5, 5, 11, 30, 0),
      new Date(2026, 5, 10, 14, 15, 0),
      new Date(2026, 5, 13, 16, 0, 0),
      new Date(2026, 5, 18, 12, 45, 0),
      new Date(2026, 5, 22, 15, 20, 0),
      new Date(2026, 5, 27, 17, 10, 0)
    ];

    // 9 different dates of this month (July 2026) till 18 July 2026
    const thisMonthDates = [
      new Date(2026, 6, 1, 9, 30, 0),
      new Date(2026, 6, 3, 11, 0, 0),
      new Date(2026, 6, 5, 14, 0, 0),
      new Date(2026, 6, 8, 15, 45, 0),
      new Date(2026, 6, 10, 12, 15, 0),
      new Date(2026, 6, 12, 16, 30, 0),
      new Date(2026, 6, 14, 10, 0, 0),
      new Date(2026, 6, 16, 13, 20, 0),
      new Date(2026, 6, 18, 17, 0, 0)
    ];

    const allDates = [...lastMonthDates, ...thisMonthDates];
    console.log(`Generating transactions across ${allDates.length} dates...`);

    for (let i = 0; i < allDates.length; i++) {
      const date = allDates[i];
      const batchMap = {};

      // A. Create batches for this date
      for (const med of medicines) {
        const batchNum = `B-${date.getTime()}-${med.name.substring(0, 3).toUpperCase()}-${i}`;
        const batch = await MedicineBatch.create({
          medicineId: med._id,
          batchNumber: batchNum,
          supplierId: supplier._id,
          pharmacyId: pharmacy._id,
          expiryDate: new Date(2028, 5, 1),
          purchaseUnit: med.saleUnit,
          purchaseQty: 100,
          costPrice: 5,
          sellingPrice: med.sellingPrice,
          initialQty: 100,
          currentQty: 70, // after 30 are sold in the invoice below
          status: "active",
          location: "Shelf A",
          createdAt: date,
          updatedAt: date
        });
        batchMap[med._id] = batch;
      }

      // B. Create Purchase Log for this date (created by admin)
      const purchaseNumber = `PUR-${date.getTime()}-${i}`;
      await Purchase.create({
        purchaseNumber,
        pharmacyId: pharmacy._id,
        supplierId: supplier._id,
        purchaseDate: date,
        items: medicines.map(med => ({
          medicineId: med._id,
          batchNumber: batchMap[med._id].batchNumber,
          expiryDate: new Date(2028, 5, 1),
          purchaseUnit: med.saleUnit,
          purchaseQty: 100,
          calculatedQty: 100,
          costPrice: 5,
          sellingPrice: med.sellingPrice,
          location: "Shelf A"
        })),
        notes: "Restock Purchase Order",
        totalAmount: medicines.length * 100 * 5,
        status: "received",
        createdBy: adminUser._id,
        createdAt: date,
        updatedAt: date
      });

      // C. Create Invoice (sales) for this date (created by staff)
      const invoiceNumber = `INV-${date.getTime()}-${i}`;
      const subTotal = medicines.reduce((sum, med) => sum + (med.sellingPrice * 30), 0);
      const discount = 0;
      const grandTotal = subTotal - discount;

      const invoice = await Invoice.create({
        invoiceNumber,
        pharmacyId: pharmacy._id,
        customerName: "Walk-in Customer",
        customerPhone: "03001234567",
        invoiceType: "receivable",
        items: medicines.map(med => ({
          medicineId: med._id,
          medicineName: med.name,
          quantity: 30,
          unitPrice: med.sellingPrice,
          total: med.sellingPrice * 30
        })),
        subTotal,
        grandTotal,
        discount,
        paymentStatus: "Paid",
        paymentMethod: "Cash",
        createdBy: staffUser._id,
        createdAt: date,
        updatedAt: date
      });

      // D. Create Inflow Payment
      await Payment.create({
        invoiceId: invoice._id,
        pharmacyId: pharmacy._id,
        type: "inflow",
        amount: grandTotal,
        paymentGateway: "Cash",
        status: "completed",
        performedBy: staffUser._id,
        createdAt: date,
        updatedAt: date
      });

      // E. Create Allocations
      for (const med of medicines) {
        await InvoiceBatchAllocation.create({
          invoiceId: invoice._id,
          pharmacyId: pharmacy._id,
          medicineId: med._id,
          medicineBatchId: batchMap[med._id]._id,
          quantity: 30,
          createdAt: date,
          updatedAt: date
        });
      }
    }

    // 11. Sync Medicine Stocks
    console.log("Synchronizing medicine stock quantities and statuses...");
    for (const med of medicines) {
      const activeBatches = await MedicineBatch.find({ medicineId: med._id, status: "active" });
      const totalStock = activeBatches.reduce((sum, b) => sum + b.currentQty, 0);
      const nearestExpiry = activeBatches.reduce((min, b) => b.expiryDate < min ? b.expiryDate : min, new Date(2099, 11, 31));

      let status = "critical";
      if (totalStock >= pharmacy.lowStockThreshold) {
        status = "inStock";
      } else if (totalStock >= pharmacy.criticalStockThreshold) {
        status = "lowStock";
      }

      await Medicine.findByIdAndUpdate(med._id, {
        stockQty: totalStock,
        expiryDate: nearestExpiry.getFullYear() === 2099 ? null : nearestExpiry,
        status
      });
    }

    console.log("Demo transaction seeding completed successfully!");
    mongoose.disconnect();
  } catch (error) {
    console.error("Failed to seed database demo data:", error);
    mongoose.disconnect();
  }
};

run();
