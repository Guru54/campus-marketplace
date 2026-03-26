/*
 Creates 3 verified demo users + sample listings — all at the same college.
*/

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const dotenv   = require("dotenv");

dotenv.config();

const logger = require('../utils/logger');

const User    = require("../models/User");
const College = require("../models/College");
const Listing = require("../models/Listing");

const DEMO_PASSWORD      = "Demo@1234";   // same password for all demo accounts
const DEMO_COLLEGE_NAME  = "Pimpri Chinchwad College of Engineering";

// ── Demo Users ────────────────────────────────────────────
const DEMO_USERS = [
  {
    firstName: "Arjun",
    lastName:  "Sharma",
    email:     "arjun.demo@rezell.dev",
    role:      "STUDENT",
  },
  {
    firstName: "Priya",
    lastName:  "Patel",
    email:     "priya.demo@rezell.dev",
    role:      "STUDENT",
  },
  {
    firstName: "Rahul",
    lastName:  "Mehta",
    email:     "rahul.demo@rezell.dev",
    role:      "STUDENT",
  },
];

// ── Demo Listings (seller index → which demo user owns it) ──
const DEMO_LISTINGS = [
  {
    sellerIdx:   0,
    title:       "Engineering Mathematics — R.K. Jain (3rd Edition)",
    description: "Bought last semester, barely used. All pages intact, no annotations.\nGreat condition — like new.",
    price:       180,
    category:    "BOOKS",
    condition:   "LIKE_NEW",
    isNegotiable: true,
    images:      [],
  },
  {
    sellerIdx:   0,
    title:       "JBL Tune 510BT Wireless Headphones",
    description: "Selling because I upgraded. Works perfectly, sound is excellent.\nComes with original cable and pouch.",
    price:       1400,
    category:    "ELECTRONICS",
    condition:   "GOOD",
    isNegotiable: true,
    images:      [],
  },
  {
    sellerIdx:   1,
    title:       "Hero Lectro E-Cycle — City 24",
    description: "Electric cycle in great working condition. Battery holds 40km charge.\nUsed for 8 months. Selling due to shifting to hostel.",
    price:       8500,
    category:    "CYCLES",
    condition:   "GOOD",
    isNegotiable: false,
    images:      [],
  },
  {
    sellerIdx:   1,
    title:       "Study Table with Shelf",
    description: "Solid wood study table with a top shelf. Fits in hostel rooms.\nLight scratches on surface, otherwise perfect.",
    price:       1200,
    category:    "FURNITURE",
    condition:   "FAIR",
    isNegotiable: true,
    images:      [],
  },
  {
    sellerIdx:   2,
    title:       "Data Structures & Algorithms Notes (Handwritten)",
    description: "Complete DSA handwritten notes — semester 3. Covers Arrays, Linked List, Trees, Graphs, DP.\n36 pages, neat writing. Very helpful for exams.",
    price:       0,
    category:    "NOTES",
    condition:   "LIKE_NEW",
    isNegotiable: false,
    images:      [],
  },
  {
    sellerIdx:   2,
    title:       "Casio FX-991EX Scientific Calculator",
    description: "All functions work perfectly. Minor scuff on the back cover, display is crystal clear.\nIncludes cover and battery.",
    price:       650,
    category:    "ELECTRONICS",
    condition:   "GOOD",
    isNegotiable: true,
    images:      [],
  },
];

// ─────────────────────────────────────────────────────────────
const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  logger.log("Connected to MongoDB");

  // ── Find the demo college ────────────────────────────────
  const college = await College.findOne({ name: DEMO_COLLEGE_NAME });
  if (!college) {
    console.error(`❌  College "${DEMO_COLLEGE_NAME}" not found.\n    Run the college seeder first: node src/seeders/collegeSeeders.js`);
    process.exit(1);
  }
  logger.log(`🏫  College: ${college.name} (${college.city})`);

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 12);
  const createdUsers   = [];

  // ── Upsert demo users ────────────────────────────────────
  for (const u of DEMO_USERS) {
    let user = await User.findOne({ email: u.email });

    if (user) {
      logger.log(`👤  User already exists: ${u.email}`);
    } else {
      user = await User.create({
        ...u,
        password:   hashedPassword,
        college:    college._id,
        isVerified: true,          // skip OTP for demo accounts
        role:       u.role,
      });
      logger.log(`✅  Created user: ${u.firstName} ${u.lastName} <${u.email}>`);
    }

    createdUsers.push(user);
  }

  // ── Remove old demo listings ─────────────────────────────
  const demoUserIds = createdUsers.map((u) => u._id);
  const deleted     = await Listing.deleteMany({ seller: { $in: demoUserIds } });
  if (deleted.deletedCount > 0)
    logger.log(`🗑️   Removed ${deleted.deletedCount} old demo listing(s)`);

  // ── Create demo listings ─────────────────────────────────
  for (const l of DEMO_LISTINGS) {
    const seller = createdUsers[l.sellerIdx];
    await Listing.create({
      title:        l.title,
      description:  l.description,
      price:        l.price,
      category:     l.category,
      condition:    l.condition,
      isNegotiable: l.isNegotiable,
      images:       l.images,
      status:       "ACTIVE",
      seller:       seller._id,
      college:      college._id,
    });
    logger.log(`📦  Listing created: "${l.title}" by ${seller.firstName}`);
  }

  // ── Summary ──────────────────────────────────────────────
  logger.log(`\n╔═══════════════════════════════════════════════════════╗\n║              DEMO ACCOUNTS READY                      ║\n╠═══════════════════════════════════════════════════════╣\n║  College : ${college.name.padEnd(43)}║\n║  Password: ${DEMO_PASSWORD.padEnd(43)}║\n╠═══════════════════════════════════════════════════════╣\n║  arjun.demo@rezell.dev  → Arjun Sharma                ║\n║  priya.demo@rezell.dev  → Priya Patel                 ║\n║  rahul.demo@rezell.dev  → Rahul Mehta                 ║\n╚═══════════════════════════════════════════════════════╝\n`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeder error:", err.message);
  process.exit(1);
});
