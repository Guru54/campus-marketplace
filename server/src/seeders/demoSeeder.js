/*
 Creates 3 verified demo users + sample listings
 for Baderia Global Institute of Engineering and Technology
*/

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const logger = require("../utils/logger");

const User = require("../models/User");
const College = require("../models/College");
const Listing = require("../models/Listing");

const DEMO_PASSWORD = "Demo@1234";

const DEMO_COLLEGE_NAME =
  "Baderia Global institute of Engineering and Technology Jabalpur";

// ── Demo Users ────────────────────────────────────────────
const DEMO_USERS = [
  {
    firstName: "Aarav",
    lastName: "Singh",
    email: "aarav@global.org.in",
    role: "STUDENT",
  },

  {
    firstName: "Meera",
    lastName: "Joshi",
    email: "meera@global.org.in",
    role: "STUDENT",
  },

  {
    firstName: "Kabir",
    lastName: "Verma",
    email: "kabir@global.org.in",
    role: "STUDENT",
  },
];

// ── Demo Listings ─────────────────────────────────────────
const DEMO_LISTINGS = [
  {
    sellerIdx: 0,

    title: "Dell Inspiron Laptop i5 11th Gen",

    description:
      "Used for 1 year. Works perfectly. Charger included. Ideal for coding and college work.",

    price: 32000,

    category: "ELECTRONICS",

    condition: "GOOD",

    isNegotiable: true,

    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
    ],
  },

  {
    sellerIdx: 0,

    title: "Engineering Mathematics Book Set",

    description:
      "Semester 1 + Semester 2 books in excellent condition. Very useful for first year students.",

    price: 450,

    category: "BOOKS",

    condition: "LIKE_NEW",

    isNegotiable: true,

    images: [
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1200&auto=format&fit=crop",
    ],
  },

  {
    sellerIdx: 1,

    title: "Study Table for Hostel Room",

    description:
      "Compact wooden study table with side shelf. Perfect for hostel setup.",

    price: 1400,

    category: "FURNITURE",

    condition: "GOOD",

    isNegotiable: false,

    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
    ],
  },

  {
    sellerIdx: 1,

    title: "Boat Rockerz 450 Headphones",

    description:
      "Battery backup is excellent. Slight cosmetic scratches but sound quality is perfect.",

    price: 900,

    category: "ELECTRONICS",

    condition: "FAIR",

    isNegotiable: true,

    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
    ],
  },

  {
    sellerIdx: 2,

    title: "DSA Handwritten Notes",

    description:
      "Complete handwritten DSA notes covering arrays, linked lists, trees, graphs and DP.",

    price: 0,

    category: "NOTES",

    condition: "LIKE_NEW",

    isNegotiable: false,

    images: [
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop",
    ],
  },

  {
    sellerIdx: 2,

    title: "Hero Ranger Cycle",

    description:
      "Good condition cycle used for daily college commute. Brakes and tyres recently replaced.",

    price: 3500,

    category: "CYCLES",

    condition: "GOOD",

    isNegotiable: true,

    images: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1200&auto=format&fit=crop",
    ],
  },
];

// ──────────────────────────────────────────────────────────
const seed = async () => {
  await mongoose.connect("mongodb+srv://gurusRezell:llmMOn7JiBO7Iq5s@cluster1.2xggvwv.mongodb.net/?appName=cluster1");

  logger.log("✅ Connected to MongoDB");

  // ── Find College ───────────────────────────────────────
  const college = await College.findOne({
    name: DEMO_COLLEGE_NAME,
  });

  if (!college) {
    console.error(
      `❌ College "${DEMO_COLLEGE_NAME}" not found.\nRun college seeder first.`
    );

    process.exit(1);
  }

  logger.log(`🏫 College Found: ${college.name}`);

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 12);

  const createdUsers = [];

  // ── Create / Upsert Users ──────────────────────────────
  for (const u of DEMO_USERS) {
    let user = await User.findOne({ email: u.email });

    if (user) {
      logger.log(`👤 User already exists: ${u.email}`);
    } else {
      user = await User.create({
        ...u,
        password: hashedPassword,
        college: college._id,
        isVerified: true,
      });

      logger.log(`✅ Created user: ${u.email}`);
    }

    createdUsers.push(user);
  }

  // ── Remove old demo listings ───────────────────────────
  const demoUserIds = createdUsers.map((u) => u._id);

  const deleted = await Listing.deleteMany({
    seller: { $in: demoUserIds },
  });

  if (deleted.deletedCount > 0) {
    logger.log(`🗑 Removed ${deleted.deletedCount} old listings`);
  }

  // ── Create Listings ────────────────────────────────────
  for (const l of DEMO_LISTINGS) {
    const seller = createdUsers[l.sellerIdx];

    await Listing.create({
      title: l.title,
      description: l.description,
      price: l.price,
      category: l.category,
      condition: l.condition,
      isNegotiable: l.isNegotiable,
      images: l.images,
      status: "ACTIVE",
      seller: seller._id,
      college: college._id,
    });

    logger.log(`📦 Listing created: ${l.title}`);
  }

  // ── Summary ────────────────────────────────────────────
  logger.log(`
╔══════════════════════════════════════════════════════╗
║                 DEMO ACCOUNTS READY                 ║
╠══════════════════════════════════════════════════════╣
║ College : Baderia Global Institute                  ║
║ Password: ${DEMO_PASSWORD.padEnd(30)}║
╠══════════════════════════════════════════════════════╣
║ aarav@global.org.in  → Aarav Singh                  ║
║ meera@global.org.in  → Meera Joshi                  ║
║ kabir@global.org.in  → Kabir Verma                  ║
╚══════════════════════════════════════════════════════╝
`);

  await mongoose.disconnect();

  logger.log("✅ Seeder completed");

  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seeder Error:", err.message);

  process.exit(1);
});