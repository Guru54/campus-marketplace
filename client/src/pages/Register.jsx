import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus, CheckCircle2 } from "lucide-react";
import API from "../utils/axios";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Password strength
  const getStrength = (pass) => {
    if (!pass) return { label: "", color: "", width: "0%" };
    if (pass.length < 6) return { label: "Weak", color: "bg-red-500", width: "25%" };
    if (pass.length < 8) return { label: "Fair", color: "bg-yellow-500", width: "50%" };
    if (!/[A-Z]/.test(pass) || !/[0-9]/.test(pass))
      return { label: "Good", color: "bg-blue-500", width: "75%" };
    return { label: "Strong", color: "bg-green-500", width: "100%" };
  };

  const strength = getStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      setRegistered(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Success State ──────────────────────────────────────────
  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 shadow-sm">
            <CheckCircle2
              className="text-green-500 mx-auto mb-4"
              size={48}
              strokeWidth={1.5}
            />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Verify your email
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              We sent a verification link to{" "}
              <span className="font-semibold text-indigo-500">{formData.email}</span>.
              <br />
              Click the link to activate your campus account.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              Go to Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Register Form ──────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-white dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            re<span className="text-indigo-500">zell</span>
          </Link>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-white mt-4">
            Join your campus
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create your Rezell account with a college email
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Gurudas Patil"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                College Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@college.edu.in"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              {formData.email.includes("@") && (
                <p className="text-xs text-indigo-400 mt-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                  Campus detected:{" "}
                  <span className="font-semibold">
                    {formData.email.split("@")[1]?.split(".")[0]?.toUpperCase()}
                  </span>
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Bar */}
              {formData.password && (
                <div className="mt-2">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Match Indicator */}
              {formData.confirmPassword && (
                <p
                  className={`text-xs mt-1.5 flex items-center gap-1 ${
                    formData.password === formData.confirmPassword
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      formData.password === formData.confirmPassword
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                  {formData.password === formData.confirmPassword
                    ? "Passwords match"
                    : "Passwords do not match"}
                </p>
              )}
            </div>

            {/* Terms */}
            <p className="text-xs text-slate-400 leading-relaxed">
              By creating an account, you agree to our{" "}
              <span className="text-indigo-400 cursor-pointer hover:underline">
                Terms of Service
              </span>{" "}
              and confirm you are a currently enrolled student.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Create Account
                </>
              )}
            </button>

          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-500 hover:text-indigo-400 font-medium transition"
          >
            Sign in
          </Link>
        </p>

        {/* Trust note */}
        <p className="text-center text-xs text-slate-400 mt-3">
          Campus email required · Verified students only
        </p>

      </motion.div>
    </div>
  );
};

export default Register;