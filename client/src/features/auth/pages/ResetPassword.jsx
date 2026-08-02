import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useResetPasswordMutation, useForgotPasswordMutation } from "@/shared/hooks/useAuth";
import AuthLayout from "@/features/auth/components/AuthLayout";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (!email) navigate("/forgot-password");
  }, [email, navigate]);

  const resetPasswordMutation = useResetPasswordMutation();
  const forgotPasswordMutation = useForgotPasswordMutation();

  const handleInput = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    resetPasswordMutation.mutate({
      email,
      otp: otp.join(""),
      newPassword,
      confirmPassword,
    });
  };

  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-indigo-500/15 dark:border-white/10 rounded-2xl p-8 shadow-xl shadow-slate-200/60 dark:shadow-black/30">
          <div className="text-center mb-4">
            <Link to="/" className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              re<span className="text-indigo-500 dark:text-indigo-400">zell</span>
            </Link>
          </div>

          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <ShieldCheck size={26} className="text-indigo-500" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Reset your password</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Enter the 6-digit code sent to{" "}
              <span className="font-semibold text-indigo-500">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* OTP boxes */}
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInput(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-12 text-center text-lg font-bold rounded-lg border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              {passwordsMismatch && (
                <p className="text-xs text-red-500 mt-1.5">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={resetPasswordMutation.isPending || passwordsMismatch}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 cursor-pointer"
            >
              {resetPasswordMutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Reset Password
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-5 text-center">
            Didn&apos;t get a code?{" "}
            <button
              onClick={() => forgotPasswordMutation.mutate({ email })}
              disabled={forgotPasswordMutation.isPending}
              className="text-indigo-500 dark:text-indigo-400 hover:underline font-medium disabled:opacity-50 cursor-pointer"
            >
              {forgotPasswordMutation.isPending ? "Sending…" : "Resend code"}
            </button>
          </p>
        </div>
      </motion.div>
    </AuthLayout>
  );
};

export default ResetPassword;
