const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const logger = require("../utils/logger");

const User = require("../models/User");
const College = require("../models/College");

const ADMIN_EMAIL = "admin@global.org.in";
const ADMIN_PASSWORD = "Admin@1234";
const ADMIN_COLLEGE_NAME =
  "Baderia Global institute of Engineering and Technology Jabalpur";

const seedAdmin = async () => {
  if (!process.env.MONGO_URI) {
    console.error("Error: MONGO_URI is not defined in environment variables.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  logger.log("✅ Connected to MongoDB");

  const college = await College.findOne({ name: ADMIN_COLLEGE_NAME });

  if (!college) {
    console.error(
      `❌ College \"${ADMIN_COLLEGE_NAME}\" not found. Run college seeder first.`,
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      firstName: "Campus",
      lastName: "Admin",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "ADMIN",
      college: college._id,
      isVerified: true,
      isBanned: false,
    },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    },
  );

  logger.log(`👑 Admin ready: ${admin.email}`);
  logger.log(`🏫 College: ${college.name}`);
  logger.log(`🔐 Password: ${ADMIN_PASSWORD}`);

  await mongoose.disconnect();
  logger.log("✅ Admin seeder completed");

  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error("❌ Admin Seeder Error:", err.message);
  process.exit(1);
});