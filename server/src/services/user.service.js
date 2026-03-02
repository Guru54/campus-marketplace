const bcrypt   = require("bcryptjs");
const User     = require("../models/User");
const AppError = require("../utils/AppError");

// ─────────────────────────────────────────────────────────────
// Get public profile of any user (college-scoped)
// ─────────────────────────────────────────────────────────────
const getProfile = async (userId, requestingUser) => {
  const user = await User.findOne({
    _id:     userId,
    college: requestingUser.college, // college-scoped: only same college
  })
    .select("firstName lastName avatarUrl isOnline lastSeen createdAt college role")
    .populate("college", "name city state")
    .lean({ virtuals: true });

  if (!user) throw new AppError("User not found", 404);
  return user;
};

// ─────────────────────────────────────────────────────────────
// Update own profile (name + avatar)
// ─────────────────────────────────────────────────────────────
const updateProfile = async (data, userId) => {
  const { firstName, lastName, avatar } = data;

  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  if (firstName) user.firstName = firstName;
  if (lastName)  user.lastName  = lastName;
  if (avatar)    user.avatar    = avatar;

  await user.save();
  return user;
};

// ─────────────────────────────────────────────────────────────
// Change password
// ─────────────────────────────────────────────────────────────
const changePassword = async (data, userId) => {
  const { currentPassword, newPassword } = data;

  const user = await User.findById(userId).select("+password");
  if (!user) throw new AppError("User not found", 404);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new AppError("Current password is incorrect", 401);

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
};

module.exports = { getProfile, updateProfile, changePassword };
