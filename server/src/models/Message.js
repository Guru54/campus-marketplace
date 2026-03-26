const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // ── Relations ─────────────────────────────────────────
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Content ───────────────────────────────────────────
    content: {
      type: String,
      required: [true, "Message cannot be empty"],
      trim: true,
      maxlength: [1000, "Message too long"],
    },

    // ── Read Status ───────────────────────────────────────
    isRead: {
      type: Boolean,
      default: false,
      // unread badge query:
      // countDocuments({ chat, isRead: false, sender: { $ne: userId } })
    },

    // ── Client Message ID for deduplication ──────────────
    clientId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ────────────────────────────────────────────────
messageSchema.index({ chat: 1, createdAt: 1 }); // fetch messages in order
messageSchema.index({ sender: 1 });              // messages by user
messageSchema.index({ chat: 1, isRead: 1 });     // unread count query

module.exports = mongoose.model("Message", messageSchema);