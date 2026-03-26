const Chat     = require("../models/Chat");
const Message  = require("../models/Message");
const Listing  = require("../models/Listing");
const AppError = require("../utils/AppError");
const paginate = require("../utils/paginate");

// ─────────────────────────────────────────────────────────────
// Start or get existing chat (buyer opens chat on a listing)
// ─────────────────────────────────────────────────────────────
const startChat = async (data, buyer) => {
  const { listingId, sellerId } = data;

  // Validate listing exists and is in same college
  const listing = await Listing.findOne({
    _id:     listingId,
    college: buyer.college,
    status:  "ACTIVE",
  });
  if (!listing) throw new AppError("Listing not found or unavailable", 404);

  // Buyer cannot chat with themselves
  if (listing.seller.toString() === buyer._id.toString())
    throw new AppError("You cannot start a chat on your own listing", 400);

  // Find existing chat or create new one
  let chat = await Chat.findOne({
    listing:      listingId,
    participants: { $all: [buyer._id, sellerId] },
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [buyer._id, sellerId],
      listing:      listingId,
      college:      buyer.college,
    });
  }

  await chat.populate([
    { path: "participants", select: "firstName lastName avatar isOnline lastSeen" },
    { path: "listing",      select: "title price images status" },
  ]);

  return chat;
};

// ─────────────────────────────────────────────────────────────
// Get all my chats (inbox) — sorted by lastMessageAt
// ─────────────────────────────────────────────────────────────
const getMyChats = async (user) => {
  const chats = await Chat.find({
    participants: user._id,
    deletedBy:    { $ne: user._id },
  })
    .populate("participants", "firstName lastName avatar isOnline lastSeen")
    .populate("listing",      "title price images status")
    .sort({ lastMessageAt: -1 })
    .lean({ virtuals: true });

  // Attach unread count per chat
  const chatsWithUnread = await Promise.all(
    chats.map(async (chat) => {
      const unread = await Message.countDocuments({
        chat:   chat._id,
        sender: { $ne: user._id },
        isRead: false,
      });
      return { ...chat, unread };
    })
  );

  return chatsWithUnread;
};

// ─────────────────────────────────────────────────────────────
// Get messages for a chat (paginated — oldest first)
// ─────────────────────────────────────────────────────────────
const getMessages = async (chatId, query, user) => {
  // Verify user is participant
  const chat = await Chat.findOne({
    _id:          chatId,
    participants: user._id,
    deletedBy:    { $ne: user._id },
  })
    .populate("participants", "firstName lastName avatar isOnline lastSeen")
    .populate("listing", "title price images status");
  if (!chat) throw new AppError("Chat not found", 404);

  const { skip, limit: lim, page: pg } = paginate(query.page, query.limit || 30);

  const [messages, total] = await Promise.all([
    Message.find({ chat: chatId })
      .populate("sender", "firstName lastName avatar")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(lim)
      .lean({ virtuals: true }),

    Message.countDocuments({ chat: chatId }),
  ]);

  // Mark unread messages as read
  await Message.updateMany(
    { chat: chatId, sender: { $ne: user._id }, isRead: false },
    { isRead: true }
  );

  return {
    chat,
    messages,
    pagination: {
      total,
      page:       pg,
      limit:      lim,
      totalPages: Math.ceil(total / lim),
      hasNext:    pg < Math.ceil(total / lim),
      hasPrev:    pg > 1,
    },
  };
};

// ─────────────────────────────────────────────────────────────
// Send a message (REST fallback — Socket.io is primary)
// ─────────────────────────────────────────────────────────────
const sendMessage = async (chatId, content, sender) => {
  const chat = await Chat.findOne({
    _id:          chatId,
    participants: sender._id,
  });
  if (!chat) throw new AppError("Chat not found", 404);

  const message = await Message.create({
    chat:    chatId,
    sender:  sender._id,
    content,
  });

  // Update chat preview
  chat.lastMessage   = content.length > 60 ? content.slice(0, 57) + "..." : content;
  chat.lastMessageAt = new Date();
  await chat.save();

  await message.populate("sender", "firstName lastName avatar");

  return message;
};

// ─────────────────────────────────────────────────────────────
// Delete chat for current user (soft delete)
// ─────────────────────────────────────────────────────────────
const deleteChat = async (chatId, user) => {
  const chat = await Chat.findOne({
    _id:          chatId,
    participants: user._id,
  });
  if (!chat) throw new AppError("Chat not found", 404);

  if (!chat.deletedBy.includes(user._id)) {
    chat.deletedBy.push(user._id);
    await chat.save();
  }
};

module.exports = { startChat, getMyChats, getMessages, sendMessage, deleteChat };
