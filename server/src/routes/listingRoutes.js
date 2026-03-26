const express  = require("express");
const router   = express.Router();

const {
  getListings,
  getMyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} = require("../controllers/listingController");

const { protect }                    = require("../middleware/authMiddleware");
const validate                       = require("../middleware/validate");
const { validateQuery }              = require("../middleware/validate");
const { uploadListingImages }        = require("../middleware/uploadMiddleware");
const asyncHandler                   = require("../utils/asyncHandler");
const Listing                        = require("../models/Listing");

const {
  createListingSchema,
  updateListingSchema,
  listingQuerySchema,
} = require("../validations/listing.validation");

const CATEGORY_EMOJI = {
  BOOKS: "📚", ELECTRONICS: "💻", FURNITURE: "🪑",
  CYCLES: "🚲", SPORTS: "⚽", CLOTHING: "👕",
  NOTES: "📝", OTHERS: "📦",
};

// All listing routes require auth
router.use(protect);

// ── Feed & Search ──────────────────────────────────────────
router.get("/",    validateQuery(listingQuerySchema), getListings);
router.get("/my",  validateQuery(listingQuerySchema), getMyListings);

// ── Search Suggestions ─────────────────────────────────────
// Must be before /:id route to avoid param capture
router.get("/suggestions", asyncHandler(async (req, res) => {
  const { q, limit = 6 } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json({ status: "success", data: { suggestions: [] } });
  }

  const suggestions = await Listing.find({
    college: req.user.college,
    status:  "ACTIVE",
    title:   { $regex: q.trim(), $options: "i" },
  })
    .select("title price images category")
    .limit(Math.min(Number(limit) || 6, 10))
    .lean();

  const result = suggestions.map((s) => ({
    ...s,
    categoryEmoji: CATEGORY_EMOJI[s.category] || "📦",
  }));

  res.json({ status: "success", data: { suggestions: result } });
}));

router.get("/:id", getListingById);

// ── Mutations ──────────────────────────────────────────────
router.post(
  "/",
  ...uploadListingImages,               // multer → cloudinary → req.body.images
  validate(createListingSchema),
  createListing
);
router.put(
  "/:id",
  ...uploadListingImages,
  validate(updateListingSchema),
  updateListing
);
router.delete("/:id", deleteListing);

module.exports = router;
