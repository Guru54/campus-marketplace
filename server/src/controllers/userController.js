const userService  = require("../services/user.service");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");

// ─────────────────────────────────────────────────────────────
// @route   GET /api/v1/users/profile/:id
// @access  Private (same college)
// ─────────────────────────────────────────────────────────────
const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.params.id, req.user);
  sendResponse(res, 200, { user });
});

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/v1/users/profile
// @access  Private
// ─────────────────────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.body, req.user._id);
  sendResponse(res, 200, {
    user: {
      _id:       user._id,
      firstName: user.firstName,
      lastName:  user.lastName,
      avatar:    user.avatar,
      avatarUrl: user.avatarUrl,
    },
  }, "Profile updated successfully");
});

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/v1/users/change-password
// @access  Private
// ─────────────────────────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  await userService.changePassword(req.body, req.user._id);
  sendResponse(res, 200, null, "Password changed successfully");
});

module.exports = { getProfile, updateProfile, changePassword };
