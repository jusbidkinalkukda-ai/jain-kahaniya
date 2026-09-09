import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

export const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] || "http://192.168.0.237:3000";

export const TOKEN_STORAGE_KEY = "jain_auth_token";
export const USER_STORAGE_KEY = "jain_auth_user";

// Create custom Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Attach JWT Bearer token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        const headerValue = `Bearer ${token}`;
        if (config.headers && typeof config.headers.set === "function") {
          config.headers.set("Authorization", headerValue);
        } else {
          config.headers = config.headers ?? {};
          config.headers.Authorization = headerValue;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor: Handle responses and normalize errors / 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ success?: boolean; error?: string; message?: string }>) => {
    if (typeof window !== "undefined") {
      if (error.response?.status === 401) {
        const hadToken = !!localStorage.getItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);

        // Dispatch a custom window event for reactive logout handling across listeners
        if (hadToken) {
          window.dispatchEvent(new CustomEvent("auth:session-expired"));
        }
      }
    }

    // Extract user-friendly error message from API response
    const backendMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      (error.message === "Network Error"
        ? "सर्वर से संपर्क नहीं हो सका (Network Error)"
        : error.message) ||
      "अनपेक्षित त्रुटि हुई (An unexpected error occurred)";

    const enhancedError = new Error(backendMessage) as Error & {
      statusCode?: number | undefined;
      originalError?: AxiosError | undefined;
    };
    enhancedError.statusCode = error.response?.status;
    enhancedError.originalError = error;

    return Promise.reject(enhancedError);
  },
);

export default apiClient;
