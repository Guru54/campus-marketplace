const mongoose = require("mongoose");

const ACTIONS = [
  "REGISTER",
  "VERIFY_OTP",
  "RESEND_OTP",
  "LOGIN",
  "LOGOUT",
  "FORGOT_PASSWORD_REQUEST",
  "RESET_PASSWORD",
  "CHANGE_PASSWORD",
  "CREATE_LISTING",
  "UPDATE_LISTING",
  "DELETE_LISTING",
  "ACCOUNT_LOCKED",
  "USER_BANNED",
  "USER_UNBANNED",
];

const auditLogSchema = new mongoose.Schema(
  {
    // ── Who ───────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── What ──────────────────────────────────────────────
    action: {
      type: String,
      enum: ACTIONS,
      required: true,
    },

    // ── Context ───────────────────────────────────────────
    ip: {
      type: String,
      default: "unknown",
    },

    meta: {
      type: mongoose.Schema.Types.Mixed, // extra details if needed
      default: {},
    },
  },
  {
    timestamps: true, // createdAt = event timestamp
  },
);

// ── Indexes ────────────────────────────────────────────────
auditLogSchema.index({ user: 1, createdAt: -1 }); // user activity timeline
auditLogSchema.index({ action: 1, createdAt: -1 }); // filter by action type

// Auto-expire logs after 90 days (optional — remove if not needed)
auditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
