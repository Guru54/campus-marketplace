const jwt          = require("jsonwebtoken");
const User         = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError     = require("../utils/AppError");

// JWT errors are converted to AppError by errorMiddleware automatically
const protect = asyncHandler(async (req, res, next) => {
  // ── 1. Token lo cookie se ──────────────────────────────
  const token = req.cookies?.token;
  if (!token) return next(new AppError("Not authorized. Please login.", 401));

  // ── 2. Verify token (throws JsonWebTokenError / TokenExpiredError) ──
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // ── 3. User find karo ──────────────────────────────────
  const user = await User.findById(decoded.userId).select(
    "-password -otp -otpExpiry -socketId"
  );
  if (!user) return next(new AppError("User not found. Please login again.", 401));

  // ── 4. Verified check ──────────────────────────────────
  if (!user.isVerified)
    return next(new AppError("Please verify your email first.", 401));

  // ── 5. req.user set karo ───────────────────────────────
  req.user = user;
  next();
});

// ── Admin Only ─────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "ADMIN")
    return next(new AppError("Access denied. Admins only.", 403));
  next();
};

module.exports = { protect, adminOnly };