const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    // ── Participants ───────────────────────────────────────
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      validate: {
        validator: (arr) => arr.length === 2,
        message: "Chat must have exactly 2 participants",
      },
    },

    // ── Relations ─────────────────────────────────────────
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      // ⚠ Always set from req.user.college
      // Double campus isolation safety
    },

    // ── Last Message Preview ───────────────────────────────
    lastMessage: {
      type: String,
      default: "",
      maxlength: [200, "Last message preview too long"],
    },

    lastMessageAt: {
      type: Date,
      default: null,
      // inbox sorting → newest first
    },

    // ── Soft Delete ───────────────────────────────────────
    deletedBy: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
      // Per-user soft delete
      // Query: { deletedBy: { $ne: userId } }
    },
  },
  {
    timestamps: true,
  }
);

// ── Pre-save Hook ──────────────────────────────────────────
// Sort participants before save
// Guarantees [A,B] and [B,A] treated as same
// Note: Mongoose 7+ pre-hooks use async — no `next` callback
chatSchema.pre("save", async function () {
  if (this.isModified("participants")) {
    this.participants.sort((a, b) =>
      a.toString().localeCompare(b.toString())
    );
  }
});

// ── Indexes ──────────────────────────���─────────────────────
chatSchema.index({ participants: 1 });        // fetch user's chats
chatSchema.index({ listing: 1 });             // chats per listing
chatSchema.index({ college: 1 });             // campus isolation
chatSchema.index({ lastMessageAt: -1 });      // inbox sort newest first

// ── Compound Unique ────────────────────────────────────────
// Pre-save sorts participants → [A,B] always
// Duplicate chat impossible ✅
chatSchema.index(
  { listing: 1, participants: 1 },
  { unique: true }
);

module.exports = mongoose.model("Chat", chatSchema);