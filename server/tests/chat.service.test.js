const dbSetup = require("./setup/db");
const { createCollege, createVerifiedUser } = require("./setup/fixtures");
const chatService = require("../src/services/chat.service");
const Listing = require("../src/models/Listing");
const Chat = require("../src/models/Chat");
const Message = require("../src/models/Message");

beforeAll(async () => {
  await dbSetup.connect();
});

afterEach(async () => {
  await dbSetup.clearDatabase();
});

afterAll(async () => {
  await dbSetup.closeDatabase();
});

// Shared scenario: a college, a seller with one active listing, and a buyer.
const buildScenario = async () => {
  const college = await createCollege();
  const { user: seller } = await createVerifiedUser({ college: college._id });
  const { user: buyer } = await createVerifiedUser({ college: college._id });

  const listing = await Listing.create({
    title: "Used Physics Textbook",
    description: "Barely used, no markings",
    price: 300,
    category: "BOOKS",
    condition: "GOOD",
    seller: seller._id,
    college: college._id,
    status: "ACTIVE",
  });

  return { college, seller, buyer, listing };
};

describe("chatService.startChat", () => {
  it("creates a new chat between buyer and seller", async () => {
    const { buyer, seller, listing } = await buildScenario();

    const chat = await chatService.startChat(
      { listingId: listing._id, sellerId: seller._id },
      buyer,
    );

    expect(chat.listing._id.toString()).toBe(listing._id.toString());
    expect(chat.participants.map((p) => p._id.toString()).sort()).toEqual(
      [buyer._id.toString(), seller._id.toString()].sort(),
    );
  });

  it("returns the existing chat instead of creating a duplicate", async () => {
    const { buyer, seller, listing } = await buildScenario();

    const first = await chatService.startChat(
      { listingId: listing._id, sellerId: seller._id },
      buyer,
    );
    const second = await chatService.startChat(
      { listingId: listing._id, sellerId: seller._id },
      buyer,
    );

    expect(second._id.toString()).toBe(first._id.toString());
    expect(await Chat.countDocuments()).toBe(1);
  });

  it("rejects starting a chat on your own listing", async () => {
    const { seller, listing } = await buildScenario();

    await expect(
      chatService.startChat(
        { listingId: listing._id, sellerId: seller._id },
        seller,
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("rejects a listing that doesn't exist or isn't active", async () => {
    const { buyer, seller, listing } = await buildScenario();
    listing.status = "SOLD";
    await listing.save();

    await expect(
      chatService.startChat(
        { listingId: listing._id, sellerId: seller._id },
        buyer,
      ),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("rejects a listing from a different college (campus isolation)", async () => {
    const { buyer, seller, listing } = await buildScenario();
    const otherCollege = await createCollege({
      name: "Other Institute",
      domain: "other.edu",
    });
    buyer.college = otherCollege._id;

    await expect(
      chatService.startChat(
        { listingId: listing._id, sellerId: seller._id },
        buyer,
      ),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("chatService.sendMessage + getMessages", () => {
  it("sends a message and updates the chat preview", async () => {
    const { buyer, seller, listing } = await buildScenario();
    const chat = await chatService.startChat(
      { listingId: listing._id, sellerId: seller._id },
      buyer,
    );

    const message = await chatService.sendMessage(
      chat._id,
      "Is this still available?",
      buyer,
    );

    expect(message.content).toBe("Is this still available?");

    const updatedChat = await Chat.findById(chat._id);
    expect(updatedChat.lastMessage).toBe("Is this still available?");
    expect(updatedChat.lastMessageAt).not.toBeNull();
  });

  it("truncates the chat preview for long messages", async () => {
    const { buyer, seller, listing } = await buildScenario();
    const chat = await chatService.startChat(
      { listingId: listing._id, sellerId: seller._id },
      buyer,
    );
    const longMessage = "a".repeat(120);

    await chatService.sendMessage(chat._id, longMessage, buyer);

    const updatedChat = await Chat.findById(chat._id);
    expect(updatedChat.lastMessage).toHaveLength(60);
    expect(updatedChat.lastMessage.endsWith("...")).toBe(true);
  });

  it("rejects sending a message to a chat you're not part of", async () => {
    const { buyer, seller, listing, college } = await buildScenario();
    const { user: outsider } = await createVerifiedUser({
      college: college._id,
    });
    const chat = await chatService.startChat(
      { listingId: listing._id, sellerId: seller._id },
      buyer,
    );

    await expect(
      chatService.sendMessage(chat._id, "Hi!", outsider),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("marks the recipient's unread messages as read when they fetch the chat", async () => {
    const { buyer, seller, listing } = await buildScenario();
    const chat = await chatService.startChat(
      { listingId: listing._id, sellerId: seller._id },
      buyer,
    );
    await chatService.sendMessage(chat._id, "Is this still available?", buyer);

    // Seller opens the chat — buyer's message should flip to read
    await chatService.getMessages(chat._id, {}, seller);

    const messages = await Message.find({ chat: chat._id });
    expect(messages.every((m) => m.isRead)).toBe(true);
  });
});

describe("chatService.getMyChats", () => {
  it("reports the correct unread count per chat", async () => {
    const { buyer, seller, listing } = await buildScenario();
    const chat = await chatService.startChat(
      { listingId: listing._id, sellerId: seller._id },
      buyer,
    );
    await chatService.sendMessage(chat._id, "Message 1", buyer);
    await chatService.sendMessage(chat._id, "Message 2", buyer);

    const sellerInbox = await chatService.getMyChats(seller);
    expect(sellerInbox[0].unread).toBe(2);

    const buyerInbox = await chatService.getMyChats(buyer);
    expect(buyerInbox[0].unread).toBe(0); // sender never counts their own messages as unread
  });

  it("excludes chats the user has soft-deleted", async () => {
    const { buyer, seller, listing } = await buildScenario();
    const chat = await chatService.startChat(
      { listingId: listing._id, sellerId: seller._id },
      buyer,
    );

    await chatService.deleteChat(chat._id, buyer);

    const buyerInbox = await chatService.getMyChats(buyer);
    expect(buyerInbox).toHaveLength(0);

    // Soft delete is per-user — the seller should still see it
    const sellerInbox = await chatService.getMyChats(seller);
    expect(sellerInbox).toHaveLength(1);
  });
});

describe("chatService.deleteChat", () => {
  it("rejects deleting a chat you're not part of", async () => {
    const { buyer, seller, listing, college } = await buildScenario();
    const { user: outsider } = await createVerifiedUser({
      college: college._id,
    });
    const chat = await chatService.startChat(
      { listingId: listing._id, sellerId: seller._id },
      buyer,
    );

    await expect(
      chatService.deleteChat(chat._id, outsider),
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
