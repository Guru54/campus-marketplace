const mongoose = require("mongoose");

const CATEGORY = [
  "BOOKS",
  "ELECTRONICS",
  "FURNITURE",
  "CYCLES",
  "SPORTS",
  "CLOTHING",
  "NOTES",
  "OTHERS",
];

const CONDITION = ["NEW", "LIKE_NEW", "GOOD", "FAIR"];
const STATUS    = ["ACTIVE", "RESERVED", "SOLD", "EXPIRED"];

const listingSchema = new mongoose.Schema(
  {
    // ── Basic Info ─────────────────────────────────────────
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    // ── Images ────────────────────────────────────────────
    images: {
      type: [String], // Cloudinary URLs
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "Maximum 5 images allowed",
      },
      default: [],
    },

    // ── Category & Condition ───────────────────────────────
    category: {
      type: String,
      enum: CATEGORY,
      required: [true, "Category is required"],
    },

    condition: {
      type: String,
      enum: CONDITION,
      required: [true, "Condition is required"],
    },

    // ── Relations ─────────────────────────────────────────
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      // ⚠ Always set from req.user.college in controller
      // Never trust frontend for this field
    },

    // ── Status ────────────────────────────────────────────
    status: {
      type: String,
      enum: STATUS,
      default: "ACTIVE",
    },

    // ── Expiry ────────────────────────────────────────────
    expiresAt: {
      type: Date,
      default: null,
      // future cron job:
      // if expiresAt < now → status = EXPIRED
    },

    // ── Extra ─────────────────────────────────────────────
    isNegotiable: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
      // no index needed — just a counter
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ────────────────────────────────────────────────
listingSchema.index({ college: 1, status: 1 }); // most common query
listingSchema.index({ seller: 1 });              // my listings
listingSchema.index({ category: 1 });            // filter by category
listingSchema.index({ createdAt: -1 });          // sort newest first

// ── Virtual: isFree ────────────────────────────────────────
listingSchema.virtual("isFree").get(function () {
  return this.price === 0;
});

// ── toJSON ─────────────────────────────────────────────────
listingSchema.set("toJSON",   { virtuals: true });
listingSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Listing", listingSchema);