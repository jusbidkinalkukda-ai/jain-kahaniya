import apiClient, { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "./api";

export interface AuthUser {
  id?: string | undefined;
  name?: string | undefined;
  email: string;
  role?: string | undefined;
}

export interface SendOtpPayload {
  name: string;
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface LoginResponseData {
  token: string;
  user?: Partial<AuthUser>;
}

/**
 * Safely decodes the payload of a JWT token
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Token and user storage helpers
 */
export const authStorage = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  setToken(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },

  removeToken() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  },

  getUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setUser(user: AuthUser) {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },

  removeUser() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  clear() {
    this.removeToken();
    this.removeUser();
  },
};

/**
 * Auth API Service methods
 */
export const authService = {
  /**
   * Send OTP for signup
   * POST /api/public/send-otp
   */
  async sendOtp(payload: SendOtpPayload): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>("/api/public/send-otp", payload);
    return res.data;
  },

  /**
   * Verify OTP and complete signup
   * POST /api/public/signup
   */
  async verifyOtpAndSignup(payload: VerifyOtpPayload): Promise<ApiResponse<{ token?: string }>> {
    const res = await apiClient.post<ApiResponse<{ token?: string }>>(
      "/api/public/signup",
      payload,
    );
    return res.data;
  },

  /**
   * Login with email and password
   * POST /api/user/login
   */
  async login(payload: LoginPayload): Promise<{ token: string; user: AuthUser }> {
    const res = await apiClient.post<ApiResponse<LoginResponseData>>("/api/user/login", payload);
    const data = res.data?.data;
    const token = data?.token;

    if (!token) {
      throw new Error(res.data?.error || "लॉग इन विफल रहा (Login failed: no token received)");
    }

    const decoded = decodeJwtPayload(token);
    const decodedId = typeof decoded?.["id"] === "string" ? decoded["id"] : undefined;
    const decodedRole = typeof decoded?.["role"] === "string" ? decoded["role"] : undefined;

    const user: AuthUser = {
      id: decodedId || data?.user?.id,
      email: payload.email,
      name: data?.user?.name || payload.email.split("@")[0],
      role: decodedRole || data?.user?.role || "user",
    };

    authStorage.setToken(token);
    authStorage.setUser(user);

    return { token, user };
  },

  /**
   * Logout user
   */
  logout() {
    authStorage.clear();
  },
};
