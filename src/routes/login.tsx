import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { PageHead } from "@/components/SiteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "लॉग इन / पंजीकरण — जैन कहानियाँ वाचनालय" },
      {
        name: "description",
        content: "जैन कहानियाँ वाचनालय में लॉग इन करें या नया खाता बनाएँ।",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, isAuthenticated, login, sendOtp, verifyOtpAndSignup, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [signupStep, setSignupStep] = useState<"details" | "otp">("details");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupOtp, setSignupOtp] = useState("");

  // Loading & error state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resend OTP timer
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage("कृपया ईमेल और पासवर्ड दोनों दर्ज करें।");
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email: loginEmail.trim(), password: loginPassword });
      toast.success("सफलतापूर्वक लॉग इन किया गया! स्वागत है।");
      navigate({ to: "/sangrah" });
    } catch (err: unknown) {
      const msg =
        (err instanceof Error ? err.message : null) || "लॉग इन विफल रहा। कृपया विवरण जांचें।";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMessage("कृपया नाम, ईमेल और पासवर्ड भरें।");
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMessage("पासवर्ड कम से कम ६ अक्षरों का होना चाहिए।");
      return;
    }

    try {
      setIsSubmitting(true);
      await sendOtp({
        name: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
      });
      toast.success("सत्यापन कोड (OTP) आपके ईमेल पर भेज दिया गया है।");
      setSignupStep("otp");
      setResendTimer(60);
    } catch (err: unknown) {
      const msg = (err instanceof Error ? err.message : null) || "ओटीपी भेजने में त्रुटि हुई।";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signupOtp || signupOtp.length < 6) {
      setErrorMessage("कृपया ६ अंकों का वैध ओटीपी दर्ज करें।");
      return;
    }

    try {
      setIsSubmitting(true);
      await verifyOtpAndSignup({
        email: signupEmail.trim(),
        otp: signupOtp.trim(),
      });
      toast.success("खाता सफलतापूर्वक बनाया गया!");
      navigate({ to: "/sangrah" });
    } catch (err: unknown) {
      const msg =
        (err instanceof Error ? err.message : null) || "ओटीपी अमान्य है या समय समाप्त हो गया है।";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isSubmitting) return;
    setErrorMessage(null);
    try {
      setIsSubmitting(true);
      await sendOtp({
        name: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
      });
      toast.success("नया ओटीपी भेज दिया गया है।");
      setResendTimer(60);
    } catch (err: unknown) {
      const msg = (err instanceof Error ? err.message : null) || "ओटीपी पुनः भेजने में त्रुटि हुई।";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="mx-auto max-w-lg px-5 pt-16 pb-24 text-center">
        <div className="card-leaf p-8 space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-display">
            {user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
          </div>
          <div className="space-y-1">
            <h2 className="font-display text-2xl text-foreground">{user.name || "प्रिय पाठक"}</h2>
            <p className="text-sm text-ink-soft">{user.email}</p>
            {user.role && (
              <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs text-ink-soft mt-2">
                भूमिका: {user.role}
              </span>
            )}
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Link
              to="/sangrah"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              मेरा संग्रह देखें
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                toast.info("सफलतापूर्वक लॉग आउट किया गया।");
              }}
              className="rounded-full text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              लॉग आउट करें
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHead
        eyebrow="प्रवेश एवं पंजीकरण"
        title="जैन वाचनालय खाता"
        latin="Pravesh & Panjikaran"
        intro="अपनी सहेजी कथाएँ, श्रवण इतिहास एवं प्रश्नोत्तरी प्रगति को सुरक्षित रखने के लिए लॉग इन करें।"
      />

      <div className="mx-auto max-w-md px-5 pt-10 pb-20">
        <div className="card-leaf p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <p className="eyebrow">वाचनालय सदस्यता</p>
          </div>

          {/* Mode Switcher */}
          {signupStep === "details" && (
            <div className="flex rounded-lg bg-muted/60 p-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setErrorMessage(null);
                }}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  activeTab === "login"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-ink-soft hover:text-foreground"
                }`}
              >
                लॉग इन
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signup");
                  setErrorMessage(null);
                }}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  activeTab === "signup"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-ink-soft hover:text-foreground"
                }`}
              >
                नया पंजीकरण
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
              <span className="font-bold">✕</span>
              <p>{errorMessage}</p>
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">ईमेल (Email)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-ink-soft" />
                  <Input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="pl-9 bg-background border-input text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">पासवर्ड (Password)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-ink-soft" />
                  <Input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 pr-9 bg-background border-input text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-ink-soft hover:text-foreground"
                    aria-label={showLoginPassword ? "पासवर्ड छिपाएँ" : "पासवर्ड दिखाएँ"}
                  >
                    {showLoginPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail("testingg@gmail.com");
                    setLoginPassword("12345678");
                  }}
                  className="text-xs text-primary/80 hover:text-primary hover:underline flex items-center gap-1"
                >
                  <KeyRound className="h-3 w-3" />
                  परीक्षण क्रेडेंशियल्स भरें (Fill Demo: testingg@gmail.com)
                </button>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 text-sm font-medium mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    लॉग इन हो रहा है...
                  </>
                ) : (
                  <>
                    लॉग इन करें
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* SIGNUP FORM - STEP 1 */}
          {activeTab === "signup" && signupStep === "details" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">पूरा नाम (Full Name)</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-ink-soft" />
                  <Input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="आपका नाम"
                    className="pl-9 bg-background border-input text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">ईमेल (Email)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-ink-soft" />
                  <Input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="pl-9 bg-background border-input text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">पासवर्ड (Password)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-ink-soft" />
                  <Input
                    type={showSignupPassword ? "text" : "password"}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="कम से कम ६ अक्षर"
                    className="pl-9 pr-9 bg-background border-input text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-2.5 text-ink-soft hover:text-foreground"
                    aria-label={showSignupPassword ? "पासवर्ड छिपाएँ" : "पासवर्ड दिखाएँ"}
                  >
                    {showSignupPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 text-sm font-medium mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ओटीपी भेजा जा रहा है...
                  </>
                ) : (
                  <>
                    ओटीपी प्राप्त करें
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* SIGNUP FORM - STEP 2 */}
          {activeTab === "signup" && signupStep === "otp" && (
            <form onSubmit={handleVerifyOtpAndSignup} className="space-y-5">
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">सत्यापन कोड (OTP) दर्ज करें</p>
                <p className="text-xs text-ink-soft">
                  कोड <span className="font-mono text-foreground">{signupEmail}</span> पर भेजा गया
                  है।
                </p>
              </div>

              <div className="flex justify-center">
                <InputOTP maxLength={6} value={signupOtp} onChange={(val) => setSignupOtp(val)}>
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot
                      index={0}
                      className="rounded-md border h-11 w-11 text-base bg-background font-mono"
                    />
                    <InputOTPSlot
                      index={1}
                      className="rounded-md border h-11 w-11 text-base bg-background font-mono"
                    />
                    <InputOTPSlot
                      index={2}
                      className="rounded-md border h-11 w-11 text-base bg-background font-mono"
                    />
                    <InputOTPSlot
                      index={3}
                      className="rounded-md border h-11 w-11 text-base bg-background font-mono"
                    />
                    <InputOTPSlot
                      index={4}
                      className="rounded-md border h-11 w-11 text-base bg-background font-mono"
                    />
                    <InputOTPSlot
                      index={5}
                      className="rounded-md border h-11 w-11 text-base bg-background font-mono"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="flex items-center justify-between text-xs text-ink-soft">
                <button
                  type="button"
                  onClick={() => setSignupStep("details")}
                  className="hover:text-foreground flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  ईमेल बदलें
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0 || isSubmitting}
                  onClick={handleResendOtp}
                  className={`${
                    resendTimer > 0
                      ? "opacity-50 cursor-not-allowed"
                      : "text-primary hover:underline"
                  }`}
                >
                  {resendTimer > 0 ? `पुनः भेजें (${resendTimer}s)` : "ओटीपी पुनः भेजें"}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || signupOtp.length < 6}
                className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 text-sm font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    सत्यापित किया जा रहा है...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    सत्यापित करें एवं खाता बनाएँ
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
