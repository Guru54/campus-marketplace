const express = require("express");
const router  = express.Router();

const {
  register,
  verifyOTP,
  login,
  logout,
  getMe,
  getColleges,
} = require("../controllers/authController");

const { protect }                 = require("../middleware/authMiddleware");
const validate                    = require("../middleware/validate");
const { authLimiter, otpLimiter } = require("../middleware/securityMiddleware");

const {
  registerSchema,
  verifyOTPSchema,
  loginSchema,
} = require("../validations/auth.validation");

// ── Public Routes ──────────────────────────────────────────
router.get("/colleges", getColleges);

router.post("/register",
  authLimiter,
  validate(registerSchema),
  register
);

router.post("/verify-otp",
  otpLimiter,
  validate(verifyOTPSchema),
  verifyOTP
);

router.post("/login",
  authLimiter,
  validate(loginSchema),
  login
);

router.post("/logout", logout);

// ── Protected Routes ───────────────────────────────────────
router.get("/me", protect, getMe);

module.exports = router;