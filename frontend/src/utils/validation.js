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
export default yupResolver;
