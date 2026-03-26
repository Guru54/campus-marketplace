const { Server } = require("socket.io");
const jwt        = require("jsonwebtoken");
const User       = require("../models/User");
const Chat       = require("../models/Chat");
const Message    = require("../models/Message");

// ── Socket Auth Middleware ─────────────────────────────────
const socketAuth = async (socket, next) => {
  try {
    // Token from cookie or auth header
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.cookie
        ?.split(";")
        .find((c) => c.trim().startsWith("token="))
        ?.split("=")[1];

    if (!token) return next(new Error("Authentication required"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.userId).select("-password -otp -otpExpiry");

    if (!user || !user.isVerified) return next(new Error("Unauthorized"));

    socket.user = user;
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
};

// ─────────────────────────────────────────────────────────────
const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin:      process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on("connection", async (socket) => {
    const user = socket.user;
    const logger = require('../utils/logger');
    logger.log(`🔌 Connected: ${user.firstName} ${user.lastName} [${socket.id}]`);

    // ── Mark user online ─────────────────────────────────
    await User.findByIdAndUpdate(user._id, {
      isOnline: true,
      socketId: socket.id,
    });

    // Broadcast online status to same-college users
    socket.broadcast.emit("user_online", { userId: user._id });

    // ── Join Chat Room ────────────────────────────────────
    // Client emits: { chatId }
    socket.on("join_chat", async ({ chatId }) => {
      try {
        const chat = await Chat.findOne({
          _id:          chatId,
          participants: user._id,
        });
        if (!chat) return socket.emit("error", { message: "Chat not found" });

        socket.join(chatId);
        logger.log("User joined room:", chatId); // Debug log
        socket.emit("joined_chat", { chatId });
      } catch (err) {
        socket.emit("error", { message: "Could not join chat" });
      }
    });

    // ── Leave Chat Room ───────────────────────────────────
    socket.on("leave_chat", ({ chatId }) => {
      socket.leave(chatId);
    });

    // ── Send Message ──────────────────────────────────────
    // Client emits: { chatId, content }
    socket.on("send_message", async ({ chatId, content, clientId }) => {
      try {
        if (!content?.trim() || content.length > 1000)
          return socket.emit("error", { message: "Invalid message" });

        const chat = await Chat.findOne({
          _id:          chatId,
          participants: user._id,
        });
        if (!chat) return socket.emit("error", { message: "Chat not found" });

        // Save message, include clientId if provided
        const message = await Message.create({
          chat:    chatId,
          sender:  user._id,
          content: content.trim(),
          ...(clientId ? { clientId } : {})
        });

        // Update chat preview
        chat.lastMessage   = content.length > 60 ? content.slice(0, 57) + "..." : content.trim();
        chat.lastMessageAt = new Date();
        await chat.save();

        await message.populate("sender", "firstName lastName avatar");
        // Convert to plain object so clientId survives serialization
        const messageObj = message.toObject();
        if (clientId) messageObj.clientId = clientId;

        // Emit plain object, not the Mongoose document, and include chatId and clientId
        io.to(chatId).emit("new_message", {
          ...messageObj,
          chatId,
          clientId
        });

        // Push inbox update to the other participant (who may not be in room)
        const otherId = chat.participants.find(
          (p) => p.toString() !== user._id.toString()
        );
        // Fast socket lookup instead of DB query
        const otherSocket = [...io.sockets.sockets.values()]
          .find(s => s.user && s.user._id.toString() === otherId.toString());
        if (otherSocket) {
          io.to(otherSocket.id).emit("inbox_update", {
            chatId,
            lastMessage:   chat.lastMessage,
            lastMessageAt: chat.lastMessageAt,
          });
        }
      } catch (err) {
        socket.emit("error", { message: "Message could not be sent" });
      }
    });

    // ── Typing Indicators ─────────────────────────────────
    socket.on("typing", ({ chatId }) => {
      socket.to(chatId).emit("typing", {
        userId: user._id,
        typingChatId: chatId
      });
    });
    socket.on("stop_typing", ({ chatId }) => {
      socket.to(chatId).emit("stop_typing", {
        userId: user._id,
        typingChatId: chatId
      });
    });
    // ── Event logging (controlled by logger) ─
    socket.onAny((event, ...args) => {
      logger.log("EVENT:", event, args);
    });

    // ── Mark Messages Read ────────────────────────────────
    // Client emits: { chatId }
    socket.on("mark_read", async ({ chatId }) => {
      try {
        await Message.updateMany(
          { chat: chatId, sender: { $ne: user._id }, isRead: false },
          { isRead: true }
        );
        socket.to(chatId).emit("messages_read", { chatId, readBy: user._id });
      } catch {
        // non-critical, ignore
      }
    });

    // ── Disconnect ────────────────────────────────────────
    socket.on("disconnect", async () => {
      logger.log(`🔌 Disconnected: ${user.firstName} ${user.lastName}`);

      await User.findByIdAndUpdate(user._id, {
        isOnline: false,
        lastSeen: new Date(),
        socketId: null,
      });

      socket.broadcast.emit("user_offline", {
        userId:   user._id,
        lastSeen: new Date(),
      });
    });
  });

  return io;
};

module.exports = initSocket;
