import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  authService,
  authStorage,
  type AuthUser,
  type LoginPayload,
  type SendOtpPayload,
  type VerifyOtpPayload,
} from "./auth-service";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "signup";
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
  login: (credentials: LoginPayload) => Promise<void>;
  sendOtp: (payload: SendOtpPayload) => Promise<void>;
  verifyOtpAndSignup: (payload: VerifyOtpPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");

  // Rehydrate auth state from storage on mount
  useEffect(() => {
    const savedToken = authStorage.getToken();
    const savedUser = authStorage.getUser();

    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        setUser(savedUser);
      }
    }
    setIsLoading(false);

    // Listen for session expiry from Axios response interceptor
    const handleSessionExpired = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, []);

  const openAuthModal = useCallback((mode: "login" | "signup" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = useCallback(async (credentials: LoginPayload) => {
    const result = await authService.login(credentials);
    setToken(result.token);
    setUser(result.user);
    setIsAuthModalOpen(false);
  }, []);

  const sendOtp = useCallback(async (payload: SendOtpPayload) => {
    await authService.sendOtp(payload);
  }, []);

  const verifyOtpAndSignup = useCallback(async (payload: VerifyOtpPayload) => {
    const res = await authService.verifyOtpAndSignup(payload);
    if (res.data?.token) {
      setToken(res.data.token);
      authStorage.setToken(res.data.token);
      const u: AuthUser = {
        email: payload.email,
        name: payload.email.split("@")[0] ?? payload.email,
      };
      setUser(u);
      authStorage.setUser(u);
    }
    setIsAuthModalOpen(false);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        sendOtp,
        verifyOtpAndSignup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
