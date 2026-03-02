const Listing      = require("../models/Listing");
const AuditLog     = require("../models/AuditLog");
const AppError     = require("../utils/AppError");
const paginate     = require("../utils/paginate");

// ── Sort map ───────────────────────────────────────────────
const SORT_MAP = {
  newest:     { createdAt: -1 },
  oldest:     { createdAt:  1 },
  price_asc:  { price:      1 },
  price_desc: { price:     -1 },
};

// ─────────────────────────────────────────────────────────────
// Get Listings — college-scoped feed with filters + pagination
// ─────────────────────────────────────────────────────────────
const getListings = async (query, collegeId) => {
  const {
    page, limit, category, condition,
    minPrice, maxPrice, search, sort,
  } = query;

  const { skip, limit: lim, page: pg } = paginate(page, limit);

  // ── Build filter ─────────────────────────────────────────
  const filter = {
    college: collegeId,
    status:  "ACTIVE",
  };

  if (category)  filter.category  = category;
  if (condition) filter.condition = condition;

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  if (search) filter.$text = { $search: search };

  // ── Query ────────────────────────────────────────────────
  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .select("title price images category condition isNegotiable isFree seller createdAt")
      .populate("seller", "firstName lastName avatarUrl")
      .sort(SORT_MAP[sort] || SORT_MAP.newest)
      .skip(skip)
      .limit(lim)
      .lean({ virtuals: true }),

    Listing.countDocuments(filter),
  ]);

  return {
    listings,
    pagination: {
      total,
      page:       pg,
      limit:      lim,
      totalPages: Math.ceil(total / lim),
      hasNext:    pg < Math.ceil(total / lim),
      hasPrev:    pg > 1,
    },
  };
};

// ─────────────────────────────────────────────────────────────
// Get Single Listing + increment views
// ─────────────────────────────────────────────────────────────
const getListingById = async (listingId, collegeId) => {
  const listing = await Listing.findOne({ _id: listingId, college: collegeId })
    .populate("seller", "firstName lastName avatarUrl isOnline lastSeen college")
    .populate("college", "name city state");

  if (!listing) throw new AppError("Listing not found", 404);

  // Increment views (fire-and-forget — don't block response)
  Listing.findByIdAndUpdate(listingId, { $inc: { views: 1 } }).exec();

  return listing;
};

// ─────────────────────────────────────────────────────────────
// Create Listing
// ─────────────────────────────────────────────────────────────
const createListing = async (data, user, ip) => {
  const listing = await Listing.create({
    ...data,
    seller:  user._id,
    college: user.college,
  });

  await AuditLog.create({ action: "CREATE_LISTING", user: user._id, ip });

  return listing;
};

// ─────────────────────────────────────────────────────────────
// Update Listing — only owner can update
// ─────────────────────────────────────────────────────────────
const updateListing = async (listingId, data, user) => {
  const listing = await Listing.findOne({ _id: listingId, college: user.college });

  if (!listing) throw new AppError("Listing not found", 404);

  if (listing.seller.toString() !== user._id.toString())
    throw new AppError("You are not authorized to edit this listing", 403);

  Object.assign(listing, data);
  await listing.save();

  return listing;
};

// ─────────────────────────────────────────────────────────────
// Delete Listing — soft delete (status = EXPIRED)
// ─────────────────────────────────────────────────────────────
const deleteListing = async (listingId, user, ip) => {
  const listing = await Listing.findOne({ _id: listingId, college: user.college });

  if (!listing) throw new AppError("Listing not found", 404);

  // Admins can delete any listing; others only their own
  if (user.role !== "ADMIN" && listing.seller.toString() !== user._id.toString())
    throw new AppError("You are not authorized to delete this listing", 403);

  listing.status = "EXPIRED";
  await listing.save();

  await AuditLog.create({ action: "DELETE_LISTING", user: user._id, ip });

  return listing;
};

// ─────────────────────────────────────────────────────────────
// My Listings — seller's own listings (any status)
// ─────────────────────────────────────────────────────────────
const getMyListings = async (query, user) => {
  const { skip, limit: lim, page: pg } = paginate(query.page, query.limit);

  const filter = { seller: user._id };

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .select("title price images category condition status views createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .lean({ virtuals: true }),

    Listing.countDocuments(filter),
  ]);

  return {
    listings,
    pagination: {
      total,
      page:       pg,
      limit:      lim,
      totalPages: Math.ceil(total / lim),
      hasNext:    pg < Math.ceil(total / lim),
      hasPrev:    pg > 1,
    },
  };
};

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
};
