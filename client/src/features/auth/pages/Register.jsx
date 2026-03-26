import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useRegisterMutation } from "@/shared/hooks/useAuth";
import { useCollegesQuery } from "@/shared/hooks/useQuery";
import { useForm, validators, composeValidators } from "@/shared/hooks/useForm";
import { notify } from "@/shared/services/notify";
import AuthLayout from "@/features/auth/components/AuthLayout";
import CollegeDropdown from "@/shared/components/CollegeDropdown";
import { FormSkeleton } from "@/shared/components/skeletons";

const Register = () => {
   const { data: colleges = [], isLoading: collegesLoading } = useCollegesQuery();

  const registerMutation = useRegisterMutation();

  const validateForm = (field, value) => {
    const validations = {
      firstName: composeValidators(
        (v) => validators.required(v, "First name"),
        (v) => validators.minLength(v, 2, "First name")
      ),
      lastName: composeValidators(
        (v) => validators.required(v, "Last name"),
        (v) => validators.minLength(v, 2, "Last name")
      ),
      email: validators.email,
      password: (v) => validators.password(v, 6),
      confirmPassword: (v) => validators.required(v, "Confirm password"),
      collegeId: (v) => validators.required(v, "College"),
    };

    return validations[field]?.(value) || null;
  };

  const form = useForm(
    {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      collegeId: "",
    },
    async (values) => {
      if (values.password !== values.confirmPassword) {
        notify.error("Passwords do not match");
        return;
      }
      registerMutation.mutate(values);
    },
    validateForm
  );

  const getStrength = (pass) => {
    if (!pass) return { label: "", color: "", width: "0%" };
    if (pass.length < 6) return { label: "Weak", color: "bg-red-500", width: "25%" };
    if (pass.length < 8) return { label: "Fair", color: "bg-yellow-500", width: "50%" };
    if (!/[A-Z]/.test(pass) || !/[0-9]/.test(pass))
      return { label: "Good", color: "bg-blue-500", width: "75%" };
    return { label: "Strong", color: "bg-green-500", width: "100%" };
  };

  const strength = getStrength(form.values.password);

  return collegesLoading ? (
    <AuthLayout><FormSkeleton /></AuthLayout>
  ) : (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl mt-20 border border-indigo-500/15 dark:border-white/10 rounded-2xl p-8 shadow-xl shadow-slate-200/60 dark:shadow-black/30">

          <div className="text-center mb-6">
            <Link to="/" className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              re<span className="text-indigo-500 dark:text-indigo-400">zell</span>
            </Link>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Join your campus</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Create your Rezell account with a college email
            </p>
          </div>

          <form onSubmit={form.handleSubmit} className="space-y-5">

            {/* First + Last Name */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
                <input
                  {...form.getFieldProps("firstName")}
                  type="text" placeholder="Aarav"
                  className={`w-full px-4 py-2.5 rounded-lg border ${form.getFieldMeta("firstName").isError ? "border-red-500" : "border-slate-200 dark:border-white/15"} bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                />
                {form.getFieldMeta("firstName").isError && <p className="text-red-500 text-xs mt-1">{form.errors.firstName}</p>}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
                <input
                  {...form.getFieldProps("lastName")}
                  type="text" placeholder="Shah"
                  className={`w-full px-4 py-2.5 rounded-lg border ${form.getFieldMeta("lastName").isError ? "border-red-500" : "border-slate-200 dark:border-white/15"} bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                />
                {form.getFieldMeta("lastName").isError && <p className="text-red-500 text-xs mt-1">{form.errors.lastName}</p>}
              </div>
            </div>

            {/* College */}
<div>
  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
    College
  </label>
  <CollegeDropdown
    colleges={colleges}
    {...form.getFieldProps("collegeId")}
  />
  {form.getFieldMeta("collegeId").isError && <p className="text-red-500 text-xs mt-1">{form.errors.collegeId}</p>}
</div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">College Email</label>
              <input
                {...form.getFieldProps("email")}
                type="email" placeholder="you@college.edu.in"
                className={`w-full px-4 py-2.5 rounded-lg border ${form.getFieldMeta("email").isError ? "border-red-500" : "border-slate-200 dark:border-white/15"} bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
              />
              {form.getFieldMeta("email").isError ? (
                <p className="text-red-500 text-xs mt-1">{form.errors.email}</p>
              ) : form.values.email.includes("@") && (
                <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                  Campus: <span className="font-semibold">{form.values.email.split("@")[1]?.split(".")[0]?.toUpperCase()}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...form.getFieldProps("password")}
                  type={form.touched.password ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  className={`w-full px-4 py-2.5 rounded-lg border ${form.getFieldMeta("password").isError ? "border-red-500" : "border-slate-200 dark:border-white/15"} bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition pr-10`}
                />
              </div>
              {form.getFieldMeta("password").isError && <p className="text-red-500 text-xs mt-1">{form.errors.password}</p>}
              {form.values.password && !form.errors.password && (
                <div className="mt-2">
                  <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1">
                    <div className={`h-1 rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  {...form.getFieldProps("confirmPassword")}
                  type={"password"}
                  placeholder="Re-enter your password"
                  className={`w-full px-4 py-2.5 rounded-lg border ${form.getFieldMeta("confirmPassword").isError ? "border-red-500" : "border-slate-200 dark:border-white/15"} bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition pr-10`}
                />
              </div>
              {form.getFieldMeta("confirmPassword").isError && <p className="text-red-500 text-xs mt-1">{form.errors.confirmPassword}</p>}
              {form.values.confirmPassword && !form.errors.confirmPassword && (
                <p className={`text-xs mt-1.5 flex items-center gap-1 ${form.values.password === form.values.confirmPassword ? "text-green-500" : "text-red-500"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${form.values.password === form.values.confirmPassword ? "bg-green-500" : "bg-red-500"}`} />
                  {form.values.password === form.values.confirmPassword ? "Passwords match" : "Passwords do not match"}
                </p>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              By creating an account, you agree to our{" "}
              <span className="text-indigo-500 dark:text-indigo-400 cursor-pointer hover:underline">Terms of Service</span>{" "}
              and confirm you are a currently enrolled student.
            </p>

            <button type="submit" disabled={registerMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 cursor-pointer">
              {registerMutation.isPending ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account…</>
              ) : (
                <><UserPlus size={16} />Create Account</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-400 dark:hover:text-indigo-300 font-medium transition">Sign in</Link>
        </p>
        <p className="text-center text-xs text-slate-400 mt-2">Campus email required · Verified students only</p>
      </motion.div>
    </AuthLayout>
  );
};

export default Register;
