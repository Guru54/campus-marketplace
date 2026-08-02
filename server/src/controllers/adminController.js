const adminService = require("../services/admin.service");
const listingService = require("../services/listing.service");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");

// ─────────────────────────────────────────────────────────────
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────
const getUsers = asyncHandler(async (req, res) => {
  const result = await adminService.getUsers(req.query);
  sendResponse(res, 200, result);
});

// ─────────────────────────────────────────────────────────────
// @route   PATCH /api/v1/admin/users/:id/ban
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────
const banUser = asyncHandler(async (req, res) => {
  const user = await adminService.setBanStatus(
    req.params.id,
    true,
    req.body.reason,
    req.user,
    req.ip,
  );
  sendResponse(res, 200, { user }, "User banned");
});

// ─────────────────────────────────────────────────────────────
// @route   PATCH /api/v1/admin/users/:id/unban
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────
const unbanUser = asyncHandler(async (req, res) => {
  const user = await adminService.setBanStatus(
    req.params.id,
    false,
    null,
    req.user,
    req.ip,
  );
  sendResponse(res, 200, { user }, "User unbanned");
});

// ─────────────────────────────────────────────────────────────
// @route   GET /api/v1/admin/listings
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────
const getListings = asyncHandler(async (req, res) => {
  const result = await adminService.getListings(req.query);
  sendResponse(res, 200, result);
});

// ─────────────────────────────────────────────────────────────
// @route   DELETE /api/v1/admin/listings/:id
// @access  Private (Admin)
// Reuses listingService.deleteListing, which already grants ADMIN
// a platform-wide (cross-college) override.
// ─────────────────────────────────────────────────────────────
const deleteListing = asyncHandler(async (req, res) => {
  await listingService.deleteListing(req.params.id, req.user, req.ip);
  sendResponse(res, 200, null, "Listing removed");
});

// ─────────────────────────────────────────────────────────────
// @route   GET /api/v1/admin/audit-logs
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────
const getAuditLogs = asyncHandler(async (req, res) => {
  const result = await adminService.getAuditLogs(req.query);
  sendResponse(res, 200, result);
});

module.exports = {
  getUsers,
  banUser,
  unbanUser,
  getListings,
  deleteListing,
  getAuditLogs,
};
