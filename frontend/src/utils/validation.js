import * as yup from "yup";

// Schema for Login form
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
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
  pharmacy_name: yup.string().required("Pharmacy name is required"),
  city: yup.string().required("City is required"),
  registrationNumber: yup.string().required("Registration number is required"),
  maxStaff: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .typeError("Max staff must be a number")
    .min(2, "Max staff must be at least 2")
    .max(20, "Max staff cannot exceed 20")
    .required("Max staff count is required"),
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
        {}
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
  brand: yup
    .string()
    .min(2, "Brand must be at least 2 characters")
    .max(100, "Brand cannot exceed 100 characters")
    .required("Brand is required"),
  category: yup
    .string()
    .min(2, "Category must be at least 2 characters")
    .max(100, "Category cannot exceed 100 characters")
    .required("Category is required"),
  expiryDate: yup
    .date()
    .typeError("Please enter a valid expiry date")
    .required("Expiry date is required"),
  stockQty: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .typeError("Stock quantity must be a number")
    .integer("Stock quantity must be an integer")
    .min(0, "Stock quantity cannot be negative")
    .required("Stock quantity is required"),
  reorderLevel: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" || originalValue === null ? undefined : value))
    .typeError("Reorder level must be a number")
    .integer("Reorder level must be an integer")
    .min(0, "Reorder level cannot be negative")
    .optional(),
  tabPrice: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .typeError("Price per tab must be a number")
    .positive("Price per tab must be positive")
    .required("Price per tab is required"),
  stripPrice: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .typeError("Price per strip must be a number")
    .positive("Price per strip must be positive")
    .required("Price per strip is required"),
  packPrice: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .typeError("Price per pack must be a number")
    .positive("Price per pack must be positive")
    .required("Price per pack is required"),
  status: yup
    .string()
    .oneOf(["inStock", "lowStock", "critical"], "Status must be In stock, Low stock, or Critical")
    .required("Status is required"),
});

export const medicineEditSchema = medicineCreateSchema.shape({
  name: yup.string().min(2).max(100).optional(),
});

export default yupResolver;
