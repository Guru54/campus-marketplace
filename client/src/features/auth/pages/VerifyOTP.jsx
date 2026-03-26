import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { authAPI } from "@/shared/services/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import AuthLayout from "@/features/auth/components/AuthLayout";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  // Auto-focus first box
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Redirect if no email param
  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  const handleInput = (index, value) => {
    if (!/^\d?$/.test(value)) return; // digits only
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authAPI.verifyOTP({ email, otp: code });
      const userData = data.data.user;
      login(userData);
      toast.success("Email verified! Welcome to Rezell 🎉");
      navigate("/");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.register({ email, _resend: true });
      toast.success("OTP resent!");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-indigo-500/15 dark:border-white/10 rounded-2xl p-8 shadow-xl shadow-slate-200/60 dark:shadow-black/30 text-center">

          {/* Logo */}
          <div className="mb-4">
            <Link to="/" className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              re<span className="text-indigo-500 dark:text-indigo-400">zell</span>
            </Link>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <ShieldCheck size={28} className="text-indigo-500" />
            </div>
          </div>

          <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
            Verify your email
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            We sent a 6-digit OTP to{" "}
            <span className="font-semibold text-indigo-500">{email}</span>
          </p>

          <form onSubmit={handleSubmit}>
            {/* OTP Boxes */}
            <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying…</>
              ) : (
                <><ShieldCheck size={16} />Verify Email</>
              )}
            </button>
          </form>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-5">
            Didn&apos;t receive it?{" "}
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-indigo-500 dark:text-indigo-400 hover:underline font-medium disabled:opacity-50"
            >
              {resending ? "Resending…" : "Resend OTP"}
            </button>
          </p>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Wrong email?{" "}
          <Link to="/register" className="text-indigo-500 dark:text-indigo-400 hover:underline font-medium">
            Go back
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
};

export default VerifyOTP;
