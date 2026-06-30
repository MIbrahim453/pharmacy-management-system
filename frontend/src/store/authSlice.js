import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/axios";

// Async thunk for logging in a user
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", credentials);
      const { userWithRole, token } = response.data.data;

      // Store tokens in localStorage
      localStorage.setItem("accessToken", token.accessToken);
      localStorage.setItem("refreshToken", token.refreshToken);

      // Map backend role (super_admin, admin, staff) to frontend role (super, admin, staff)
      const frontendRole =
        userWithRole.role.name === "super_admin"
          ? "super"
          : userWithRole.role.name;

      const userData = {
        id: userWithRole._id,
        name: userWithRole.name,
        email: userWithRole.email,
        role: frontendRole,
        pharmacyId: userWithRole.pharmacyId?._id || userWithRole.pharmacyId,
        pharmacyName: userWithRole.pharmacyId?.pharmacy_name || "",
        staffRole: userWithRole.staffRole,
      };

      // Store user details in localStorage
      localStorage.setItem("user", JSON.stringify(userData));

      return userData;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to sign in";
      return rejectWithValue(message);
    }
  }
);

// Async thunk for logging out a user
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      return null;
    } catch (error) {
      return rejectWithValue("Failed to log out");
    }
  }
);

// Async thunk for updating user profile
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put("/auth/profile", profileData);
      const updatedUser = response.data.data;

      // Retain existing local values (role, etc.)
      const userStr = localStorage.getItem("user");
      let currentUser = {};
      if (userStr) {
        currentUser = JSON.parse(userStr);
      }

      const userData = {
        ...currentUser,
        name: updatedUser.name,
        email: updatedUser.email,
        pharmacyName: updatedUser.pharmacyId?.pharmacy_name || currentUser.pharmacyName || "",
      };

      // Store updated user details in localStorage
      localStorage.setItem("user", JSON.stringify(userData));

      return userData;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile";
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  user: null,
  loading: true, // starts true to check auth on startup
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    checkAuth: (state) => {
      const token = localStorage.getItem("accessToken");
      const userStr = localStorage.getItem("user");
      if (token && userStr) {
        try {
          state.user = JSON.parse(userStr);
        } catch (e) {
          state.user = null;
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      } else {
        state.user = null;
      }
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.error = null;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { checkAuth, clearError } = authSlice.actions;
export default authSlice.reducer;
