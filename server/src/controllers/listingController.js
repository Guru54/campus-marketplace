const listingService = require("../services/listing.service");
const asyncHandler   = require("../utils/asyncHandler");
const sendResponse   = require("../utils/sendResponse");

// ─────────────────────────────────────────────────────────────
// @route   GET /api/v1/listings
// @access  Private (college-scoped)
// ─────────────────────────────────────────────────────────────
const getListings = asyncHandler(async (req, res) => {
  const result = await listingService.getListings(req.query, req.user.college);
  sendResponse(res, 200, result);
});

// ─────────────────────────────────────────────────────────────
// @route   GET /api/v1/listings/my
// @access  Private
// ─────────────────────────────────────────────────────────────
const getMyListings = asyncHandler(async (req, res) => {
  const result = await listingService.getMyListings(req.query, req.user);
  sendResponse(res, 200, result);
});

// ─────────────────────────────────────────────────────────────
// @route   GET /api/v1/listings/:id
// @access  Private (college-scoped)
// ─────────────────────────────────────────────────────────────
const getListingById = asyncHandler(async (req, res) => {
  const listing = await listingService.getListingById(req.params.id, req.user.college);
  sendResponse(res, 200, { listing });
});

// ─────────────────────────────────────────────────────────────
// @route   POST /api/v1/listings
// @access  Private
// ─────────────────────────────────────────────────────────────
const createListing = asyncHandler(async (req, res) => {
  const listing = await listingService.createListing(req.body, req.user, req.ip);
  sendResponse(res, 201, { listing }, "Listing created successfully");
});

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/v1/listings/:id
// @access  Private (owner only)
// ─────────────────────────────────────────────────────────────
const updateListing = asyncHandler(async (req, res) => {
  const listing = await listingService.updateListing(req.params.id, req.body, req.user);
  sendResponse(res, 200, { listing }, "Listing updated successfully");
});

// ─────────────────────────────────────────────────────────────
// @route   DELETE /api/v1/listings/:id
// @access  Private (owner or admin)
// ─────────────────────────────────────────────────────────────
const deleteListing = asyncHandler(async (req, res) => {
  await listingService.deleteListing(req.params.id, req.user, req.ip);
  sendResponse(res, 200, null, "Listing deleted successfully");
});

module.exports = {
  getListings,
  getMyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
};
