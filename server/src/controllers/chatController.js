const chatService  = require("../services/chat.service");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");

// ─────────────────────────────────────────────────────────────
// @route   POST /api/v1/chats
// @access  Private — buyer initiates
// ─────────────────────────────────────────────────────────────
const startChat = asyncHandler(async (req, res) => {
  const chat = await chatService.startChat(req.body, req.user);
  sendResponse(res, 200, { chat });
});

// ─────────────────────────────────────────────────────────────
// @route   GET /api/v1/chats
// @access  Private — inbox
// ─────────────────────────────────────────────────────────────
const getMyChats = asyncHandler(async (req, res) => {
  const chats = await chatService.getMyChats(req.user);
  sendResponse(res, 200, { chats });
});

// ─────────────────────────────────────────────────────────────
// @route   GET /api/v1/chats/:chatId/messages
// @access  Private — participant only
// ─────────────────────────────────────────────────────────────
const getMessages = asyncHandler(async (req, res) => {
  const result = await chatService.getMessages(req.params.chatId, req.query, req.user);
  sendResponse(res, 200, result);
});

// ─────────────────────────────────────────────────────────────
// @route   POST /api/v1/chats/:chatId/messages
// @access  Private — REST fallback (Socket.io is primary)
// ─────────────────────────────────────────────────────────────
const sendMessage = asyncHandler(async (req, res) => {
  const message = await chatService.sendMessage(
    req.params.chatId,
    req.body.content,
    req.user
  );
  sendResponse(res, 201, { message }, "Message sent");
});

// ─────────────────────────────────────────────────────────────
// @route   DELETE /api/v1/chats/:chatId
// @access  Private
// ─────────────────────────────────────────────────────────────
const deleteChat = asyncHandler(async (req, res) => {
  await chatService.deleteChat(req.params.chatId, req.user);
  sendResponse(res, 200, null, "Chat deleted");
});

module.exports = { startChat, getMyChats, getMessages, sendMessage, deleteChat };
