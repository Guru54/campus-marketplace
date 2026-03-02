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

const {
  createListingSchema,
  updateListingSchema,
  listingQuerySchema,
} = require("../validations/listing.validation");

// All listing routes require auth
router.use(protect);

// ── Feed & Search ──────────────────────────────────────────
router.get("/",    validateQuery(listingQuerySchema), getListings);
router.get("/my",  validateQuery(listingQuerySchema), getMyListings);
router.get("/:id", getListingById);

// ── Mutations ──────────────────────────────────────────────
router.post(
  "/",
  ...uploadListingImages,               // multer → cloudinary → req.body.images
  validate(createListingSchema),
  createListing
);
router.put(   "/:id", validate(updateListingSchema), updateListing);
router.delete("/:id", deleteListing);

module.exports = router;
