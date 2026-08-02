const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// JWT errors are converted to AppError by errorMiddleware automatically
const protect = asyncHandler(async (req, res, next) => {
  // ── 1. Token lo cookie se ──────────────────────────────
  const token = req.cookies?.token;
  if (!token) return next(new AppError("Not authorized. Please login.", 401));

  // ── 2. Verify token (throws JsonWebTokenError / TokenExpiredError) ──
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // ── 3. User find karo ──────────────────────────────────
  const user = await User.findById(decoded.userId).select(
    "-password -otp -otpExpiry -socketId +passwordChangedAt",
  );
  if (!user)
    return next(new AppError("User not found. Please login again.", 401));

  // ── 4. Verified check ──────────────────────────────────
  if (!user.isVerified)
    return next(new AppError("Please verify your email first.", 401));

  // ── 4b. Banned check ────────────────────────────────────
  if (user.isBanned)
    return next(
      new AppError("This account has been suspended. Contact support.", 403),
    );

  // ── 4c. Token issued before a password change/reset? ───
  if (user.passwordChangedAt) {
    const changedAtSeconds = Math.floor(
      user.passwordChangedAt.getTime() / 1000,
    );
    if (decoded.iat < changedAtSeconds) {
      return next(new AppError("Session expired. Please login again.", 401));
    }
  }
  user.passwordChangedAt = undefined; // don't leak it onto req.user

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
