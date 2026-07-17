import * as yup from "yup";

// Schema for Login form
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
  rememberMe: yup.boolean().optional(),
});

// Schema for Forgot Password form
export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

// Schema for Reset Password form
export const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
});

// Schema for Profile Info form
export const profileSchema = yup.object().shape({
  name: yup
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(30, "Name cannot exceed 30 characters")
    .required("Name is required"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

// Schema for Change Password form (inside profile)
export const changePasswordSchema = yup.object().shape({
  current: yup.string().required("Current password is required"),
  next: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirm: yup
    .string()
    .oneOf([yup.ref("next"), null], "Passwords must match")
    .required("Please confirm your new password"),
});

// Schema for Onboarding a new Pharmacy
export const onboardPharmacySchema = yup.object().shape({
  pharmacyName: yup.string().required("Pharmacy name is required"),
  name: yup
    .string()
    .min(3, "Admin name must be at least 3 characters")
    .max(30, "Admin name cannot exceed 30 characters")
    .required("Admin name is required"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Admin email is required"),
  city: yup.string().required("City is required"),
  registrationNumber: yup.string().required("Registration number is required"),
});

// Schema for Editing a Pharmacy
export const editPharmacySchema = yup.object().shape({
  pharmacyName: yup.string().required("Pharmacy name is required"),
  city: yup.string().required("City is required"),
  registrationNumber: yup.string().required("Registration number is required"),
  totalStaff: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .typeError("Total staff must be a number")
    .min(0, "Total staff cannot be negative")
    .required("Total staff count is required"),
  status: yup
    .string()
    .oneOf(["active", "inactive"], "Status must be active or inactive")
    .required("Status is required"),
});

/**
 * Custom React Hook Form resolver for Yup schemas.
 * Eliminates the need for installing external resolver libraries.
 */
export const yupResolver = (schema) => async (data) => {
  try {
    const values = await schema.validate(data, { abortEarly: false });
    return { values, errors: {} };
  } catch (err) {
    return {
      values: {},
      errors: err.inner.reduce(
        (acc, currentError) => ({
          ...acc,
          [currentError.path]: {
            type: currentError.type ?? "validation",
            message: currentError.message,
          },
        }),
        {},
      ),
    };
  }
};
export const medicineCreateSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .required("Name is required"),
  genericName: yup
    .string()
    .min(2, "Generic name must be at least 2 characters")
    .max(100, "Generic name cannot exceed 100 characters")
    .required("Generic name is required"),
  category: yup
    .string()
    .min(2, "Category must be at least 2 characters")
    .max(100, "Category cannot exceed 100 characters")
    .required("Category is required"),
  manufacturer: yup
    .string()
    .min(2, "Manufacturer is required")
    .max(100, "Manufacturer cannot exceed 100 characters")
    .required("Manufacturer is required"),
  saleUnit: yup
    .string()
    .min(1, "Sale unit is required")
    .max(50, "Sale unit cannot exceed 50 characters")
    .required("Sale unit is required"),
  reorderLevel: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? undefined : value,
    )
    .typeError("Reorder level must be a number")
    .integer("Reorder level must be an integer")
    .min(0, "Reorder level cannot be negative")
    .optional(),
});

export const medicineEditSchema = medicineCreateSchema.shape({
  name: yup.string().min(2).max(100).optional(),
});

export const supplierCreateSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .required("Name is required"),
  contact: yup
    .string()
    .min(2, "Contact person must be at least 2 characters")
    .max(100, "Contact person cannot exceed 100 characters")
    .required("Contact person is required"),
  phone: yup
    .string()
    .min(11, "Phone must be at least 11 characters")
    .max(14, "Phone cannot exceed 14 characters")
    .required("Phone number is required"),
  status: yup
    .string()
    .oneOf(["active", "inactive"], "Status must be Active or Pending")
    .required("Status is required"),
});

export const supplierEditSchema = supplierCreateSchema.shape({
  name: yup.string().min(2).max(100).optional(),
});

export const staffRegisterSchema = yup.object().shape({
  name: yup
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(30, "Full name cannot exceed 30 characters")
    .required("Full name is required"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  role: yup
    .string()
    .oneOf(["Pharmacist", "Cashier", "Inventory"], "Invalid staff role")
    .required("Role is required"),
  counter: yup.string().optional(),
});

export const staffEditSchema = staffRegisterSchema;

export const purchaseCreateSchema = yup.object().shape({
  supplierId: yup.string().required("Supplier is required"),
  purchaseDate: yup
    .string()
    .required("Purchase date is required"),
  paymentMethod: yup
    .string()
    .oneOf(["Cash", "Card", "Bank Transfer", "Cheque"], "Invalid payment method")
    .required("Payment method is required"),
  notes: yup.string().optional(),
  items: yup
    .array()
    .of(
      yup.object().shape({
        medicineId: yup.string().required("Medicine is required"),
        batchNumber: yup
          .string()
          .min(1, "Batch number is required")
          .required("Batch number is required"),
        expiryDate: yup
          .string()
          .required("Expiry date is required"),
        purchaseUnit: yup.string().required("Purchase unit is required"),
        purchaseQty: yup
          .number()
          .transform((value, originalValue) =>
            originalValue === "" ? undefined : value,
          )
          .typeError("Purchase qty must be a number")
          .integer("Purchase qty must be an integer")
          .min(1, "Purchase qty must be at least 1")
          .required("Purchase qty is required"),
        costPrice: yup
          .number()
          .transform((value, originalValue) =>
            originalValue === "" ? undefined : value,
          )
          .typeError("Cost price must be a number")
          .min(0, "Cost price cannot be negative")
          .required("Cost price is required"),
        sellingPrice: yup
          .number()
          .transform((value, originalValue) =>
            originalValue === "" ? undefined : value,
          )
          .typeError("Selling price must be a number")
          .min(0, "Selling price cannot be negative")
          .required("Selling price is required"),
        location: yup.string().optional(),
        packaging: yup
          .array()
          .of(
            yup.object().shape({
              from: yup.string().required("Conversion source unit is required"),
              to: yup.string().required("Conversion target unit is required"),
              factor: yup
                .number()
                .transform((value, originalValue) =>
                  originalValue === "" ? undefined : value,
                )
                .typeError("Conversion factor must be a number")
                .integer("Conversion factor must be an integer")
                .min(1, "Conversion factor must be at least 1")
                .required("Conversion factor is required"),
            }),
          )
          .optional()
          .default([]),
      }),
    )
    .min(1, "At least one item is required")
    .required(),
});

export const batchEditSchema = yup.object().shape({
  batchNumber: yup.string().required("Batch number is required"),
  expiryDate: yup
    .string()
    .required("Expiry date is required"),
  costPrice: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .typeError("Cost price must be a number")
    .min(0, "Cost price cannot be negative")
    .required("Cost price is required"),
  sellingPrice: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .typeError("Selling price must be a number")
    .min(0, "Selling price cannot be negative")
    .required("Selling price is required"),
  currentQty: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .typeError("Current quantity must be a number")
    .integer("Current quantity must be an integer")
    .min(0, "Current quantity cannot be negative")
    .required("Current quantity is required"),
  supplierId: yup.string().nullable().optional(),
});

export const pharmacySettingsSchema = yup.object().shape({
  discount: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? undefined : value,
    )
    .typeError("Discount must be a number")
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%")
    .required("Discount is required"),
  lowStockThreshold: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? undefined : value,
    )
    .typeError("Low stock threshold must be a number")
    .integer("Low stock threshold must be an integer")
    .min(0, "Low stock threshold cannot be negative")
    .required("Low stock threshold is required"),
  criticalStockThreshold: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? undefined : value,
    )
    .typeError("Critical stock threshold must be a number")
    .integer("Critical stock threshold must be an integer")
    .min(0, "Critical stock threshold cannot be negative")
    .required("Critical stock threshold is required"),
});

export const pharmacyDetailsSchema = yup.object().shape({
  pharmacyEmail: yup
    .string()
    .email("Please enter a valid email address")
    .optional()
    .default(""),
  phone: yup
    .string()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .min(11, "Phone must be at least 11 characters")
    .max(14, "Phone cannot exceed 14 characters")
    .optional(),
  address: yup
    .string()
    .min(2, "Address must be at least 2 characters")
    .max(255, "Address cannot exceed 255 characters")
    .optional()
    .default(""),
  totalStaff: yup
    .number()
    .typeError("Staff count must be a number")
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .optional(),
});

export const userStatusSchema = yup.object().shape({
  status: yup
    .string()
    .oneOf(["active", "inactive", "suspended"], "Status must be active, inactive, or suspended")
    .required("Status is required"),
});

export default yupResolver;



