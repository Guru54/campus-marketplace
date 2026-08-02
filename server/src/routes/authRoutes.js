const express = require("express");
const router = express.Router();

const {
  register,
  verifyOTP,
  login,
  logout,
  getMe,
  getColleges,
  resendOTP,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { authLimiter, otpLimiter } = require("../middleware/securityMiddleware");

const {
  registerSchema,
  verifyOTPSchema,
  loginSchema,
  resendOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validations/auth.validation");

// ── Public Routes ──────────────────────────────────────────
router.get("/colleges", getColleges);

router.post("/register", authLimiter, validate(registerSchema), register);

router.post("/verify-otp", otpLimiter, validate(verifyOTPSchema), verifyOTP);

router.post("/resend-otp", otpLimiter, validate(resendOTPSchema), resendOTP);

router.post("/login", authLimiter, validate(loginSchema), login);

router.post(
  "/forgot-password",
  otpLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);

router.post(
  "/reset-password",
  otpLimiter,
  validate(resetPasswordSchema),
  resetPassword,
);

router.post("/logout", logout);

// ── Protected Routes ───────────────────────────────────────
router.get("/me", protect, getMe);

module.exports = router;
