import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, ArrowLeft } from "lucide-react";
import { useForgotPasswordMutation } from "@/shared/hooks/useAuth";
import AuthLayout from "@/features/auth/components/AuthLayout";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const forgotPasswordMutation = useForgotPasswordMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    forgotPasswordMutation.mutate({ email });
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-indigo-500/15 dark:border-white/10 rounded-2xl p-8 shadow-xl shadow-slate-200/60 dark:shadow-black/30">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link to="/" className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              re<span className="text-indigo-500 dark:text-indigo-400">zell</span>
            </Link>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <KeyRound size={26} className="text-indigo-500" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Forgot password?</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter your college email and we'll send you a reset code
            </p>
          </div>

          {submitted ? (
            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                If an account exists for <span className="font-semibold text-indigo-500">{email}</span>,
                a 6-digit reset code is on its way. Check your inbox.
              </p>
              <button
                onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-lg shadow-indigo-500/30 cursor-pointer"
              >
                I have my code
              </button>
              <button
                onClick={() => setSubmitted(false)}
                className="w-full mt-3 text-sm text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  College Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu.in"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 cursor-pointer"
              >
                {forgotPasswordMutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <KeyRound size={16} />
                    Send reset code
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          <Link to="/login" className="inline-flex items-center gap-1 text-indigo-500 dark:text-indigo-400 hover:underline font-medium">
            <ArrowLeft size={14} /> Back to login
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
};

export default ForgotPassword;
