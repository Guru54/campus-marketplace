const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema(
  {
    // ── Basic Info ─────────────────────────────────────────
    name: {
      type: String,
      required: [true, "College name is required"],
      trim: true,
      unique: true,   // ← index already created here ✅
    },

    domain: {
      type: String,
      required: [true, "College domain is required"],
      trim: true,
      lowercase: true,
      unique: true,   // ← index already created here ✅
      match: [
        /^[a-z0-9.-]+\.[a-z]{2,}$/,
        "Invalid domain format",
      ],
    },

    // ── Location ───────────────────────────────────────────
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },

    // ── Status ─────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ────────────────────────────────────────────────
// name  → unique: true already handles it ✅ removed duplicate
// domain → unique: true already handles it ✅ removed duplicate
collegeSchema.index({ city: 1, state: 1 }); // ← only this needed

module.exports = mongoose.model("College", collegeSchema);