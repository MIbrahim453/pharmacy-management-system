import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:3000/api/v1";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request Error ::", error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }
        const res = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });
        if (res && res.data && res.data.data.accessToken) {
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          const originalRequest = error.config;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return await api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
