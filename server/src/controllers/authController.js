const authService  = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");

// ── Cookie Options ─────────────────────────────────────────
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/v1/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body, req.ip);

  if (result.resent)
    return sendResponse(res, 200, null, "OTP resent. Please verify your email.");

  sendResponse(res, 201, { userId: result.userId },
    "Registration successful. Please verify your email.");
});

// ─────────────────────────────────────────────────────────────
// @route   POST /api/v1/auth/verify-otp
// @access  Public
// ─────────────────────────────────────────────────────────────
const verifyOTP = asyncHandler(async (req, res) => {
  const { token, user } = await authService.verifyOTP(req.body, req.ip);
  res.cookie("token", token, COOKIE_OPTIONS);
  sendResponse(res, 200, { user }, "Email verified successfully");
});

// ─────────────────────────────────────────────────────────────
// @route   POST /api/v1/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { token, user } = await authService.login(req.body, req.ip);
  res.cookie("token", token, COOKIE_OPTIONS);
  sendResponse(res, 200, { user }, "Login successful");
});

// ─────────────────────────────────────────────────────────────
// @route   POST /api/v1/auth/logout
// @access  Public
// ─────────────────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  sendResponse(res, 200, null, "Logged out successfully");
});

// ─────────────────────────────────────────────────────────────
// @route   GET /api/v1/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const { _id, firstName, lastName, email, role, college,
          avatar, avatarUrl, isOnline, lastSeen, createdAt } = req.user;

  sendResponse(res, 200, {
    user: { _id, firstName, lastName, email, role, college,
            avatar, avatarUrl, isOnline, lastSeen, createdAt },
  });
});

module.exports = { register, verifyOTP, login, logout, getMe };
