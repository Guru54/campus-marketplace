const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },

    // ── Auth ──────────────────────────────────────────────
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // ← never return in response
    },

    // ── Avatar ─────────────────────────────────────���──────
    avatar: {
      type: String,
      default: "",
    },

    // ── Role ──────────────────────────────────────────────
    role: {
      type: String,
      enum: ["STUDENT", "ADMIN"],
      default: "STUDENT",
    },

    // ── College ───────────────────────────────────────────
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: [true, "College is required"],
    },

    // ── Verification ──────────────────────────────────────
    isVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
      default: null,
      select: false, // ← never return in response
    },

    otpExpiry: {
      type: Date,
      default: null,
      select: false, // ← never return in response
    },

    // ── Online Status ─────────────────────────────────────
    isOnline: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
      // manually updated on logout / socket disconnect
    },

    socketId: {
      type: String,
      default: null,
      select: false, // ← internal use only
    },

    // ── Account Lock ──────────────────────────────────────
    loginAttempts: {
      type:    Number,
      default: 0,
      select:  false,
    },

    lockUntil: {
      type:    Date,
      default: null,
      select:  false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ────────────────────────────────────────────────
userSchema.index({ college: 1, role: 1 }); // multi-tenant optimization

// ── Instance Method: isLocked ────────────────────────────
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// ── Virtual: Full Name ─────────────────────────────────────
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ── Virtual: DiceBear Avatar ───────────────────────────────
userSchema.virtual("avatarUrl").get(function () {
  if (this.avatar) return this.avatar;
  const seed = encodeURIComponent(`${this.firstName} ${this.lastName}`);
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=6366f1&fontFamily=Inter&fontSize=40&fontWeight=600`;
});

// ── toJSON ─────────────────────────────────────────────────
userSchema.set("toJSON",   { virtuals: true });
userSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("User", userSchema);