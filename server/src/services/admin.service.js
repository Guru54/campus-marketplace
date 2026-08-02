const User = require("../models/User");
const Listing = require("../models/Listing");
const AuditLog = require("../models/AuditLog");
const AppError = require("../utils/AppError");
const paginate = require("../utils/paginate");

// ─────────────────────────────────────────────────────────────
// List users — platform-wide, filterable by college/role/banned
// ─────────────────────────────────────────────────────────────
const getUsers = async (query) => {
  const { skip, limit, page } = paginate(query.page, query.limit);

  const filter = {};
  if (query.college) filter.college = query.college;
  if (query.role) filter.role = query.role;
  if (query.isBanned !== undefined) filter.isBanned = query.isBanned === "true";

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(
        "firstName lastName email role college isBanned isVerified createdAt",
      )
      .populate("college", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ─────────────────────────────────────────────────────────────
// Ban / unban a user. Admins can't ban themselves or other admins
// (prevents lockout and privilege-escalation abuse via a compromised
// admin account).
// ─────────────────────────────────────────────────────────────
const setBanStatus = async (targetUserId, isBanned, reason, adminUser, ip) => {
  if (targetUserId === adminUser._id.toString())
    throw new AppError("You cannot ban your own account", 400);

  const target = await User.findById(targetUserId);
  if (!target) throw new AppError("User not found", 404);
  if (target.role === "ADMIN")
    throw new AppError("Admins cannot ban other admins", 403);

  target.isBanned = isBanned;
  target.bannedReason = isBanned ? reason || "No reason provided" : null;
  await target.save();

  await AuditLog.create({
    action: isBanned ? "USER_BANNED" : "USER_UNBANNED",
    user: adminUser._id,
    ip,
    meta: { targetUserId },
  });

  return target;
};

// ─────────────────────────────────────────────────────────────
// List listings — platform-wide, filterable by status/college,
// for moderation (unlike the public feed, this includes all
// statuses and colleges).
// ─────────────────────────────────────────────────────────────
const getListings = async (query) => {
  const { skip, limit, page } = paginate(query.page, query.limit);

  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.college) filter.college = query.college;

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .select("title price status category seller college createdAt")
      .populate("seller", "firstName lastName email")
      .populate("college", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Listing.countDocuments(filter),
  ]);

  return {
    listings,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ─────────────────────────────────────────────────────────────
// Audit log — platform-wide, filterable by action/user
// ─────────────────────────────────────────────────────────────
const getAuditLogs = async (query) => {
  const { skip, limit, page } = paginate(query.page, query.limit);

  const filter = {};
  if (query.action) filter.action = query.action;
  if (query.userId) filter.user = query.userId;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

module.exports = { getUsers, setBanStatus, getListings, getAuditLogs };
