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
    return sendResponse(res, 200, { email: req.body.email }, "OTP resent. Please verify your email.");

  sendResponse(res, 201, { userId: result.userId, email: req.body.email },
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
// ─────────────────────────────────────────────────────────────
// @route   GET /api/v1/auth/colleges
// @access  Public
// ─────────────────────────────────────────────────────────────
const College = require("../models/College");
const getColleges = asyncHandler(async (req, res) => {
  // 1. Get query parameters with defaults
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";

  // 2. Build the query object
  const query = { isActive: true };
  if (search) {
    // Basic fuzzy search using case-insensitive regex
    query.name = { $regex: search, $options: "i" };
  }

  // 3. Execute query with skip, limit, and lean
  const skip = (page - 1) * limit;
  
  const [colleges, totalColleges] = await Promise.all([
    College.find(query)
      .select("_id name city state domain")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    College.countDocuments(query) // Get total for frontend pagination
  ]);

  sendResponse(res, 200, {
    colleges,
    pagination: {
      total: totalColleges,
      page,
      pages: Math.ceil(totalColleges / limit)
    }
  });
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

module.exports = { register, verifyOTP, login, logout, getMe, getColleges };
