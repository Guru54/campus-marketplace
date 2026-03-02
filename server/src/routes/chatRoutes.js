const express = require("express");
const router  = express.Router();

const {
  startChat,
  getMyChats,
  getMessages,
  sendMessage,
  deleteChat,
} = require("../controllers/chatController");

const { protect }  = require("../middleware/authMiddleware");
const validate     = require("../middleware/validate");
const { validateQuery } = require("../middleware/validate");
const { startChatSchema, sendMessageSchema } = require("../validations/chat.validation");

// All chat routes require auth
router.use(protect);

// ── Inbox ──────────────────────────────────────────────────
router.get("/",    getMyChats);

// ── Start or get chat ──────────────────────────────────────
router.post("/",   validate(startChatSchema), startChat);

// ── Messages ───────────────────────────────────────────────
router.get(   "/:chatId/messages", getMessages);
router.post(  "/:chatId/messages", validate(sendMessageSchema), sendMessage);

// ── Delete ─────────────────────────────────────────────────
router.delete("/:chatId", deleteChat);

module.exports = router;
